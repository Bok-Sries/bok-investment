/**
 * 종목신호기 - 상승신호 스캐닝 엔진 (일(日) 단위)
 *
 * 설계 원칙:
 * - 분/시간 단위가 아니라 "일봉" 흐름으로 며칠~1주일 스윙 진입을 판단한다.
 * - 모든 신호는 가격/거래량 일봉 데이터로 '결정론적으로' 계산한다(난수 사용 금지).
 *   → 같은 종목을 다시 스캔하면 항상 같은 점수가 나온다.
 *
 * 입력 데이터:
 * - history 는 (1) 일봉 OHLCV 객체 배열 [{open,high,low,close,volume}, ...] 또는
 *               (2) 종가 숫자 배열 [80800, 81200, ...] 둘 다 허용한다.
 *   _normalize() 가 두 형태를 종가/고가/저가/거래량 배열로 변환한다.
 *
 * 신호 구성(가중치):
 * - dante(0.25)        : 추세형 패턴 (MA 골든크로스, 256기법, 일목, 박스 돌파)
 * - swing(0.25)        : 스윙 (3일선, 5일 고점 갱신, 저점 상향, 거래량 증가)
 * - technical(0.20)    : 기술지표 (RSI, MACD, OBV, Stochastic)
 * - foreign(0.15)      : 수급 흐름 추정 (상승일/하락일 거래량 비교) — 실제 외국인 데이터 없을 때 추정
 * - institution(0.15)  : 거래량 누적 추정 (OBV 추세)
 */

let signalStorage = {};

class SignalScanner {
  constructor() {
    this.signals = new Map();   // ticker → signal data
    this.signalHistory = [];
    this.maxHistoryDays = 7;
  }

  // ── 입력 정규화: OHLCV 객체 배열 / 숫자(종가) 배열 → {closes, highs, lows, volumes} ──
  _normalize(history) {
    const empty = { closes: [], highs: [], lows: [], volumes: [], hasVolume: false, length: 0 };
    if (!Array.isArray(history) || history.length === 0) return empty;

    if (typeof history[0] === "number") {
      const closes = history.filter((v) => Number.isFinite(v));
      return { closes, highs: closes.slice(), lows: closes.slice(), volumes: [], hasVolume: false, length: closes.length };
    }

    const closes = [], highs = [], lows = [], volumes = [];
    for (const row of history) {
      const c = Number(row?.close);
      if (!Number.isFinite(c)) continue;
      closes.push(c);
      const h = Number(row?.high); highs.push(Number.isFinite(h) ? h : c);
      const l = Number(row?.low); lows.push(Number.isFinite(l) ? l : c);
      const v = Number(row?.volume); volumes.push(Number.isFinite(v) ? v : 0);
    }
    const hasVolume = volumes.some((v) => v > 0);
    return { closes, highs, lows, volumes, hasVolume, length: closes.length };
  }

  // ── 종목 1개 스캔 ──
  scanSymbol(ticker, historyData = [], symbolName = "") {
    const { closes, highs, lows, volumes, hasVolume } = this._normalize(historyData);

    const signals = {
      dante: this.detectDanteSignals(closes),
      swing: this.detectSwingSignals(closes, volumes, hasVolume),
      technical: this.detectTechnicalSignals(closes, highs, lows, volumes, hasVolume),
      foreign: this.detectFlowSignal(closes, volumes, hasVolume),
      institution: this.detectAccumulationSignal(closes, volumes, hasVolume),
    };

    const totalScore = this.calculateTotalScore(signals);
    const conditions = Object.keys(signals).filter((key) => signals[key]?.score > 0);

    return {
      ticker,
      name: symbolName || ticker,
      currentPrice: closes.length ? closes[closes.length - 1] : 0,
      signals,
      totalScore,
      expectedReturn: this.calculateExpectedReturn(closes, signals),
      conditions,
      detectionTime: Date.now(),
      confidence: this.calculateConfidence(signals),
    };
  }

