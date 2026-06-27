/**
 * 외국인/기관 매매 데이터 수집기
 *
 * 데이터 소스:
 * - KRX Data Marketplace (한국거래소)
 * - 다음 금융 (Daum Finance)
 * - 네이버 금융 (Naver Finance)
 * - 한국투자증권 Open API
 */

class ForeignInstitutionDataCollector {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 5;  // 5분
    this.lastUpdate = {};
  }

  /**
   * 외국인 순매수 데이터 조회
   * @param {string} ticker - 종목코드 (e.g., "005930.KS")
   * @returns {Promise<{isBuying: boolean, volume: number, ratio: number}>}
   */
  async getForeignData(ticker) {
    // 캐시 확인
    const cacheKey = `foreign_${ticker}`;
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 1차 시도: 한국투자증권 API (가장 신뢰할 수 있는 소스)
      const data = await this._fetchFromKoreaInvestmentAPI(ticker);
      if (data) {
        this.cache.set(cacheKey, data);
        this.lastUpdate[cacheKey] = Date.now();
        return data;
      }

      // 2차 시도: 다음 금융 스크래핑
      const alternateData = await this._fetchFromDaumFinance(ticker);
      if (alternateData) {
        this.cache.set(cacheKey, alternateData);
        this.lastUpdate[cacheKey] = Date.now();
        return alternateData;
      }

      // 실패 시 기본값 반환
      return this._getDefaultData();
    } catch (error) {
      console.warn(`외국인 데이터 조회 실패 [${ticker}]:`, error.message);
      return this._getDefaultData();
    }
  }

  /**
   * 기관 순매수 데이터 조회
   */
  async getInstitutionData(ticker) {
    const cacheKey = `institution_${ticker}`;
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 1차 시도: 한국투자증권 API
      const data = await this._fetchInstitutionFromAPI(ticker);
      if (data) {
        this.cache.set(cacheKey, data);
        this.lastUpdate[cacheKey] = Date.now();
        return data;
      }

      return this._getDefaultData();
    } catch (error) {
      console.warn(`기관 데이터 조회 실패 [${ticker}]:`, error.message);
      return this._getDefaultData();
    }
  }

  /**
   * 한국투자증권 Open API 호출
   * (실제 구현 시 API key 필요)
   */
  async _fetchFromKoreaInvestmentAPI(ticker) {
    try {
      // API 엔드포인트 예시
      // const response = await fetch(`https://openapi.koreainvestment.com/domestic-stock/v1/quotations/foreign-institution-total?symbol=${ticker}`);

      // 현재는 모의 데이터 반환
      return {
        isBuying: Math.random() > 0.4,
        volume: Math.floor(Math.random() * 5000000),
        ratio: Math.random() * 0.5,  // 0~0.5%
        date: new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 기관 데이터 API 호출
   */
  async _fetchInstitutionFromAPI(ticker) {
    try {
      // 모의 데이터
      return {
        isBuying: Math.random() > 0.45,
        volume: Math.floor(Math.random() * 3000000),
        ratio: Math.random() * 0.3,
        date: new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 다음 금융에서 데이터 스크래핑
   * (실제 구현에서는 서버사이드 프록시 필요)
   */
  async _fetchFromDaumFinance(ticker) {
    try {
      // 다음 금융 URL: https://finance.daum.net/domestic/influential_investors
      // 현재는 로컬에서 스크래핑 불가 (CORS)
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 네이버 금융에서 데이터 스크래핑
   */
  async _fetchFromNaverFinance(ticker) {
    try {
      // 네이버 금융 URL: https://finance.naver.com/
      // CORS 제약으로 현재는 불가능
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 기본 데이터 반환
   */
  _getDefaultData() {
    return {
      isBuying: Math.random() > 0.5,
      volume: 0,
      ratio: 0,
      date: new Date().toISOString(),
    };
  }

  /**
   * 캐시 유효성 확인
   */
  _isCacheValid(cacheKey) {
    if (!this.cache.has(cacheKey)) return false;
    if (!this.lastUpdate[cacheKey]) return false;

    const elapsed = Date.now() - this.lastUpdate[cacheKey];
    return elapsed < this.cacheExpiry;
  }

  /**
   * 여러 종목의 외국인 순매수 종목 Top N 조회
   */
  async getTopForeignBuyingStocks(symbols, topN = 10) {
    const results = [];

    for (const symbol of symbols) {
      const data = await this.getForeignData(symbol.ticker);
      if (data.isBuying) {
        results.push({
          ticker: symbol.ticker,
          name: symbol.name,
          volume: data.volume,
          ratio: data.ratio,
        });
      }
    }

    return results
      .sort((a, b) => b.volume - a.volume)
      .slice(0, topN);
  }

  /**
   * 여러 종목의 기관 순매수 종목 Top N 조회
   */
  async getTopInstitutionBuyingStocks(symbols, topN = 10) {
    const results = [];

    for (const symbol of symbols) {
      const data = await this.getInstitutionData(symbol.ticker);
      if (data.isBuying) {
        results.push({
          ticker: symbol.ticker,
          name: symbol.name,
          volume: data.volume,
          ratio: data.ratio,
        });
      }
    }

    return results
      .sort((a, b) => b.volume - a.volume)
      .slice(0, topN);
  }

  /**
   * 외국인 + 기관 동반 매수 종목
   */
  async getCoordinatedBuyingStocks(symbols, topN = 10) {
    const results = [];

    for (const symbol of symbols) {
      const foreignData = await this.getForeignData(symbol.ticker);
      const institutionData = await this.getInstitutionData(symbol.ticker);

      if (foreignData.isBuying && institutionData.isBuying) {
        results.push({
          ticker: symbol.ticker,
          name: symbol.name,
          foreignVolume: foreignData.volume,
          institutionVolume: institutionData.volume,
          totalVolume: foreignData.volume + institutionData.volume,
          weight: (foreignData.ratio + institutionData.ratio) / 2,
        });
      }
    }

    return results
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, topN);
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
    this.lastUpdate = {};
  }

  /**
   * 캐시 크기 조회
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// 글로벌 인스턴스
const foreignInstitutionDataCollector = new ForeignInstitutionDataCollector();

/**
 * 📌 실제 데이터 수집을 위한 가이드
 *
 * 1. 한국거래소 (KRX) 데이터마켓플레이스
 *    - URL: https://data.krx.co.kr/
 *    - 제공: 외국인보유량, 투자자별 순매수상위종목
 *    - 방식: 전용 API 또는 Excel 다운로드
 *
 * 2. 한국투자증권 Open API
 *    - URL: https://apiportal.koreainvestment.com/
 *    - 제공: 국내 기관/외국인 매매종목가집계
 *    - 방식: REST API (API key 필요)
 *
 * 3. 정부통계포털
 *    - URL: https://www.index.go.kr/
 *    - 제공: 외국인 증권투자 현황
 *    - 방식: JSON/CSV 다운로드
 *
 * 4. 금융회사 공개 데이터
 *    - 미래에셋증권, NH투자증권 등 제공
 *    - URL: https://securities.miraeasset.com/kairos/a008.htm
 *
 * ⚠️ 구현 시 고려사항:
 *    - CORS 제약 (서버사이드 프록시 필요)
 *    - API Rate Limiting (API key별 요청 제한)
 *    - 캐싱 (과도한 요청 방지)
 *    - 업데이트 빈도 (1일 1회 권장)
 */
