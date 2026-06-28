/**
 * 고도화된 신호 감지 엔진 (일(日) 단위 상승여력 패턴)
 *
 * 패턴(모두 일봉 종가 기반):
 * 1. 저점 탈출 (Bottom Breakout)
 * 2. 이중 바닥 (Double Bottom)
 * 3. 역 헤드앤숄더 (Inverse H&S)
 * 4. 엘리엇 파동 (1~3파)
 * 5. 저점 스토핑 (저점 점진 상향)
 * 6. 거래량 축적 (Volume Accumulation) — 가격은 종가, 거래량은 실제 거래량으로 분리 계산
 *
 * 주의: 패턴 함수는 '종가 숫자 배열'(closes)을 입력으로 받는다.
 *       거래량 축적만 (closes, volumes) 두 배열을 받는다.
 */

class AdvancedSignalDetector {
  // 1) 저점 탈출
  static detectBottomBreakout(closes, period = 20) {
    if (closes.length < period) return { detected: false, score: 0, details: [] };
    const recent = closes.slice(-period);
    const details = [];
    let score = 0;

    const lowPoint = Math.min(...recent);
    const currentPrice = recent[recent.length - 1];

    const distanceFromLow = lowPoint > 0 ? ((currentPrice - lowPoint) / lowPoint) * 100 : 0;
    if (distanceFromLow > 5 && distanceFromLow < 20) {
      details.push(`저점 탈출 ${distanceFromLow.toFixed(1)}%`);
      score += 15;
    }

    const lowPointIdx = recent.indexOf(lowPoint);
    const daysFromLow = recent.length - lowPointIdx - 1;
    if (daysFromLow >= 5 && daysFromLow <= 15) {
      details.push(`${daysFromLow}일 전 저점`);
      score += 10;
    }

    if (recent[recent.length - 1] > lowPoint && recent[recent.length - 2] <= lowPoint) {
      details.push("저점 반등 확인");
      score += 8;
    }

    return { detected: score >= 15, score, details };
  }