  // ── 1) Dante(추세형) 신호 ──
  detectDanteSignals(closes) {
    if (closes.length < 20) return { score: 0, details: [] };
    const details = [];
    let score = 0;

    // MA 골든크로스 (5일선이 12일선을 상향 돌파)
    const ma5 = this._ma(closes, 5);
    const ma12 = this._ma(closes, 12);
    const prevMa5 = this._ma(closes.slice(0, -1), 5);
    const prevMa12 = this._ma(closes.slice(0, -1), 12);
    if (ma5 > ma12 && prevMa5 <= prevMa12) {
      details.push("MA 골든크로스 ↑");
      score += 7;
    }

    // 256기법 (저점 → 고점 → 저점 후 저점 상향)
    if (this._detect256(closes).isValid) {
      details.push("256기법 활성");
      score += 5;
    }

    // 일목균형표(단순화: 9일선 > 26일선)
    if (this._ichimokuBullish(closes)) {
      details.push("일목 정배열 ↑");
      score += 5;
    }

    // 박스권 상향 돌파(직전 10일 고점 대비 +1%)
    if (this._boxBreakout(closes)) {
      details.push("박스권 돌파 ↑");
      score += 3;
    }

    return { score: Math.min(score, 20), details };
  }

  // ── 2) 스윙 신호 (3일~1주) ──
  detectSwingSignals(closes, volumes, hasVolume) {
    if (closes.length < 7) return { score: 0, details: [] };
    const details = [];
    let score = 0;

    const last5 = closes.slice(-5);
    const last5High = Math.max(...last5);
    const last5Low = Math.min(...last5);
    const current = closes[closes.length - 1];
    const prev = closes[closes.length - 2];

    if (current > this._ma(closes, 3)) {
      details.push("3일선 위 ↑");
      score += 5;
    }
    if (current >= last5High && prev < last5High) {
      details.push("5일 고점 갱신 🔺");
      score += 5;
    }
    if (current > last5Low * 1.01) {
      details.push("저점 상향 🔹");
      score += 3;
    }
    // 거래량 증가: 실제 거래량(직전 20일 평균 대비)으로 판단
    if (hasVolume) {
      const ratio = this._volumeRatio(volumes, 20);
      if (ratio > 1.2) {
        details.push(`거래량 ↑ ${ratio.toFixed(1)}배`);
        score += 2;
      }
    }

    return { score: Math.min(score, 20), details };
  }

  // ── 3) 기술지표 신호 ──
  detectTechnicalSignals(closes, highs, lows, volumes, hasVolume) {
    if (closes.length < 15) return { score: 0, details: [] };
    const details = [];
    let score = 0;

    // RSI (30~70 구간에서 상승 전환)
    const rsi = this._rsi(closes);
    const prevRsi = this._rsi(closes.slice(0, -1));
    if (rsi > 30 && rsi < 70 && rsi > prevRsi) {
      details.push(`RSI ↑ ${rsi.toFixed(0)}`);
      score += 5;
    }

    // MACD (시그널선 = MACD선의 9일 EMA; 히스토그램 양전환)
    const macd = this._macd(closes);
    if (macd.histogram > 0 && macd.prevHistogram <= 0) {
      details.push("MACD 골든크로스");
      score += 5;
    } else if (macd.histogram > 0) {
      details.push("MACD 양(+)");
      score += 2;
    }

    // OBV (실제 거래량 기반, 5일 전 대비 상승)
    if (hasVolume) {
      const obv = this._obv(closes, volumes);
      if (obv.length > 6 && obv[obv.length - 1] > obv[obv.length - 6]) {
        details.push("OBV 상승");
        score += 4;
      }
    }

    // Stochastic (%K가 20 위 + K>D)
    const stoch = this._stochastic(closes, highs, lows);
    if (stoch.k > 20 && stoch.k > stoch.d) {
      details.push("스토캐스틱 K>D");
      score += 3;
    }

    return { score: Math.min(score, 20), details };
  }

  // ── 4) 수급 흐름 추정 (key: foreign) ──
  // 실제 외국인 수급 데이터가 없으므로, 상승일/하락일 거래량을 비교해 매수/매도 우위를 추정한다.
  detectFlowSignal(closes, volumes, hasVolume) {
    if (!hasVolume || closes.length < 6) {
      return { score: 0, details: hasVolume ? [] : ["수급 데이터 없음"] };
    }
    const flow = this._volumeFlow(closes, volumes, 10); // -1(매도우위) ~ +1(매수우위)
    const details = [];
    let score = 0;
    if (flow > 0.25) { score = 15; details.push("매수 우위 수급(추정)"); }
    else if (flow > 0.08) { score = 8; details.push("약한 매수 수급(추정)"); }
    else if (flow < -0.25) { score = 0; details.push("매도 우위 수급(추정)"); }
    return { score, details, flow: Number(flow.toFixed(2)) };
  }

