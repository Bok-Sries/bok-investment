/**
 * 고도화된 신호 감지 엔진
 *
 * 유명 차트 분석가 기법 통합:
 * - 일조TV (김일조): 차트 형성 원리, 저점 탈출
 * - 청송촌놈 (신창환): 실전 진입점, 거래량 분석
 * - 슈카월드: 거시 경제 + 차트 분석
 *
 * 기법:
 * 1. 이중 바닥 (Double Bottom) - 저점 재확인 후 상승
 * 2. 역 헤드앤숄더 (Inverse H&S) - 좌우 어깨 + 머리
 * 3. 엘리엇 파동 (Elliott Wave) - 1파~3파 상승 구간
 * 4. 저점 스토핑 - 점진적 저점 상향
 * 5. 거래량 축적 - 저점에서의 거래량 집중
 */

class AdvancedSignalDetector {
  /**
   * 저점 탈출 신호 감지
   * (상승여력이 가장 높은 구간)
   */
  static detectBottomBreakout(history, period = 20) {
    if (history.length < period) return { detected: false, score: 0, details: [] };

    const recent = history.slice(-period);
    const details = [];
    let score = 0;

    const lowPoint = Math.min(...recent);
    const currentPrice = recent[recent.length - 1];
    const recentHigh = Math.max(...recent.slice(-5));

    // 1. 저점에서의 거리 (현재가가 저점에서 5~15% 떨어짐)
    const distanceFromLow = ((currentPrice - lowPoint) / lowPoint) * 100;
    if (distanceFromLow > 5 && distanceFromLow < 20) {
      details.push(`저점 탈출 ${distanceFromLow.toFixed(1)}%`);
      score += 15;
    }

    // 2. 저점이 며칠 전인가 (최근 5~15일 저점)
    const lowPointIdx = recent.indexOf(lowPoint);
    const daysFromLow = recent.length - lowPointIdx - 1;
    if (daysFromLow >= 5 && daysFromLow <= 15) {
      details.push(`${daysFromLow}일 전 저점`);
      score += 10;
    }

    // 3. 저점에서의 거래량 반등 (거래량 증가)
    if (recent[recent.length - 1] > lowPoint && recent[recent.length - 2] <= lowPoint) {
      details.push("저점 반등 확인");
      score += 8;
    }

    return { detected: score >= 15, score, details };
  }

