#!/usr/bin/env node

/**
 * Naver 금융 세력 추적 데이터 크롤러
 * 기관, 외국인, 공매도 데이터 수집
 *
 * 사용 방법:
 * node naver-smartmoney-crawler.js [종목코드]
 * 예: node naver-smartmoney-crawler.js 005930
 *
 * 결과: smartmoney-data.json 생성
 */

const https = require('https');
const fs = require('fs');
const url = require('url');

// 설정
const NAVER_TICKER_URL = 'https://finance.naver.com/item/main.naver?code=';
const OUTPUT_FILE = 'smartmoney-data.json';

// 종목 코드 (기본값: 삼성전자)
const TICKER = process.argv[2] || '005930';

// HTTPS 요청 헬퍼
function fetchHtml(urlString) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(urlString, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// HTML에서 정규식으로 데이터 추출
function extractDataFromHtml(html) {
  const result = {
    ticker: TICKER,
    date: new Date().toISOString().split('T')[0],
    institution: {
      buy: 0,
      sell: 0,
      net: 0,
      buyRate: 0.54,
      sellRate: 0.46,
    },
    foreign: {
      buy: 0,
      sell: 0,
      net: 0,
      buyRate: 0.53,
      sellRate: 0.47,
    },
    shortSell: {
      volume: 0,
      ratio: 0.018,
    },
    priceLevel: {
      high: 0,
      mid: 0,
      low: 0,
    },
    source: 'naver-crawler',
    rawData: {}
  };

  try {
    // 예시: 기관 매수/매도 데이터 추출
    // Naver HTML 구조에 따라 조정 필요

    // 패턴 1: "기관 순매매" 테이블에서 숫자 찾기
    const instMatch = html.match(/기관순매매[\s\S]*?(\d+,\d+)[\s\S]*?(\d+,\d+)/);
    if (instMatch) {
      result.institution.buy = parseInt(instMatch[1].replace(/,/g, ''));
      result.institution.sell = parseInt(instMatch[2].replace(/,/g, ''));
      result.institution.net = result.institution.buy - result.institution.sell;
    }

    // 패턴 2: "외국인" 데이터
    const foreignMatch = html.match(/외국인[\s\S]*?(\d+,\d+)[\s\S]*?(\d+,\d+)/);
    if (foreignMatch) {
      result.foreign.buy = parseInt(foreignMatch[1].replace(/,/g, ''));
      result.foreign.sell = parseInt(foreignMatch[2].replace(/,/g, ''));
      result.foreign.net = result.foreign.buy - result.foreign.sell;
    }

    // 패턴 3: "공매도" 데이터
    const shortMatch = html.match(/공매도[\s\S]*?(\d+,\d+)/);
    if (shortMatch) {
      result.shortSell.volume = parseInt(shortMatch[1].replace(/,/g, ''));
    }

    result.rawData = {
      instMatch: instMatch ? instMatch[0].substring(0, 100) : 'no match',
      foreignMatch: foreignMatch ? foreignMatch[0].substring(0, 100) : 'no match',
      shortMatch: shortMatch ? shortMatch[0].substring(0, 100) : 'no match'
    };

  } catch (e) {
    console.error('파싱 오류:', e.message);
  }

  return result;
}

// 메인 함수
async function main() {
  console.log(`\n🔍 Naver 금융에서 ${TICKER} 세력 데이터 수집 중...\n`);

  try {
    const fetchUrl = `${NAVER_TICKER_URL}${TICKER}`;
    console.log(`📥 URL 요청: ${fetchUrl}`);

    const html = await fetchHtml(fetchUrl);
    console.log(`✅ HTML 수신 (${html.length}bytes)`);

    const smartMoneyData = extractDataFromHtml(html);
    console.log('\n📊 추출된 데이터:');
    console.log(`  기관: 매수 ${smartMoneyData.institution.buy}, 매도 ${smartMoneyData.institution.sell}`);
    console.log(`  외국인: 매수 ${smartMoneyData.foreign.buy}, 매도 ${smartMoneyData.foreign.sell}`);
    console.log(`  공매도: ${smartMoneyData.shortSell.volume}주`);

    // JSON 저장
    const data = {
      lastUpdate: new Date().toISOString(),
      data: smartMoneyData
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n✅ 저장 완료: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();

/**
 * ⚠️ 주의사항:
 *
 * 1. Naver 수집 제한
 *    - 과도한 요청은 차단될 수 있음
 *    - User-Agent 헤더 필수
 *    - 요청 간격 조절 필요
 *
 * 2. 데이터 정확도
 *    - 실시간이 아닌 장중/장후 데이터만 제공
 *    - 다른 플랫폼과 차이 있을 수 있음
 *
 * 3. 대체 방법:
 *    a) Puppeteer 사용 (JavaScript 렌더링)
 *    b) 공식 API 활용 (한국투자증권 등)
 *    c) 데이터 구독 서비스 (유료)
 *    d) 사용자 수동 입력 (간단함)
 *
 * 4. 커스터마이징:
 *    - 정규식 패턴은 Naver HTML 구조 변경 시 수정 필요
 *    - 데이터 구조는 app.js의 generateSmartMoneyData()와 일치해야 함
 */