  // ── 5) 거래량 누적 추정 (key: institution) ──
  // OBV 추세로 거래량이 점진적으로 쌓이는지(매집)를 추정한다.
  detectAccumulationSignal(closes, volumes, hasVolume) {
    if (!hasVolume || closes.length < 11) {
      return { score: 0, details: hasVolume ? [] : ["수급 데이터 없음"] };
    }
    const obv = this._obv(closes, volumes);
    const recent = obv[obv.length - 1];
    const past = obv[obv.length - 11];
    const details = [];
    let score = 0;
    if (recent > past) {
      const slope = (recent - past) / (Math.abs(past) || 1);
      if (slope > 0.05) { score = 15; details.push("거래량 누적 증가(추정)"); }
      else { score = 8; details.push("거래량 완만 누적(추정)"); }
    }
    return { score, details };
  }

  // ── 종합 점수(가중 합산) ──
  calculateTotalScore(signals) {
    const weights = { dante: 0.25, swing: 0.25, technical: 0.20, foreign: 0.15, institution: 0.15 };
    let total = 0;
    for (const [key, signal] of Object.entries(signals)) {
      total += (signal?.score || 0) * (weights[key] || 0);
    }
    return Math.round(total);
  }

  // ── 신뢰도(만족 조건 수 기준) ──
  calculateConfidence(signals) {
    const keys = ["dante", "swing", "technical", "foreign", "institution"];
    const satisfied = keys.filter((k) => signals[k]?.score > 0).length;
    return Math.round((satisfied / keys.length) * 100);
  }

  // ── 예상 상승률(일봉 기준 목표가) ──
  calculateExpectedReturn(closes, signals) {
    if (closes.length < 5) return 0;
    const current = closes[closes.length - 1];
    const high5 = Math.max(...closes.slice(-5));
    const avg20 = this._avg(closes.slice(-20));
    const target = Math.max(high5 * 1.02, avg20 * 1.03);
    const expectedReturn = ((target - current) / current) * 100;
    const strength = this.calculateTotalScore(signals) / 100;
    const value = expectedReturn * (0.8 + strength * 0.4);
    return Number.isFinite(value) ? Math.round(value * 10) / 10 : 0;
  }

