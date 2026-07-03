/**
 * 종목 유니버스 제공 API
 *  - domestic: 코스피 시가총액 상위 100 — 당일 종가 기준 (네이버 모바일 API 실시간 조회, 실패 시 폴백)
 *  - global:   나스닥 100 구성종목 (안정적이므로 정적 목록)
 *
 * GET /api/universe?market=domestic | global
 */

const FETCH_TIMEOUT_MS = 7000;

function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
  ]);
}

// 코스피 폴백 목록(네이버 조회 실패 시): 대표 대형 코스피 종목
const KOSPI_FALLBACK = [
  ["005930", "삼성전자"], ["000660", "SK하이닉스"], ["373220", "LG에너지솔루션"], ["207940", "삼성바이오로직스"],
  ["005380", "현대차"], ["000270", "기아"], ["068270", "셀트리온"], ["035420", "NAVER"],
  ["105560", "KB금융"], ["055550", "신한지주"], ["005490", "POSCO홀딩스"], ["028260", "삼성물산"],
  ["012330", "현대모비스"], ["051910", "LG화학"], ["006400", "삼성SDI"], ["035720", "카카오"],
  ["086790", "하나금융지주"], ["032830", "삼성생명"], ["012450", "한화에어로스페이스"], ["138040", "메리츠금융지주"],
  ["066570", "LG전자"], ["033780", "KT&G"], ["096770", "SK이노베이션"], ["316140", "우리금융지주"],
  ["259960", "크래프톤"], ["000810", "삼성화재"], ["010130", "고려아연"], ["015760", "한국전력"],
  ["030200", "KT"], ["017670", "SK텔레콤"], ["034020", "두산에너빌리티"], ["024110", "기업은행"],
  ["011200", "HMM"], ["009150", "삼성전기"], ["003670", "포스코퓨처엠"], ["010950", "S-Oil"],
  ["090430", "아모레퍼시픽"], ["003550", "LG"], ["009540", "HD한국조선해양"], ["086280", "현대글로비스"],
  ["006800", "미래에셋증권"], ["034730", "SK"], ["003490", "대한항공"], ["011170", "롯데케미칼"],
  ["352820", "하이브"], ["036570", "엔씨소프트"], ["011070", "LG이노텍"], ["329180", "HD현대중공업"],
  ["042700", "한미반도체"], ["047810", "한국항공우주"],
].map(([code, name]) => ({ ticker: `${code}.KS`, name }));

