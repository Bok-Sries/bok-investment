/*
 * AI 예측 엔진 (앙상블 + 워크포워드 검증)
 *
 * GitHub 공개 프로젝트들의 검증된 기법을 순수 JS로 구현:
 *  - 서브모델 앙상블을 "최근 정확도 기반 지수감쇠 가중치"로 결합 (sankeer28/stock-predictor 방식)
 *  - 워크포워드 검증으로 look-ahead bias 제거 (alisonmitchell/Stock-Prediction 방식)
 *  - 칼만 필터 추세 추정 (rezeroworld/Stock_Forecasting 방식)
 *  - 몬테카를로 부트스트랩 예측구간 (jkclem/Monte Carlo prediction intervals 방식)
 *  - EWMA(RiskMetrics λ=0.94) 변동성, 시장 레짐(국면) 감지
 *
 * app.js 보다 먼저 로드되어야 하며 window.AiEngine.predict(indicators)를 노출한다.
 * 입력 indicators: calculateAdvancedIndicators() 결과 (close/rsi/macd/macdSignal/sma20/volumeRatio/stochK/atr 포함)
 */
(function () {
  "use strict";

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const mean = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);
  const stdev = (arr) => {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
  };

  // 결정적 난수(mulberry32): 같은 데이터면 항상 같은 예측구간이 나오도록 시드 고정
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFromSeries(closes) {
    let h = 2166136261;
    for (let i = 0; i < closes.length; i += 1) {
      h ^= Math.round(closes[i] * 100) & 0xffff;
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function returnsOf(closes) {
    const out = [];
    for (let i = 1; i < closes.length; i += 1) out.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    return out;
  }

  // EWMA 변동성 (RiskMetrics λ=0.94)
  function ewmaVolatility(rets, lambda = 0.94) {
    if (!rets.length) return 0;
    let v = rets[0] ** 2;
    for (let i = 1; i < rets.length; i += 1) v = lambda * v + (1 - lambda) * rets[i] ** 2;
    return Math.sqrt(v);
  }

  /* ---------------- 서브모델: closes[0..end] 만 사용해 다음날 수익률 예측 ---------------- */

  // 1) Holt 이중지수평활 (추세 모델)
  function holtModel(closes, end) {
    const n = end + 1;
    if (n < 10) return 0;
    const alpha = 0.35, beta = 0.15;
    let level = closes[0];
    let trend = closes[1] - closes[0];
    for (let i = 1; i < n; i += 1) {
      const prevLevel = level;
      level = alpha * closes[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
    }
    const forecast = level + trend;
    return clamp((forecast - closes[end]) / closes[end], -0.08, 0.08);
  }

  // 2) 칼만 필터 (로컬 레벨+추세, 등속 모델)
  function kalmanModel(closes, end) {
    const n = end + 1;
    if (n < 10) return 0;
    const scale = closes[end] || 1;
    const q = (scale * 0.004) ** 2; // 프로세스 노이즈
    const r = (scale * 0.012) ** 2; // 관측 노이즈
    let x = closes[0], v = 0;
    let p11 = scale, p12 = 0, p21 = 0, p22 = scale;
    for (let i = 1; i < n; i += 1) {
      // 예측 단계
      x += v;
      p11 += p12 + p21 + p22 + q;
      p12 += p22;
      p21 += p22;
      p22 += q;
      // 갱신 단계
      const y = closes[i] - x;
      const s = p11 + r;
      const k1 = p11 / s, k2 = p21 / s;
      x += k1 * y;
      v += k2 * y;
      p22 -= k2 * p12;
      p21 -= k2 * p11;
      p12 -= k1 * p12;
      p11 -= k1 * p11;
    }
    const forecast = x + v;
    return clamp((forecast - closes[end]) / closes[end], -0.08, 0.08);
  }

  // 3) 모멘텀 (지수 가중 최근 수익률)
  function momentumModel(closes, end) {
    if (end < 12) return 0;
    let num = 0, den = 0;
    for (let k = 0; k < 10; k += 1) {
      const idx = end - k;
      const ret = (closes[idx] - closes[idx - 1]) / closes[idx - 1];
      const w = Math.exp(-k / 4);
      num += ret * w;
      den += w;
    }
    return clamp((num / den) * 0.85, -0.06, 0.06);
  }

  // 4) 평균회귀 (SMA20 z-score 되돌림)
  function meanReversionModel(closes, end) {
    if (end < 21) return 0;
    const win = closes.slice(end - 19, end + 1);
    const m = mean(win);
    const sd = stdev(win) || 1e-9;
    const z = (closes[end] - m) / sd;
    return clamp(-z * 0.004, -0.03, 0.03);
  }

  // 5) k-NN 패턴 매칭 (정규화된 최근 5일 수익률 패턴과 유사한 과거 구간의 다음날 수익률)
  function knnModel(closes, end) {
    const rets = [];
    for (let i = 1; i <= end; i += 1) rets.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    const W = 5, K = 5;
    if (rets.length < W + 15) return 0;
    const target = rets.slice(-W);
    const candidates = [];
    for (let s = 0; s + W < rets.length - 1; s += 1) {
      let d = 0;
      for (let j = 0; j < W; j += 1) d += (rets[s + j] - target[j]) ** 2;
      candidates.push([d, rets[s + W]]);
    }
    candidates.sort((a, b) => a[0] - b[0]);
    let num = 0, den = 0;
    for (let i = 0; i < Math.min(K, candidates.length); i += 1) {
      const w = 1 / (candidates[i][0] + 1e-6);
      num += candidates[i][1] * w;
      den += w;
    }
    return clamp(den ? num / den : 0, -0.05, 0.05);
  }

  // 6) 릿지 회귀 (기술지표 특징 → 다음날 수익률, 매 시점 과거 데이터만으로 학습)
  function ridgeFeatures(indicators, closes, i) {
    const row = indicators[i];
    const ret1 = i >= 1 ? (closes[i] - closes[i - 1]) / closes[i - 1] : 0;
    const ret3 = i >= 3 ? (closes[i] - closes[i - 3]) / closes[i - 3] : 0;
    const ret5 = i >= 5 ? (closes[i] - closes[i - 5]) / closes[i - 5] : 0;
    return [
      ret1 * 10,
      ret3 * 6,
      ret5 * 4,
      row.sma20 ? clamp((closes[i] - row.sma20) / row.sma20, -0.2, 0.2) * 5 : 0,
      Number.isFinite(row.rsi) ? (row.rsi - 50) / 50 : 0,
      row.macdSignal !== undefined && closes[i] ? clamp((row.macd - row.macdSignal) / closes[i], -0.05, 0.05) * 20 : 0,
      Number.isFinite(row.volumeRatio) ? clamp(row.volumeRatio - 1, -1, 2) : 0,
      Number.isFinite(row.stochK) ? (row.stochK - 50) / 50 : 0,
    ];
  }

  function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);
    for (let col = 0; col < n; col += 1) {
      let pivot = col;
      for (let r = col + 1; r < n; r += 1) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
      if (Math.abs(M[pivot][col]) < 1e-12) return null;
      [M[col], M[pivot]] = [M[pivot], M[col]];
      for (let r = 0; r < n; r += 1) {
        if (r === col) continue;
        const f = M[r][col] / M[col][col];
        for (let c = col; c <= n; c += 1) M[r][c] -= f * M[col][c];
      }
    }
    return M.map((row, i) => row[n] / row[i]);
  }

  function ridgeModel(indicators, closes, end) {
    const start = 6;
    if (end - start < 25) return 0;
    const dim = 8, lambda = 0.15;
    // 정규방정식: (XᵀX + λI) w = Xᵀy
    const XtX = Array.from({ length: dim }, () => new Array(dim).fill(0));
    const Xty = new Array(dim).fill(0);
    for (let i = start; i < end; i += 1) {
      const x = ridgeFeatures(indicators, closes, i);
      const y = (closes[i + 1] - closes[i]) / closes[i];
      for (let a = 0; a < dim; a += 1) {
        Xty[a] += x[a] * y;
        for (let b = a; b < dim; b += 1) XtX[a][b] += x[a] * x[b];
      }
    }
    for (let a = 0; a < dim; a += 1) {
      for (let b = 0; b < a; b += 1) XtX[a][b] = XtX[b][a];
      XtX[a][a] += lambda;
    }
    const w = solveLinear(XtX, Xty);
    if (!w) return 0;
    const x = ridgeFeatures(indicators, closes, end);
    let pred = 0;
    for (let a = 0; a < dim; a += 1) pred += w[a] * x[a];
    return clamp(pred, -0.05, 0.05);
  }

  /* ---------------- 레짐(시장 국면) 감지 ---------------- */
  function detectRegime(closes, rets) {
    const n = closes.length;
    const sma50 = mean(closes.slice(-Math.min(50, n)));
    const sma50Prev = mean(closes.slice(-Math.min(60, n), -10)) || sma50;
    const slope = (sma50 - sma50Prev) / (sma50Prev || 1);
    const recentVol = ewmaVolatility(rets.slice(-40));
    const longVol = stdev(rets) || 1e-9;
    const highVol = recentVol > longVol * 1.15;
    const trending = Math.abs(slope) > 0.008;
    const trend = trending ? (slope > 0 ? "상승" : "하락") : "횡보";
    const label = `${trend} · 변동성 ${highVol ? "확대" : "안정"}`;
    return { trend, highVol, trending, label, slope, recentVol, longVol };
  }

  /* ---------------- 몬테카를로 부트스트랩 예측구간 ---------------- */
  function monteCarlo(rets, drift, vol, rng, sims = 600) {
    const pool = rets.slice(-120);
    if (pool.length < 20) return null;
    const poolMean = mean(pool);
    const outcomes = new Array(sims);
    for (let s = 0; s < sims; s += 1) {
      // 과거 수익률 재표집 + 앙상블 드리프트로 재중심화
      const sample = pool[Math.floor(rng() * pool.length)];
      outcomes[s] = drift + (sample - poolMean);
    }
    outcomes.sort((a, b) => a - b);
    const q = (p) => outcomes[Math.min(sims - 1, Math.max(0, Math.floor(p * sims)))];
    const probUp = outcomes.filter((v) => v > 0).length / sims;
    return { p05: q(0.05), p50: q(0.5), p95: q(0.95), probUp, sims };
  }

  /* ---------------- 워크포워드 검증 + 앙상블 ---------------- */
  const MODEL_DEFS = [
    { key: "kalman", name: "칼만 필터", kind: "trend", fn: (ind, closes, end) => kalmanModel(closes, end) },
    { key: "holt", name: "Holt 추세평활", kind: "trend", fn: (ind, closes, end) => holtModel(closes, end) },
    { key: "momentum", name: "모멘텀", kind: "trend", fn: (ind, closes, end) => momentumModel(closes, end) },
    { key: "meanrev", name: "평균회귀", kind: "range", fn: (ind, closes, end) => meanReversionModel(closes, end) },
    { key: "knn", name: "k-NN 패턴", kind: "range", fn: (ind, closes, end) => knnModel(closes, end) },
    { key: "ridge", name: "릿지 회귀(ML)", kind: "ml", fn: (ind, closes, end) => ridgeModel(ind, closes, end) },
  ];

  function predict(indicators) {
    const closes = indicators.map((row) => row.close);
    const n = closes.length;
    if (n < 45) return null;
    const rets = returnsOf(closes);
    const end = n - 1;

    // 워크포워드: 최근 checkSteps 구간에서 각 모델이 "그 시점까지 데이터만으로" 예측 → 실제와 비교
    const checkSteps = Math.min(50, n - 35);
    const decay = 0.94; // 최근 오차에 더 큰 가중 (지수감쇠)
    const stats = MODEL_DEFS.map(() => ({ err: 0, wsum: 0, hits: 0, count: 0 }));
    for (let step = 0; step < checkSteps; step += 1) {
      const t = end - 1 - step; // t까지 데이터로 t+1 예측
      const actual = (closes[t + 1] - closes[t]) / closes[t];
      const w = decay ** step;
      MODEL_DEFS.forEach((model, mi) => {
        const raw = model.fn(indicators, closes, t);
        const pred = Number.isFinite(raw) ? raw : 0; // 오작동 모델이 검증 통계를 오염시키지 않도록 가드
        stats[mi].err += Math.abs(pred - actual) * w;
        stats[mi].wsum += w;
        stats[mi].count += 1;
        if ((pred >= 0) === (actual >= 0)) stats[mi].hits += 1;
      });
    }

    const regime = detectRegime(closes, rets);

    // 가중치: 1/(가중MAE) 비례 + 레짐 보정(추세장→추세모델↑, 횡보장→회귀/패턴모델↑)
    const rawWeights = stats.map((st, mi) => {
      const mae = st.wsum ? st.err / st.wsum : 1;
      let w = 1 / (mae + 1e-4);
      const kind = MODEL_DEFS[mi].kind;
      if (regime.trending && kind === "trend") w *= 1.3;
      if (!regime.trending && kind === "range") w *= 1.3;
      return w;
    });
    const safeRawWeights = rawWeights.map((w) => (Number.isFinite(w) ? w : 0));
    const weightSum = safeRawWeights.reduce((s, v) => s + v, 0) || 1;
    const weights = safeRawWeights.map((w) => w / weightSum);

    // 최종 예측 (현재 시점)
    const modelResults = MODEL_DEFS.map((model, mi) => {
      const raw = model.fn(indicators, closes, end);
      return {
        key: model.key,
        name: model.name,
        kind: model.kind,
        ret: Number.isFinite(raw) ? raw : 0,
        weight: weights[mi],
        hitRate: stats[mi].count ? stats[mi].hits / stats[mi].count : 0.5,
        mae: stats[mi].wsum ? stats[mi].err / stats[mi].wsum : null,
      };
    });
    let ensembleReturn = clamp(
      modelResults.reduce((s, m) => s + m.ret * m.weight, 0),
      -0.05,
      0.05,
    );

    const vol = ewmaVolatility(rets);
    const rng = mulberry32(seedFromSeries(closes));
    const mc = monteCarlo(rets, ensembleReturn, vol, rng);

    // 신뢰도: 모델 합의도 + 방향 적중률 + 레짐 명확성 − 변동성 페널티
    const retSpread = stdev(modelResults.map((m) => m.ret));
    const agreement = clamp(1 - retSpread / 0.02, 0, 1); // 스프레드 2%p 이상이면 합의 0
    const ensembleHitRate = modelResults.reduce((s, m) => s + m.hitRate * m.weight, 0);
    const confidence = clamp(
      42 + agreement * 22 + (ensembleHitRate - 0.5) * 60 + (regime.trending ? 5 : 0) - vol * 350,
      35,
      93,
    );

    return {
      predictedReturn: ensembleReturn,
      prediction: closes[end] * (1 + ensembleReturn),
      confidence,
      models: modelResults,
      regime,
      mc,
      ensembleHitRate,
      ewmaVol: vol,
      validatedSteps: checkSteps,
    };
  }

  window.AiEngine = { predict, version: "2.0-ensemble" };
})();