  // 2) 이중 바닥
  static detectDoubleBottom(closes, period = 30) {
    if (closes.length < period) return { detected: false, score: 0, details: [] };
    const recent = closes.slice(-period);
    const details = [];
    let score = 0;

    const minPrice = Math.min(...recent);
    const minIndices = recent
      .map((p, i) => ({ price: p, idx: i }))
      .filter((p) => p.price <= minPrice * 1.02)
      .map((p) => p.idx)
      .sort((a, b) => a - b);

    if (minIndices.length >= 2) {
      const firstLowIdx = minIndices[0];
      const secondLowIdx = minIndices[minIndices.length - 1];
      const daysBetween = secondLowIdx - firstLowIdx;

      if (daysBetween >= 5 && daysBetween <= 15) {
        details.push(`이중바닥 ${daysBetween}일 간격`);
        score += 12;

        const neckLine = Math.max(...recent.slice(firstLowIdx, secondLowIdx + 1));
        const currentPrice = recent[recent.length - 1];
        if (currentPrice > neckLine * 1.01) {
          details.push("넥라인 상향 돌파 ✓");
          score += 13;
        } else if (currentPrice > neckLine * 0.98) {
          details.push("넥라인 근처");
          score += 8;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  // 3) 역 헤드앤숄더
  static detectInverseHeadAndShoulders(closes, period = 40) {
    if (closes.length < period) return { detected: false, score: 0, details: [] };
    const recent = closes.slice(-period);
    const details = [];
    let score = 0;

    const localLows = [];
    for (let i = 5; i < recent.length - 5; i++) {
      const isLocal =
        recent[i] < recent[i - 1] && recent[i] < recent[i - 2] &&
        recent[i] < recent[i + 1] && recent[i] < recent[i + 2];
      if (isLocal) localLows.push({ price: recent[i], idx: i });
    }

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
        const neckLine = Math.max(...recent.slice(leftShoulder.idx, rightShoulder.idx + 1));
        const currentPrice = recent[recent.length - 1];
        if (currentPrice > neckLine * 1.01) {
          details.push("넥라인 돌파 ✓");
          score += 13;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  // 4) 엘리엇 파동 (1~3파 초기)
  static detectElliottWaveStart(closes, period = 30) {
    if (closes.length < period) return { detected: false, score: 0, details: [] };
    const recent = closes.slice(-period);
    const details = [];
    let score = 0;

    const lowPoint = Math.min(...recent);
    const highPoint = Math.max(...recent);
    const currentPrice = recent[recent.length - 1];
    const wave1Rise = lowPoint > 0 ? ((highPoint - lowPoint) / lowPoint) * 100 : 0;

    if (wave1Rise > 8) {
      details.push(`1파 상승 ${wave1Rise.toFixed(1)}%`);
      score += 10;
      const denom = highPoint - lowPoint;
      const retracement = denom > 0 ? ((highPoint - currentPrice) / denom) * 100 : 0;
      if (retracement > 30 && retracement < 80) {
        details.push(`2파 조정 ${retracement.toFixed(0)}%`);
        score += 8;
        if (currentPrice > highPoint * 0.85) {
          details.push("3파 진입 임박");
          score += 10;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  // 5) 저점 스토핑 (저점 점진 상향)
  static detectBottomStopping(closes, period = 20) {
    if (closes.length < period) return { detected: false, score: 0, details: [] };
    const recent = closes.slice(-period);
    const details = [];
    let score = 0;

    const segments = [];
    for (let i = 0; i < recent.length; i += 5) {
      const segment = recent.slice(i, i + 5);
      if (segment.length > 0) segments.push(Math.min(...segment));
    }

    if (segments.length >= 3) {
      let isIncreasing = true;
      for (let i = 1; i < segments.length; i++) {
        if (segments[i] < segments[i - 1]) { isIncreasing = false; break; }
      }
      if (isIncreasing) {
        details.push(`저점 스토핑 ${segments.length}회`);
        score += 14;
        const improvement = segments[0] > 0 ? ((segments[segments.length - 1] - segments[0]) / segments[0]) * 100 : 0;
        if (improvement > 2) {
          details.push(`저점 상향 +${improvement.toFixed(1)}%`);
          score += 8;
        }
      }
    }

    return { detected: score >= 15, score, details };
  }

  // 6) 거래량 축적 — 가격(closes)과 거래량(volumes)을 분리해서 사용
  static detectVolumeAccumulation(closes, volumes, period = 20) {
    if (closes.length < period) return { detected: false, score: 0, details: [] };
    const recentClose = closes.slice(-period);
    const details = [];
    let score = 0;

    const lowPoint = Math.min(...recentClose);
    const currentPrice = recentClose[recentClose.length - 1];

    // 저점 근처에서 횡보(상승 준비 구간)
    if (currentPrice > lowPoint && currentPrice < lowPoint * 1.1) {
      details.push("저점권 거래 집중");
      score += 12;
    }

    // 실제 거래량이 있을 때만 거래량 증가 판단
    if (Array.isArray(volumes) && volumes.length >= period && volumes.some((v) => v > 0)) {
      const vWindow = volumes.slice(-period);
      const avgVolume = vWindow.reduce((a, b) => a + b, 0) / vWindow.length;
      const recentVolume = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
      if (avgVolume > 0 && recentVolume > avgVolume * 1.2) {
        details.push("거래량 증가 중");
        score += 10;
      }
    }

    return { detected: score >= 15, score, details };
  }

  // ── 상승여력 종합 평가 ──
  static evaluateUpside(closes, volumes) {
    if (!Array.isArray(closes) || closes.length < 30) {
      return { score: 0, patterns: [], confidence: 0, recommendation: "신호 없음" };
    }

    const patterns = [];
    let totalScore = 0;
    const add = (name, res) => {
      if (res.detected) {
        patterns.push({ name, score: res.score, details: res.details });
        totalScore += res.score;
      }
    };

    add("저점탈출", this.detectBottomBreakout(closes));
    add("이중바닥", this.detectDoubleBottom(closes));
    add("역헤드앤숄더", this.detectInverseHeadAndShoulders(closes));
    add("엘리엇파동", this.detectElliottWaveStart(closes));
    add("저점스토핑", this.detectBottomStopping(closes));
    add("거래량축적", this.detectVolumeAccumulation(closes, volumes));

    // 합산 후 100 상한 (예전엔 patterns.length로 나눠 0개일 때 NaN, 많을수록 평균이 낮아지는 역설이 있었음)
    const normalizedScore = Math.min(totalScore, 100);

    return {
      score: normalizedScore,
      patterns,
      confidence: Math.round((patterns.length / 6) * 100),
      recommendation:
        patterns.length >= 3 ? "강력한 상승여력" :
        patterns.length >= 2 ? "중간 상승여력" :
        patterns.length >= 1 ? "약한 상승여력" : "신호 없음",
    };
  }

  // ── 목표가 / 손절가 (일봉 기준) ──
  static calculateTargetPrice(closes, evaluation) {
    if (!Array.isArray(closes) || closes.length === 0) {
      return { target1: 0, target2: 0, target3: 0, primary: 0, stop: 0 };
    }
    const currentPrice = closes[closes.length - 1];
    const lowPoint = Math.min(...closes.slice(-30));
    const highPoint = Math.max(...closes.slice(-60));

    const target1 = highPoint;
    const target2 = lowPoint + (highPoint - lowPoint) * 1.5;
    const target3 = currentPrice + (currentPrice - lowPoint) * ((evaluation?.score || 0) / 100);

    return {
      target1: Math.round(target1),
      target2: Math.round(target2),
      target3: Math.round(target3),
      primary: Math.round(target1),
      stop: Math.round(lowPoint * 0.95),
    };
  }
}

/**
 * 기본 신호 + 상승여력 평가 통합 (일 단위)
 */
class EnhancedSignalScanner extends SignalScanner {
  scanSymbol(ticker, historyData = [], symbolName = "") {
    const { closes, highs, lows, volumes, hasVolume } = this._normalize(historyData);

    const signals = {
      dante: this.detectDanteSignals(closes),
      swing: this.detectSwingSignals(closes, volumes, hasVolume),
      technical: this.detectTechnicalSignals(closes, highs, lows, volumes, hasVolume),
      foreign: this.detectFlowSignal(closes, volumes, hasVolume),
      institution: this.detectAccumulationSignal(closes, volumes, hasVolume),
    };

    // 상승여력 평가
    const upside = AdvancedSignalDetector.evaluateUpside(closes, volumes);
    signals.upside = {
      score: upside.score,
      details: upside.patterns.map((p) => `${p.name}(${p.score})`),
    };

    const targets = AdvancedSignalDetector.calculateTargetPrice(closes, upside);

    // 기본 신호 50% + 상승여력 50%
    const baseScore = this.calculateTotalScore(signals); // upside 키는 가중치에 없어 자동 제외됨
    const totalScore = Math.round(baseScore * 0.5 + upside.score * 0.5);

    const conditions = [...new Set([
      ...Object.keys(signals)
        .filter((key) => signals[key]?.score > 0)
        .map((key) => (key === "upside" ? `상승여력(${upside.confidence}%)` : key)),
      ...upside.patterns.slice(0, 2).map((p) => p.name),
    ])];

    return {
      ticker,
      name: symbolName || ticker,
      currentPrice: closes.length ? closes[closes.length - 1] : 0,
      signals,
      totalScore,
      expectedReturn: this.calculateExpectedReturn(closes, signals),
      conditions,
      detectionTime: Date.now(),
      confidence: Math.min(upside.confidence + 20, 100),
      upsideEvaluation: upside,
      targets,
      recommendation: upside.recommendation,
    };
  }
}

// 글로벌 인스턴스 교체
const enhancedSignalScanner = new EnhancedSignalScanner();