// 나스닥 100 (대표 구성종목)
const NASDAQ100 = [
  ["AAPL", "Apple"], ["MSFT", "Microsoft"], ["NVDA", "NVIDIA"], ["AMZN", "Amazon"], ["AVGO", "Broadcom"],
  ["META", "Meta Platforms"], ["TSLA", "Tesla"], ["GOOGL", "Alphabet A"], ["GOOG", "Alphabet C"], ["COST", "Costco"],
  ["NFLX", "Netflix"], ["ADBE", "Adobe"], ["AMD", "AMD"], ["PEP", "PepsiCo"], ["LIN", "Linde"],
  ["CSCO", "Cisco"], ["TMUS", "T-Mobile US"], ["INTU", "Intuit"], ["QCOM", "Qualcomm"], ["TXN", "Texas Instruments"],
  ["AMAT", "Applied Materials"], ["AMGN", "Amgen"], ["ISRG", "Intuitive Surgical"], ["BKNG", "Booking"], ["HON", "Honeywell"],
  ["CMCSA", "Comcast"], ["ADP", "ADP"], ["VRTX", "Vertex Pharma"], ["GILD", "Gilead"], ["ADI", "Analog Devices"],
  ["REGN", "Regeneron"], ["MU", "Micron"], ["LRCX", "Lam Research"], ["PANW", "Palo Alto Networks"], ["MELI", "MercadoLibre"],
  ["KLAC", "KLA"], ["SBUX", "Starbucks"], ["SNPS", "Synopsys"], ["CDNS", "Cadence"], ["CRWD", "CrowdStrike"],
  ["MAR", "Marriott"], ["ABNB", "Airbnb"], ["ORLY", "O'Reilly"], ["CTAS", "Cintas"], ["ASML", "ASML"],
  ["NXPI", "NXP Semiconductors"], ["MNST", "Monster Beverage"], ["FTNT", "Fortinet"], ["WDAY", "Workday"], ["PCAR", "PACCAR"],
  ["ROP", "Roper"], ["ADSK", "Autodesk"], ["CPRT", "Copart"], ["PAYX", "Paychex"], ["KDP", "Keurig Dr Pepper"],
  ["CHTR", "Charter"], ["AEP", "American Electric Power"], ["MRVL", "Marvell"], ["DXCM", "Dexcom"], ["KHC", "Kraft Heinz"],
  ["IDXX", "IDEXX"], ["FAST", "Fastenal"], ["EXC", "Exelon"], ["CSGP", "CoStar"], ["TTD", "Trade Desk"],
  ["EA", "Electronic Arts"], ["CCEP", "Coca-Cola Europacific"], ["VRSK", "Verisk"], ["GEHC", "GE HealthCare"], ["CTSH", "Cognizant"],
  ["XEL", "Xcel Energy"], ["BKR", "Baker Hughes"], ["ON", "ON Semiconductor"], ["BIIB", "Biogen"], ["DDOG", "Datadog"],
  ["ANSS", "Ansys"], ["ZS", "Zscaler"], ["TEAM", "Atlassian"], ["WBD", "Warner Bros. Discovery"], ["GFS", "GlobalFoundries"],
  ["MDB", "MongoDB"], ["ARM", "Arm Holdings"], ["MRNA", "Moderna"], ["LULU", "Lululemon"], ["PDD", "PDD Holdings"],
  ["CDW", "CDW"], ["ROST", "Ross Stores"], ["FANG", "Diamondback Energy"], ["DASH", "DoorDash"], ["TTWO", "Take-Two"],
].map(([ticker, name]) => ({ ticker, name }));

let cache = { domestic: null, global: null };
let cachedAt = { domestic: 0, global: 0 };
const CACHE_MS = 10 * 60 * 1000;

async function fetchKospiTop100() {
  // 네이버 모바일 시가총액 API (UTF-8 JSON) — 당일 종가 기준 코스피 시총 상위 100
  const url = "https://m.stock.naver.com/api/stocks/marketValue/KOSPI?page=1&pageSize=100";
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://m.stock.naver.com/",
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  const rows = payload?.stocks || payload?.datas || payload?.result || [];
  const list = rows
    .map((row) => {
      const code = String(row.itemCode || row.code || row.cd || "").trim();
      const name = String(row.stockName || row.name || row.nm || "").trim();
      if (!/^\d{6}$/.test(code) || !name) return null;
      return { ticker: `${code}.KS`, name };
    })
    .filter(Boolean)
    .slice(0, 100);
  if (list.length < 20) throw new Error("too few rows");
  return list;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1200");
  response.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const market = (url.searchParams.get("market") || "domestic").toLowerCase();

  if (market === "global") {
    response.status(200).json({ market: "global", source: "nasdaq100-static", symbols: NASDAQ100 });
    return;
  }

  // domestic (KOSPI)
  if (cache.domestic && Date.now() - cachedAt.domestic < CACHE_MS) {
    response.status(200).json(cache.domestic);
    return;
  }
  let symbols = KOSPI_FALLBACK;
  let source = "kospi-fallback";
  try {
    symbols = await fetchKospiTop100();
    source = "naver-marketcap-kospi";
  } catch (error) {
    symbols = KOSPI_FALLBACK;
    source = "kospi-fallback";
  }
  const body = { market: "domestic", source, symbols };
  cache.domestic = body;
  cachedAt.domestic = Date.now();
  response.status(200).json(body);
}
