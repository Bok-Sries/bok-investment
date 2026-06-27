/**
 * 종목신호기 - 상승신호 스캐닝 엔진
 *
 * 기능:
 * - Dante 신호 (MA Reversal, 256기법, Ichimoku, Box Trading, Breakout)
 * - 스윙 신호 (고점/저점 갱신, 거래량)
 * - 기술지표 신호 (RSI, MACD, OBV, Stochastic)
 * - 외국인/기관 신호
 * - 다중 신호 조합 점수 계산
 */

// 신호 저장소 (indexedDB 또는 localStorage)
let signalStorage = {};

/**
 * 신호 객체 구조:
 * {
 *   ticker: "005930.KS",
 *   name: "삼성전자",
 *   currentPrice: 80800,
 *   signals: {
 *     dante: {score: 20, details: ["MA Reversal", "256기법"]},
 *     swing: {score: 15, details: ["고점 갱신", "거래량 증가"]},
 *     technical: {score: 10, details: ["RSI 상승", "MACD+"]},
 *     foreign: {score: 8, details: ["외국인 순매수"]},
 *     institution: {score: 7, details: ["기관 순매수"]},
 *   },
 *   totalScore: 60,
 *   expectedReturn: 4.5,  // %
 *   detectionTime: 1719374400000,  // timestamp
 *   conditions: ["Dante", "Swing", "RSI", "Foreign"],  // 만족 조건들
 * }
 */

class SignalScanner {
  constructor() {
    this.signals = new Map();  // ticker → signal data
    this.signalHistory = [];   // 시간별 신호 히스토리
    this.maxHistoryDays = 7;   // 7일 히스토리 유지
  }

  /**
   * 종목 신호 스캔
   */
  async scanSymbol(ticker, historyData = [], symbolName = "") {
    const signals = {
      dante: this.detectDanteSignals(ticker, historyData),
      swing: this.detectSwingSignals(ticker, historyData),
      technical: this.detectTechnicalSignals(ticker, historyData),
      foreign: await this.detectForeignSignal(ticker),
      institution: await this.detectInstitutionSignal(ticker),
    };

    const totalScore = this.calculateTotalScore(signals);
    const conditions = Object.keys(signals).filter(key => signals[key]?.score > 0);

    return {
      ticker,
      name: symbolName || ticker,  // 함수 호출 제거
      currentPrice: historyData[historyData.length - 1] || 0,
      signals,
      totalScore,
      expectedReturn: this.calculateExpectedReturn(ticker, historyData, signals),
      conditions,
      detectionTime: Date.now(),
      confidence: this.calculateConfidence(signals),
    };
  }

  /**
   * Dante 신호 감지
   */
  detectDanteSignals(ticker, history) {
    if (history.length < 20) return { score: 0, details: [] };

    const details = [];
    let score = 0;

    // 1. MA Reversal (5일선 12일선 역배열)
    const ma5 = this.calculateMA(history.slice(-5), 5);
    const ma12 = this.calculateMA(history.slice(-12), 12);
    if (ma5 > ma12 && history.length > 13) {
      const prevMa5 = this.calculateMA(history.slice(-6, -1), 5);
      const prevMa12 = this.calculateMA(history.slice(-13, -1), 12);
      if (prevMa5 <= prevMa12) {
        details.push("MA Reversal ↑");
        score += 7;
      }
    }

    // 2. 256기법 (3단계: 저점 - 고점 - 저점 패턴)
    if (history.length >= 20) {
      const pattern = this.detect256Pattern(history);
      if (pattern.isValid) {
        details.push("256기법 활성");
        score += 5;
      }
    }

    // 3. Ichimoku 신호
    if (history.length >= 26) {
      const ichimoku = this.detectIchimokuSignal(history);
      if (ichimoku.isBullish) {
        details.push("Ichimoku ↑");
        score += 5;
      }
    }

    // 4. Box Trading (박스 상단 돌파)
    const boxSignal = this.detectBoxBreakout(history);
    if (boxSignal.isBreakout) {
      details.push("Box Breakout ↑");
      score += 3;
    }

    return { score: Math.min(score, 20), details };
  }

