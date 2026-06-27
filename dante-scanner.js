/**
 * 🎯 단테 신호 감지 알고리즘
 * 5가지 단테 기법의 신호를 감지하고 점수 계산
 */

// 🆕 이동평균 계산
function calculateMA(prices, period) {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// 🆕 단테 신호 1: 이평 때리기 (MA Reversal)
function detectMAReversalSignal(chartData) {
  if (!chartData || chartData.length < 50) return { signal: 0, strength: 0 };

  const closes = chartData.map((d) => d.close).reverse(); // 최신순
  const ma3 = calculateMA(closes, 3);
  const ma20 = calculateMA(closes, 20);
  const ma50 = calculateMA(closes, 50);

  if (!ma3 || !ma20 || !ma50) return { signal: 0, strength: 0 };

  // 신호: 3일선이 20일선 위에서 50일선 터치 후 반등
  const isNearMA50 = Math.abs(closes[0] - ma50) / ma50 < 0.02; // 2% 이내
  const isAboveMA20 = ma3 > ma20;
  const isBelowMA3 = closes[1] < ma3; // 어제는 3일선 아래

  if (isNearMA50 && isAboveMA20 && isBelowMA3) {
    return { signal: 1, strength: 80 }; // 강한 신호
  }

  return { signal: 0, strength: 0 };
}

// 🆕 단테 신호 2: 256기법 (3-Stage Bowl Pattern)
function detect256Signal(chartData) {
  if (!chartData || chartData.length < 30) return { signal: 0, strength: 0 };

  const closes = chartData.map((d) => d.close).reverse();
  const lows = chartData.map((d) => d.low).reverse();

  // 3단계 보울 패턴 감지
  // Stage 1: 저가 갱신
  // Stage 2: 고가 형성
  // Stage 3: 고가 돌파

  const recentLow = Math.min(...lows.slice(0, 10));
  const stageLow = Math.min(...lows.slice(10, 20));
  const prevHigh = Math.max(...closes.slice(20, 30));

  const stage1 = lows[0] <= recentLow * 0.98; // 새로운 저가
  const stage2 = closes[0] > prevHigh * 0.95; // 고가 근처
  const stage3 = closes[0] > prevHigh * 1.01; // 고가 돌파

  let strength = 0;
  if (stage1) strength += 30;
  if (stage2) strength += 30;
  if (stage3) strength += 40;

  return { signal: strength > 60 ? 1 : 0, strength };
}

// 🆕 단테 신호 3: 일목균합표 (Ichimoku)
function detectIchimokuSignal(chartData) {
  if (!chartData || chartData.length < 50) return { signal: 0, strength: 0 };

  const highs = chartData.map((d) => d.high).reverse();
  const lows = chartData.map((d) => d.low).reverse();
  const closes = chartData.map((d) => d.close).reverse();

  // 전환선 (9일)
  const tenkan =
    (Math.max(...highs.slice(0, 9)) + Math.min(...lows.slice(0, 9))) / 2;

  // 기준선 (26일)
  const kijun =
    (Math.max(...highs.slice(0, 26)) + Math.min(...lows.slice(0, 26))) / 2;

  // 신호: 전환선 > 기준선 (상승)
  const signal = closes[0] > tenkan && tenkan > kijun ? 1 : 0;
  const strength = signal
    ? Math.min(100, ((tenkan - kijun) / kijun) * 1000)
    : 0;

  return { signal, strength: Math.min(100, strength) };
}

// 🆕 단테 신호 4: 농사매매 (Box Trading)
function detectBoxTradingSignal(chartData) {
  if (!chartData || chartData.length < 20) return { signal: 0, strength: 0 };

  const closes = chartData.map((d) => d.close).reverse();
  const highs = chartData.map((d) => d.high).reverse();
  const lows = chartData.map((d) => d.low).reverse();

  // 박스권 범위 설정 (최근 20일)
  const boxHigh = Math.max(...highs.slice(0, 20));
  const boxLow = Math.min(...lows.slice(0, 20));
  const boxWidth = boxHigh - boxLow;

  // 신호: 박스 내에서 움직이면서 거래량 변화
  const inBox = closes[0] > boxLow && closes[0] < boxHigh;
  const nearTop = closes[0] > boxHigh * 0.95;
  const nearBottom = closes[0] < boxLow * 1.05;

  let strength = 0;
  if (inBox) strength = 50;
  if (nearTop) strength = 70; // 상층 박스권
  if (nearBottom) strength = 60; // 하층 박스권 (매수)

  return { signal: strength > 50 ? 1 : 0, strength };
}

// 🆕 단테 신호 5: 박스권 돌파 (Resistance Breakout)
function detectBreakoutSignal(chartData) {
  if (!chartData || chartData.length < 30) return { signal: 0, strength: 0 };

  const closes = chartData.map((d) => d.close).reverse();
  const highs = chartData.map((d) => d.high).reverse();

  // 저항선 설정 (최근 30일 고가)
  const resistance = Math.max(...highs.slice(0, 30));
  const prevResistance = Math.max(...highs.slice(10, 30));

  // 신호: 저항선 돌파
  const breakout = closes[0] > resistance * 1.01; // 1% 이상 돌파
  const volume = closes[0] - closes[1]; // 양봉

  const signal = breakout && volume > 0 ? 1 : 0;
  const strength = breakout ? Math.min(100, ((closes[0] - resistance) / resistance) * 1000) : 0;

  return { signal, strength: Math.min(100, strength) };
}

// 🆕 통합 단테 신호 점수 계산
function calculateDanteScore(chartData) {
  const signals = {
    maReversal: detectMAReversalSignal(chartData),
    twoFiveSix: detect256Signal(chartData),
    ichimoku: detectIchimokuSignal(chartData),
    boxTrading: detectBoxTradingSignal(chartData),
    breakout: detectBreakoutSignal(chartData),
  };

  // 신호 개수 세기
  const signalCount = Object.values(signals).filter((s) => s.signal === 1)
    .length;

  // 강도 평균
  const avgStrength = Math.round(
    Object.values(signals).reduce((sum, s) => sum + s.strength, 0) / 5
  );

  // 최종 점수: 신호 개수 * 20 + 강도 * 0.5
  const finalScore = Math.min(
    100,
    signalCount * 20 + avgStrength * 0.5
  );

  return {
    finalScore: Math.round(finalScore),
    signalCount,
    avgStrength,
    signals,
    verdict:
      signalCount >= 3
        ? "🟢 강한 매수"
        : signalCount === 2
          ? "🟡 중간 매수"
          : signalCount === 1
            ? "🔵 약한 매수"
            : "⚪ 신호 없음",
  };
}

// 🆕 기업별 단테 신호 점수 계산
function scanCompaniesForDante(companiesData) {
  const results = companiesData
    .map((company) => {
      const danteScore = calculateDanteScore(company.chartData);

      return {
        ticker: company.ticker,
        name: company.name,
        price: company.price,
        changePercent: company.changePercent,
        danteScore: danteScore.finalScore,
        signalCount: danteScore.signalCount,
        signals: danteScore.signals,
        verdict: danteScore.verdict,
        scannedAt: company.scannedAt,
      };
    })
    .sort((a, b) => b.danteScore - a.danteScore); // 점수 높은 순

  return results;
}

// 🆕 추천 기업 필터링 (3개 이상 신호)
function getRecommendedCompanies(scanResults) {
  return scanResults.filter((company) => company.signalCount >= 3);
}

// 🆕 사용 예시
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateDanteScore,
    scanCompaniesForDante,
    getRecommendedCompanies,
    detectMAReversalSignal,
    detect256Signal,
    detectIchimokuSignal,
    detectBoxTradingSignal,
    detectBreakoutSignal,
  };
}