  // ───────────────────────── 보조 계산 ─────────────────────────
  _avg(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  _ma(arr, period) {
    if (arr.length < period) return 0;
    const s = arr.slice(-period);
    return s.reduce((a, b) => a + b, 0) / period;
  }

  _rsi(closes, period = 14) {
    if (closes.length < period + 1) return 50;
    let gain = 0, loss = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gain += diff;
      else loss += Math.abs(diff);
    }
    const avgGain = gain / period;
    const avgLoss = loss / period;
    if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  _emaSeries(values, period) {
    if (!values.length) return [];
    const k = 2 / (period + 1);
    const out = [values[0]];
    for (let i = 1; i < values.length; i++) {
      out.push(values[i] * k + out[i - 1] * (1 - k));
    }
    return out;
  }

  // MACD: 시그널선은 'MACD선의 9일 EMA' (예전엔 가격의 EMA를 써서 항상 음수였음)
  _macd(closes) {
    const ema12 = this._emaSeries(closes, 12);
    const ema26 = this._emaSeries(closes, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signalLine = this._emaSeries(macdLine, 9);
    const n = closes.length - 1;
    const macd = macdLine[n] ?? 0;
    const signal = signalLine[n] ?? 0;
    const histogram = macd - signal;
    const prevHistogram = n > 0 ? (macdLine[n - 1] ?? 0) - (signalLine[n - 1] ?? 0) : 0;
    return { macd, signal, histogram, prevHistogram };
  }

  // OBV: 실제 거래량 사용 (상승일 +거래량, 하락일 -거래량)
  _obv(closes, volumes) {
    const out = [];
    let obv = 0;
    for (let i = 0; i < closes.length; i++) {
      if (i > 0) {
        const v = volumes[i] || 0;
        if (closes[i] > closes[i - 1]) obv += v;
        else if (closes[i] < closes[i - 1]) obv -= v;
      }
      out.push(obv);
    }
    return out;
  }

  // Stochastic: 고가/저가 기반 %K, %D=최근 3개 %K 평균
  _stochastic(closes, highs, lows, period = 14) {
    const n = closes.length;
    if (n < period) return { k: 50, d: 50 };
    const kSeries = [];
    for (let i = period - 1; i < n; i++) {
      const hi = Math.max(...highs.slice(i - period + 1, i + 1));
      const lo = Math.min(...lows.slice(i - period + 1, i + 1));
      kSeries.push(hi === lo ? 50 : ((closes[i] - lo) / (hi - lo)) * 100);
    }
    const k = kSeries[kSeries.length - 1];
    const d = this._avg(kSeries.slice(-3));
    return { k, d };
  }

  _detect256(closes) {
    if (closes.length < 20) return { isValid: false };
    const r = closes.slice(-20);
    let low1 = Infinity, low1i = 0;
    for (let i = 0; i < 10; i++) if (r[i] < low1) { low1 = r[i]; low1i = i; }
    let high1 = -Infinity, high1i = low1i;
    for (let i = low1i; i < 15; i++) if (r[i] > high1) { high1 = r[i]; high1i = i; }
    let low2 = Infinity, low2i = high1i;
    for (let i = high1i; i < r.length; i++) if (r[i] < low2) { low2 = r[i]; low2i = i; }
    return { isValid: low1i < high1i && high1i < low2i && low2 > low1 * 0.95 };
  }

  _ichimokuBullish(closes) {
    if (closes.length < 26) return false;
    return this._ma(closes, 9) > this._ma(closes, 26);
  }

  // 박스 돌파: 현재가를 제외한 직전 10일 고점 대비 +1% 돌파
  _boxBreakout(closes) {
    if (closes.length < 11) return false;
    const prior = closes.slice(-11, -1);
    const boxHigh = Math.max(...prior);
    return closes[closes.length - 1] > boxHigh * 1.01;
  }

  // 거래량 비율: 현재일 거래량 / 직전 period일 평균(현재 제외)
  _volumeRatio(volumes, period = 20) {
    if (!volumes.length) return 1;
    const last = volumes[volumes.length - 1];
    const window = volumes.slice(-period - 1, -1);
    const avg = this._avg(window);
    return avg > 0 ? last / avg : 1;
  }

  // 수급 흐름: 최근 period일 동안 상승일 거래량 vs 하락일 거래량 (-1 ~ +1)
  _volumeFlow(closes, volumes, period = 10) {
    let up = 0, down = 0;
    const start = Math.max(1, closes.length - period);
    for (let i = start; i < closes.length; i++) {
      const v = volumes[i] || 0;
      if (closes[i] > closes[i - 1]) up += v;
      else if (closes[i] < closes[i - 1]) down += v;
    }
    const tot = up + down;
    return tot > 0 ? (up - down) / tot : 0;
  }

  // ── 전체 종목 스캔 ──
  async scanAllSymbols(symbolList, historyMap) {
    const results = [];
    for (const symbol of symbolList) {
      const history = historyMap[symbol.ticker] || [];
      if (!Array.isArray(history) || history.length === 0) continue;
      const signal = await this.scanSymbol(symbol.ticker, history, symbol.name);
      if (signal.totalScore >= 15) results.push(signal);
    }
    results.sort((a, b) => b.totalScore - a.totalScore);
    results.forEach((signal) => this.signals.set(signal.ticker, signal));
    console.log(`📊 신호 스캔: ${symbolList.length}개 중 ${results.length}개 신호(점수 15+)`);
    return results;
  }

  // ── 신호 순위 조회 ──
  getSignalRanking(filter = "all") {
    const signals = Array.from(this.signals.values()).sort((a, b) => b.totalScore - a.totalScore);
    if (filter === "all") return signals;
    return signals.filter((signal) => {
      switch (filter) {
        case "dante": return signal.signals.dante?.score > 0;
        case "swing": return signal.signals.swing?.score > 0;
        case "technical": return signal.signals.technical?.score > 0;
        case "foreign": return signal.signals.foreign?.score > 0;
        default: return true;
      }
    });
  }

  // ── 신호 통계 ──
  getSignalStatistics() {
    const signals = Array.from(this.signals.values());
    const count = signals.length;
    return {
      totalCount: count,
      danteCount: signals.filter((s) => s.signals.dante?.score > 0).length,
      swingCount: signals.filter((s) => s.signals.swing?.score > 0).length,
      technicalCount: signals.filter((s) => s.signals.technical?.score > 0).length,
      foreignCount: signals.filter((s) => s.signals.foreign?.score > 0).length,
      institutionCount: signals.filter((s) => s.signals.institution?.score > 0).length,
      avgScore: count ? Math.round(signals.reduce((a, b) => a + b.totalScore, 0) / count) : 0,
      avgReturn: count ? Math.round((signals.reduce((a, b) => a + b.expectedReturn, 0) / count) * 10) / 10 : 0,
    };
  }
}

// 글로벌 인스턴스
const signalScanner = new SignalScanner();