  /**
   * 스윙 신호 감지 (3일~1주일)
   */
  detectSwingSignals(ticker, history) {
    if (history.length < 7) return { score: 0, details: [] };

    const details = [];
    let score = 0;

    const last5High = Math.max(...history.slice(-5));
    const last5Low = Math.min(...history.slice(-5));
    const last5Avg = history.slice(-5).reduce((a, b) => a + b) / 5;

    const currentPrice = history[history.length - 1];
    const prevPrice = history[history.length - 2];

    // 1. 3일선 상향 (종가가 3일선 위)
    const ma3 = this.calculateMA(history.slice(-3), 3);
    if (currentPrice > ma3) {
      details.push("3일선 위ᐄ");
      score += 5;
    }

    // 2. 고점 갱신 (최근 5일 고가 갱신)
    if (currentPrice >= last5High && prevPrice < last5High) {
      details.push("고점 갱신🔺");
      score += 5;
    }

    // 3. 저점 상향 (저가가 5일 저가보다 높음)
    if (history[history.length - 1] > last5Low * 1.01) {
      details.push("저점 상향🔹");
      score += 3;
    }

    // 4. 거래량 증가 (샘플 데이터이므로 모의 계산)
    const volumeIncrease = Math.random() > 0.5;
    if (volumeIncrease) {
      details.push("거래량↑");
      score += 2;
    }

    return { score: Math.min(score, 20), details };
  }

  /**
   * 기술지표 신호 감지
   */
  detectTechnicalSignals(ticker, history) {
    if (history.length < 14) return { score: 0, details: [] };

    const details = [];
    let score = 0;

    // 1. RSI (상승 중, 30~50)
    const rsi = this.calculateRSI(history);
    if (rsi > 30 && rsi < 70) {
      if (history.length > 14) {
        const prevRsi = this.calculateRSI(history.slice(0, -1));
        if (rsi > prevRsi) {
          details.push(`RSI ↑${rsi.toFixed(0)}`);
          score += 5;
        }
      }
    }

    // 2. MACD (포지티브 크로스)
    const macd = this.calculateMACD(history);
    if (macd.histogram > 0) {
      if (history.length > 26) {
        const prevMacd = this.calculateMACD(history.slice(0, -1));
        if (prevMacd.histogram <= 0) {
          details.push("MACD ×");
          score += 5;
        }
      }
    }

    // 3. OBV (증가 추세)
    if (history.length > 5) {
      const obv = this.calculateOBV(history);
      const prevObv = this.calculateOBV(history.slice(0, -1));
      if (obv > prevObv) {
        details.push("OBV ↑");
        score += 4;
      }
    }

    // 4. Stochastic (저점 턴)
    const stoch = this.calculateStochastic(history);
    if (stoch.k > 20 && stoch.k > stoch.d) {
      details.push(`K>D`);
      score += 3;
    }

    return { score: Math.min(score, 20), details };
  }

  /**
   * 외국인 순매수 신호
   */
  async detectForeignSignal(ticker) {
    // 실제 데이터: KRX, 한국투자 API 등에서 조회
    // 샘플: 70% 확률로 순매수 상태 시뮬레이션
    const isBuying = Math.random() > 0.3;
    const score = isBuying ? 15 : 0;

    return {
      score,
      details: isBuying ? ["외국인 순매수"] : [],
      volume: isBuying ? Math.floor(Math.random() * 5000000) : 0,
    };
  }

  /**
   * 기관 순매수 신호
   */
  async detectInstitutionSignal(ticker) {
    // 샘플: 60% 확률로 순매수
    const isBuying = Math.random() > 0.4;
    const score = isBuying ? 15 : 0;

    return {
      score,
      details: isBuying ? ["기관 순매수"] : [],
      volume: isBuying ? Math.floor(Math.random() * 3000000) : 0,
    };
  }

  /**
   * 다중 신호 점수 계산 (가중 합산)
   */
  calculateTotalScore(signals) {
    const weights = {
      dante: 0.25,
      swing: 0.25,
      technical: 0.20,
      foreign: 0.15,
      institution: 0.15,
    };

    let total = 0;
    for (const [key, signal] of Object.entries(signals)) {
      total += (signal?.score || 0) * (weights[key] || 0);
    }

    return Math.round(total);
  }

  /**
   * 신뢰도 계산
   */
  calculateConfidence(signals) {
    const satisfiedConditions = Object.values(signals).filter(s => s?.score > 0).length;
    // 5가지 조건 중 만족 개수로 신뢰도 계산
    return Math.round((satisfiedConditions / 5) * 100);
  }

  /**
   * 예상 상승률 계산
   */
  calculateExpectedReturn(ticker, history, signals) {
    if (history.length < 5) return 0;

    const currentPrice = history[history.length - 1];
    const high5Days = Math.max(...history.slice(-5));
    const avg20Days = history.slice(-20).reduce((a, b) => a + b) / Math.min(20, history.length);

    // 목표가 = max(최근 5일 고가, 20일 평균 × 1.03)
    const targetPrice = Math.max(high5Days * 1.02, avg20Days * 1.03);
    const expectedReturn = ((targetPrice - currentPrice) / currentPrice) * 100;

    // 신호 강도에 따른 가중치 적용
    const signalStrength = this.calculateTotalScore(signals) / 100;
    return Math.round(expectedReturn * (0.8 + signalStrength * 0.4) * 10) / 10;
  }

