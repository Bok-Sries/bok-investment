/**
 * 종목 유니버스 제공 API
 *  - domestic: 코스닥 시가총액 상위 100 (네이버 모바일 API 실시간 조회, 실패 시 폴백)
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

// 코스닥 폴백 목록(네이버 조회 실패 시): 대표 대형 코스닥 종목
const KOSDAQ_FALLBACK = [
  ["247540", "에코프로비엠"], ["086520", "에코프로"], ["196170", "알테오젠"], ["028300", "HLB"],
  ["348370", "엔켐"], ["058470", "리노공업"], ["068760", "셀트리온제약"], ["214150", "클래시스"],
  ["277810", "레인보우로보틱스"], ["263750", "펄어비스"], ["035900", "JYP Ent."], ["041510", "에스엠"],
  ["141080", "리가켐바이오"], ["145020", "휴젤"], ["357780", "솔브레인"], ["240810", "원익IPS"],
  ["005290", "동진쎄미켐"], ["039030", "이오테크닉스"], ["036930", "주성엔지니어링"], ["293490", "카카오게임즈"],
  ["112040", "위메이드"], ["087010", "펩트론"], ["257720", "실리콘투"], ["214450", "파마리서치"],
  ["310210", "보로노이"], ["403870", "HPSP"], ["089030", "테크윙"], ["095340", "ISC"],
  ["067310", "하나마이크론"], ["033640", "네패스"], ["078600", "대주전자재료"], ["183300", "코미코"],
  ["121600", "나노신소재"], ["012510", "더존비즈온"], ["140410", "메지온"], ["323990", "박셀바이오"],
  ["298380", "에이비엘바이오"], ["053800", "안랩"], ["078340", "컴투스"], ["086900", "메디톡스"],
  ["195940", "HK이노엔"], ["328130", "루닛"], ["376300", "디어유"], ["099190", "아이센스"],
  ["064760", "티씨케이"], ["253450", "스튜디오드래곤"], ["131970", "두산테스나"], ["222800", "심텍"],
  ["145720", "덴티움"], ["122870", "와이지엔터테인먼트"],
].map(([code, name]) => ({ ticker: `${code}.KQ`, name }));

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

async function fetchKosdaqTop100() {
  // 네이버 모바일 시가총액 API (UTF-8 JSON)
  const url = "https://m.stock.naver.com/api/stocks/marketValue/KOSDAQ?page=1&pageSize=100";
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
      return { ticker: `${code}.KQ`, name };
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

  // domestic (KOSDAQ)
  if (cache.domestic && Date.now() - cachedAt.domestic < CACHE_MS) {
    response.status(200).json(cache.domestic);
    return;
  }
  let symbols = KOSDAQ_FALLBACK;
  let source = "kosdaq-fallback";
  try {
    symbols = await fetchKosdaqTop100();
    source = "naver-marketcap";
  } catch (error) {
    symbols = KOSDAQ_FALLBACK;
    source = "kosdaq-fallback";
  }
  const body = { market: "domestic", source, symbols };
  cache.domestic = body;
  cachedAt.domestic = Date.now();
  response.status(200).json(body);
}