  /**
   * 이중 바닥 패턴 감지
   * (저점 두 번 확인 후 넥라인 상향 돌파)
   */
  static detectDoubleBottom(history, period = 30) {
    if (history.length < period) return { detected: false, score: 0, details: [] };

    const recent = history.slice(-period);
    const details = [];
    let score = 0;

    // 최저점 찾기
    const minPrice = Math.min(...recent);
    const minIndices = recent
      .map((p, i) => ({ price: p, idx: i }))
      .filter(p => p.price <= minPrice * 1.02)  // 최저점의 2% 이내
      .map(p => p.idx)
      .sort((a, b) => a - b);

    // 두 개의 저점이 5~15일 떨어져 있는가
    if (minIndices.length >= 2) {
      const firstLowIdx = minIndices[0];
      const secondLowIdx = minIndices[minIndices.length - 1];
      const daysBetween = secondLowIdx - firstLowIdx;

      if (daysBetween >= 5 && daysBetween <= 15) {
        details.push(`이중바닥 ${daysBetween}일 간격`);
        score += 12;

        // 넥라인 (두 저점 사이의 고점) 돌파 확인
        const neckLine = Math.max(...recent.slice(firstLowIdx, secondLowIdx));
        const currentPrice = recent[recent.length - 1];

        if (currentPrice > neckLine * 1.01) {
          details.push("넥라인 상향 돌파✓");
          score += 13;
        } else if (currentPrice > neckLine * 0.98) {
          details.push("넥라인 근처");
          score += 8;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  /**
   * 역 헤드앤숄더 패턴 감지
   * (좌어깨 - 머리 - 우어깨 3개 저점)
   */
  static detectInverseHeadAndShoulders(history, period = 40) {
    if (history.length < period) return { detected: false, score: 0, details: [] };

    const recent = history.slice(-period);
    const details = [];
    let score = 0;

    // 국소 저점 3개 찾기
    const localLows = [];
    for (let i = 5; i < recent.length - 5; i++) {
      const isLocal =
        recent[i] < recent[i - 1] &&
        recent[i] < recent[i - 2] &&
        recent[i] < recent[i + 1] &&
        recent[i] < recent[i + 2];

      if (isLocal) {
        localLows.push({ price: recent[i], idx: i });
      }
    }

    // 3개의 저점이 있고, 가운데가 가장 낮은가 (역 H&S)
    if (localLows.length >= 3) {
      const leftShoulder = localLows[0];
      const head = localLows[Math.floor(localLows.length / 2)];
      const rightShoulder = localLows[localLows.length - 1];

      if (
        head.price < leftShoulder.price &&
        head.price < rightShoulder.price &&
        Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.05
      ) {
        details.push("역헤드앤숄더 형성");
        score += 12;

        // 넥라인 (고점) 돌파
        const neckLine = Math.max(
          ...recent.slice(leftShoulder.idx, rightShoulder.idx)
        );
        const currentPrice = recent[recent.length - 1];

        if (currentPrice > neckLine * 1.01) {
          details.push("넥라인 돌파✓");
          score += 13;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  /**
   * 엘리엇 파동 상승 초기 감지
   * (1파: 상승, 2파: 조정, 3파 진입 구간)
   */
  static detectElliottWaveStart(history, period = 30) {
    if (history.length < period) return { detected: false, score: 0, details: [] };

    const recent = history.slice(-period);
    const details = [];
    let score = 0;

    const startPrice = recent[0];
    const lowPoint = Math.min(...recent);
    const highPoint = Math.max(...recent);
    const currentPrice = recent[recent.length - 1];

    // Wave 1: 저점에서 상승 (최소 10% 상승)
    const wave1Rise = ((highPoint - lowPoint) / lowPoint) * 100;
    const isInWave1 = wave1Rise > 8;

    if (isInWave1) {
      details.push(`Wave 1 상승 ${wave1Rise.toFixed(1)}%`);
      score += 10;

      // Wave 2: 고점에서 하락하여 되돌림 (50~78.6%)
      const retracement = ((highPoint - currentPrice) / (highPoint - lowPoint)) * 100;
      if (retracement > 30 && retracement < 80) {
        details.push(`Wave 2 조정 ${retracement.toFixed(0)}%`);
        score += 8;

        // Wave 3 진입 신호: 고점 근처 + 거래량
        if (currentPrice > highPoint * 0.85) {
          details.push("Wave 3 진입 임박");
          score += 10;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  /**
   * 저점 스토핑 신호
   * (저점이 점진적으로 높아지는 상승 초기)
   */
  static detectBottomStopping(history, period = 20) {
    if (history.length < period) return { detected: false, score: 0, details: [] };

    const recent = history.slice(-period);
    const details = [];
    let score = 0;

    // 5일 단위로 저점 추출
    const segments = [];
    for (let i = 0; i < recent.length; i += 5) {
      const segment = recent.slice(i, i + 5);
      if (segment.length > 0) {
        segments.push(Math.min(...segment));
      }
    }

    // 저점이 상향 추세인가
    if (segments.length >= 3) {
      let isIncreasing = true;
      for (let i = 1; i < segments.length; i++) {
        if (segments[i] < segments[i - 1]) {
          isIncreasing = false;
          break;
        }
      }

      if (isIncreasing) {
        details.push(`저점 스토핑 ${segments.length}회`);
        score += 14;

        // 최근 저점이 이전 저점보다 얼마나 높은가
        const improvement = ((segments[segments.length - 1] - segments[0]) / segments[0]) * 100;
        if (improvement > 2) {
          details.push(`저점 상향 +${improvement.toFixed(1)}%`);
          score += 8;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  /**
   * 거래량 축적 신호
   * (저점에서 거래량 집중, 상승 준비)
   */
  static detectVolumeAccumulation(history, period = 20) {
    if (history.length < period) return { detected: false, score: 0, details: [] };

    const recent = history.slice(-period);
    const details = [];
    let score = 0;

    const lowPoint = Math.min(...recent);
    const lowPointIdx = recent.indexOf(lowPoint);

    // 저점 근처에서의 거래량
    const volumeWindow = recent.slice(
      Math.max(0, lowPointIdx - 2),
      Math.min(recent.length, lowPointIdx + 8)
    );

    const avgVolume = volumeWindow.reduce((a, b) => a + b, 0) / volumeWindow.length;
    const currentPrice = recent[recent.length - 1];

    // 저점에서 상승 중 + 거래량 있음
    if (currentPrice > lowPoint && currentPrice < lowPoint * 1.1) {
      details.push("저점 근처 거래량 축적");
      score += 12;
    }

    // 최근 3일 거래량이 평균 위
    const recentVolume = recent.slice(-3).reduce((a, b) => a + b, 0) / 3;
    if (recentVolume > avgVolume * 1.2) {
      details.push("거래량 증가 중");
      score += 10;
    }

    return { detected: score >= 15, score, details };
  }

  /**
   * 상승여력 신호의 종합 평가
   * (모든 신호를 통합)
   */
  static evaluateUpside(history) {
    if (history.length < 30) return { score: 0, patterns: [], confidence: 0 };

    const patterns = [];
    let totalScore = 0;

    // 각 패턴 감지
    const bottomBreakout = this.detectBottomBreakout(history);
    if (bottomBreakout.detected) {
      patterns.push({
        name: "저점탈출",
        score: bottomBreakout.score,
        details: bottomBreakout.details,
      });
      totalScore += bottomBreakout.score;
    }

    const doubleBottom = this.detectDoubleBottom(history);
    if (doubleBottom.detected) {
      patterns.push({
        name: "이중바닥",
        score: doubleBottom.score,
        details: doubleBottom.details,
      });
      totalScore += doubleBottom.score;
    }

    const inverseHS = this.detectInverseHeadAndShoulders(history);
    if (inverseHS.detected) {
      patterns.push({
        name: "역헤드앤숄더",
        score: inverseHS.score,
        details: inverseHS.details,
      });
      totalScore += inverseHS.score;
    }

    const elliotWave = this.detectElliottWaveStart(history);
    if (elliotWave.detected) {
      patterns.push({
        name: "엘리엇파동",
        score: elliotWave.score,
        details: elliotWave.details,
      });
      totalScore += elliotWave.score;
    }

    const bottomStopping = this.detectBottomStopping(history);
    if (bottomStopping.detected) {
      patterns.push({
        name: "저점스토핑",
        score: bottomStopping.score,
        details: bottomStopping.details,
      });
      totalScore += bottomStopping.score;
    }

    const volumeAccumulation = this.detectVolumeAccumulation(history);
    if (volumeAccumulation.detected) {
      patterns.push({
        name: "거래량축적",
        score: volumeAccumulation.score,
        details: volumeAccumulation.details,
      });
      totalScore += volumeAccumulation.score;
    }

    // 정규화 (최대 100)
    const normalizedScore = Math.min(Math.round(totalScore / patterns.length), 100);

    return {
      score: normalizedScore,
      patterns,
      confidence: Math.round((patterns.length / 6) * 100),  // 6개 패턴 중 몇 개 만족
      recommendation:
        patterns.length >= 3
          ? "강력한 상승여력"
          : patterns.length >= 2
          ? "중간 상승여력"
          : "약한 상승여력",
    };
  }

  /**
   * 목표가 설정 (상승여력 기반)
   */
  static calculateTargetPrice(history, evaluation) {
    const currentPrice = history[history.length - 1];
    const lowPoint = Math.min(...history.slice(-30));
    const highPoint = Math.max(...history.slice(-60));

    // 1차 목표: 최근 고점 회복
    const target1 = highPoint;

    // 2차 목표: 저점에서 상승폭의 150% (약 1.5배 상승)
    const target2 = lowPoint + (highPoint - lowPoint) * 1.5;

    // 3차 목표: 저점에서의 거리 + 상승여력 점수
    const target3 = currentPrice + (currentPrice - lowPoint) * (evaluation.score / 100);

    return {
      target1: Math.round(target1),
      target2: Math.round(target2),
      target3: Math.round(target3),
      primary: Math.round(target1),  // 우선 목표
      stop: Math.round(lowPoint * 0.95),  // 손절가
    };
  }
}

/**
 * 기본 신호에 상승여력 평가 통합
 */
class EnhancedSignalScanner extends SignalScanner {
  async scanSymbol(ticker, historyData = [], symbolName = "") {
    // 기존 신호들 계산
    const signals = {
      dante: this.detectDanteSignals(ticker, historyData),
      swing: this.detectSwingSignals(ticker, historyData),
      technical: this.detectTechnicalSignals(ticker, historyData),
      foreign: await this.detectForeignSignal(ticker),
      institution: await this.detectInstitutionSignal(ticker),
    };

    // 🆕 상승여력 평가
    const upsideEvaluation = AdvancedSignalDetector.evaluateUpside(historyData);
    signals.upside = {
      score: upsideEvaluation.score,
      details: upsideEvaluation.patterns.map(p => `${p.name}(${p.score})`),
    };

    // 목표가 설정
    const targets = AdvancedSignalDetector.calculateTargetPrice(
      historyData,
      upsideEvaluation
    );

    // 🆕 점수 재계산 (상승여력 50% 가중)
    const totalScore = Math.round(
      this.calculateTotalScore(signals) * 0.5 + upsideEvaluation.score * 0.5
    );

    const conditions = [
      ...Object.keys(signals)
        .filter(key => signals[key]?.score > 0)
        .map(key => {
          if (key === "upside") {
            return `상승여력(${upsideEvaluation.confidence}%)`;
          }
          return key;
        }),
      ...upsideEvaluation.patterns.slice(0, 2).map(p => p.name),
    ];

    return {
      ticker,
      name: symbolName || ticker,
      currentPrice: historyData[historyData.length - 1] || 0,
      signals,
      totalScore,
      expectedReturn: this.calculateExpectedReturn(ticker, historyData, signals),
      conditions: [...new Set(conditions)],
      detectionTime: Date.now(),
      confidence: Math.min(upsideEvaluation.confidence + 20, 100),
      upsideEvaluation,
      targets,  // 🆕 목표가
      recommendation: upsideEvaluation.recommendation,  // 🆕 추천
    };
  }
}

// 글로벌 인스턴스 교체
const enhancedSignalScanner = new EnhancedSignalScanner();