  /**
   * 보조 계산 함수들
   */
  calculateMA(prices, period) {
    const slice = prices.slice(-period);
    return slice.length === period ? slice.reduce((a, b) => a + b) / period : 0;
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    const changes = [];
    for (let i = prices.length - period; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
    const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
    const rs = losses === 0 ? 100 : gains / losses;
    return 100 - 100 / (1 + rs);
  }

  calculateMACD(prices) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA(prices, 9);
    return {
      macd,
      signal,
      histogram: macd - signal,
    };
  }

  calculateEMA(prices, period) {
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  }

  calculateOBV(prices) {
    // 샘플 구현: 단순 거래량 증가 추적
    return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) : 0;
  }

  calculateStochastic(prices, period = 14) {
    if (prices.length < period) return { k: 50, d: 50 };
    const high = Math.max(...prices.slice(-period));
    const low = Math.min(...prices.slice(-period));
    const close = prices[prices.length - 1];
    const k = ((close - low) / (high - low)) * 100 || 50;
    return { k, d: k };  // 단순화
  }

  detect256Pattern(history) {
    // 256기법: 저점 → 고점 → 저점 패턴 감지
    if (history.length < 20) return { isValid: false };

    const recent = history.slice(-20);
    const low1Idx = recent.indexOf(Math.min(...recent.slice(0, 10)));
    const high1Idx = recent.indexOf(Math.max(...recent.slice(low1Idx, 15)));
    const low2Idx = recent.indexOf(Math.min(...recent.slice(high1Idx)));

    return {
      isValid: low1Idx < high1Idx && high1Idx < low2Idx &&
               recent[low2Idx] > recent[low1Idx] * 0.95,
    };
  }

  detectIchimokuSignal(history) {
    // Ichimoku: 단순화된 버전 (9일선 > 26일선)
    if (history.length < 26) return { isBullish: false };

    const short = this.calculateMA(history.slice(-9), 9);
    const long = this.calculateMA(history.slice(-26), 26);

    return { isBullish: short > long };
  }

  detectBoxBreakout(history) {
    // Box Trading: 일정 기간 박스 범위 결정, 상단 돌파 확인
    if (history.length < 10) return { isBreakout: false };

    const boxHigh = Math.max(...history.slice(-10));
    const boxLow = Math.min(...history.slice(-10));
    const current = history[history.length - 1];

    return {
      isBreakout: current > boxHigh * 1.01,
    };
  }

  /**
   * 모든 종목 스캔
   */
  async scanAllSymbols(symbolList, historyMap) {
    const results = [];

    for (const symbol of symbolList) {
      const history = historyMap[symbol.ticker] || [];
      if (history.length === 0) continue;  // 데이터 없으면 스킵

      const signal = await this.scanSymbol(symbol.ticker, history, symbol.name);

      // 디버그 로그
      console.log(`📊 ${symbol.ticker}: 점수=${signal.totalScore}`);

      if (signal.totalScore >= 15) {  // 점수 15 이상으로 대폭 낮춤 (더 많은 신호 표시)
        results.push(signal);
      }
    }

    // 순위 정렬
    results.sort((a, b) => b.totalScore - a.totalScore);

    // 저장
    results.forEach(signal => {
      this.signals.set(signal.ticker, signal);
    });

    return results;
  }

  /**
   * 신호 순위 조회
   */
  getSignalRanking(filter = 'all') {
    const signals = Array.from(this.signals.values())
      .sort((a, b) => b.totalScore - a.totalScore);

    if (filter === 'all') return signals;

    return signals.filter(signal => {
      switch (filter) {
        case 'dante':
          return signal.signals.dante?.score > 0;
        case 'swing':
          return signal.signals.swing?.score > 0;
        case 'technical':
          return signal.signals.technical?.score > 0;
        case 'foreign':
          return signal.signals.foreign?.score > 0;
        default:
          return true;
      }
    });
  }

  /**
   * 신호 통계
   */
  getSignalStatistics() {
    const signals = Array.from(this.signals.values());

    return {
      totalCount: signals.length,
      danteCount: signals.filter(s => s.signals.dante?.score > 0).length,
      swingCount: signals.filter(s => s.signals.swing?.score > 0).length,
      technicalCount: signals.filter(s => s.signals.technical?.score > 0).length,
      foreignCount: signals.filter(s => s.signals.foreign?.score > 0).length,
      institutionCount: signals.filter(s => s.signals.institution?.score > 0).length,
      avgScore: Math.round(signals.reduce((a, b) => a + b.totalScore, 0) / signals.length || 0),
      avgReturn: Math.round(signals.reduce((a, b) => a + b.expectedReturn, 0) / signals.length * 10) / 10,
    };
  }
}

// 글로벌 인스턴스
const signalScanner = new SignalScanner();
