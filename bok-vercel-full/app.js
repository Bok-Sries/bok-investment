const samples = {
  NVDA: [126.4, 127.8, 129.2, 128.5, 130.1, 132.4, 131.8, 134.6, 136.2, 135.4, 137.1, 139.8, 138.9],
  AAPL: [187.2, 186.8, 188.1, 189.5, 188.7, 190.2, 191.4, 190.9, 192.6, 193.1, 192.8, 194.3, 195.2],
  MSFT: [424.2, 426.1, 427.4, 425.8, 429.6, 431.2, 430.7, 433.8, 435.4, 434.1, 436.6, 438.9, 440.2],
  TSLA: [168.4, 171.2, 169.8, 174.5, 177.2, 175.9, 181.4, 179.2, 183.6, 186.8, 184.4, 188.1, 191.6],
  GOOGL: [162.8, 164.1, 163.7, 165.2, 166.4, 165.8, 167.9, 169.1, 168.6, 170.3, 171.2, 172.8, 173.5],
  AMZN: [181.4, 182.6, 184.2, 183.8, 185.5, 186.7, 187.1, 188.9, 187.8, 190.2, 191.6, 190.8, 192.5],
  "005930.KS": [75600, 76200, 75900, 76800, 77500, 77100, 78200, 78800, 78400, 79300, 80100, 79600, 80800],
  "000660.KS": [184000, 186500, 185000, 188000, 190500, 189000, 192000, 195000, 193500, 197000, 199000, 198500, 201000],
  "035420.KS": [192000, 193500, 191500, 194000, 196000, 195500, 198000, 197500, 199500, 201000, 200500, 202500, 204000],
  "035720.KS": [48200, 49100, 48800, 49700, 50300, 49900, 50800, 51200, 50900, 51800, 52200, 51900, 52600],
};

const tickerMeta = {
  NVDA: "NVIDIA",
  AAPL: "Apple",
  MSFT: "Microsoft",
  TSLA: "Tesla",
  GOOGL: "Alphabet",
  AMZN: "Amazon",
  "005930.KS": "삼성전자",
  "000660.KS": "SK하이닉스",
  "035420.KS": "NAVER",
  "035720.KS": "카카오",
};

const fundamentals = {
  NVDA: { dividend: 18, liquidity: 124, stability: 82, profitability: 64, growth: 88, per: 2.9, pbr: 3.2, roe: 3.6, eps: 2.8, bps: 1.6, foreignFlow: 1420000, institutionFlow: 820000 },
  AAPL: { dividend: 38, liquidity: 118, stability: 96, profitability: 58, growth: 42, per: 2.1, pbr: 3.6, roe: 3.1, eps: 2.2, bps: 1.5, foreignFlow: 920000, institutionFlow: 310000 },
  MSFT: { dividend: 32, liquidity: 138, stability: 118, profitability: 62, growth: 56, per: 2.3, pbr: 2.8, roe: 2.9, eps: 2.4, bps: 1.8, foreignFlow: 760000, institutionFlow: 680000 },
  TSLA: { dividend: 0, liquidity: 104, stability: 74, profitability: 26, growth: 52, per: 3.8, pbr: 2.4, roe: 1.2, eps: 1.0, bps: 1.1, foreignFlow: -640000, institutionFlow: -280000 },
  GOOGL: { dividend: 12, liquidity: 142, stability: 124, profitability: 54, growth: 48, per: 1.8, pbr: 2.0, roe: 2.1, eps: 2.0, bps: 1.7, foreignFlow: 510000, institutionFlow: 420000 },
  AMZN: { dividend: 0, liquidity: 116, stability: 86, profitability: 34, growth: 66, per: 2.7, pbr: 2.1, roe: 1.5, eps: 1.4, bps: 1.3, foreignFlow: 430000, institutionFlow: 520000 },
  "005930.KS": { dividend: 42, liquidity: 132, stability: 128, profitability: 39, growth: 44, per: 1.4, pbr: 0.9, roe: 1.4, eps: 1.6, bps: 1.9, foreignFlow: 1165000, institutionFlow: 382000 },
  "000660.KS": { dividend: 22, liquidity: 108, stability: 92, profitability: 46, growth: 78, per: 2.4, pbr: 1.8, roe: 2.2, eps: 2.5, bps: 1.4, foreignFlow: 884000, institutionFlow: 612000 },
  "035420.KS": { dividend: 10, liquidity: 126, stability: 102, profitability: 31, growth: 28, per: 1.9, pbr: 1.3, roe: 1.0, eps: 0.9, bps: 1.2, foreignFlow: -120000, institutionFlow: 84000 },
  "035720.KS": { dividend: 0, liquidity: 96, stability: 78, profitability: 18, growth: 22, per: 2.8, pbr: 1.6, roe: 0.7, eps: 0.6, bps: 1.0, foreignFlow: -260000, institutionFlow: -190000 },
};

const companyProfiles = {
  NVDA: { sector: "Technology", industry: "Semiconductors", country: "United States", employees: 29600, cap: "Mega", beta: 1.72 },
  AAPL: { sector: "Technology", industry: "Consumer Electronics", country: "United States", employees: 161000, cap: "Mega", beta: 1.21 },
  MSFT: { sector: "Technology", industry: "Software Infrastructure", country: "United States", employees: 221000, cap: "Mega", beta: 0.89 },
  TSLA: { sector: "Consumer Cyclical", industry: "Auto Manufacturers", country: "United States", employees: 140473, cap: "Large", beta: 2.05 },
  GOOGL: { sector: "Communication Services", industry: "Internet Content", country: "United States", employees: 182502, cap: "Mega", beta: 1.05 },
  AMZN: { sector: "Consumer Cyclical", industry: "Internet Retail", country: "United States", employees: 1525000, cap: "Mega", beta: 1.16 },
  "005930.KS": { sector: "Technology", industry: "Consumer Electronics", country: "Korea", employees: 124000, cap: "Mega", beta: 1.08 },
  "000660.KS": { sector: "Technology", industry: "Memory Semiconductors", country: "Korea", employees: 32000, cap: "Large", beta: 1.34 },
  "035420.KS": { sector: "Communication Services", industry: "Internet Content", country: "Korea", employees: 4300, cap: "Large", beta: 1.12 },
  "035720.KS": { sector: "Communication Services", industry: "Internet Content", country: "Korea", employees: 3900, cap: "Mid", beta: 1.48 },
};

const marketIndices = {
  KOSPI: { symbol: "KOSPI:KRX", value: 2742.3, change: 0.008, source: "종가" },
  KOSDAQ: { symbol: "KQ11:KOSDAQ", value: 872.1, change: 0.004, source: "종가" },
  NASDAQ: { symbol: ".IXIC:INDEXNASDAQ", value: 16384.2, change: 0.011, source: "종가" },
  SP500: { symbol: ".INX:INDEXSP", value: 5178.8, change: 0.006, source: "종가" },
  DOW: { symbol: ".DJI:INDEXDJX", value: 39424.7, change: -0.002, source: "종가" },
};

let marketIndicesLoaded = false;

const symbolCatalog = [
  { ticker: "NVDA", name: "NVIDIA", market: "global", aliases: ["엔비디아", "nvidia corporation", "nvda"] },
  { ticker: "AAPL", name: "Apple", market: "global", aliases: ["애플", "apple inc", "iphone", "aapl"] },
  { ticker: "MSFT", name: "Microsoft", market: "global", aliases: ["마이크로소프트", "ms", "microsoft corp", "msft"] },
  { ticker: "TSLA", name: "Tesla", market: "global", aliases: ["테슬라", "tesla inc", "tsla"] },
  { ticker: "GOOGL", name: "Alphabet", market: "global", aliases: ["구글", "알파벳", "google", "googl"] },
  { ticker: "AMZN", name: "Amazon", market: "global", aliases: ["아마존", "amazon.com", "amzn"] },
  { ticker: "005930.KS", name: "삼성전자", market: "domestic", aliases: ["삼전", "samsung electronics", "samsung", "005930"] },
  { ticker: "000660.KS", name: "SK하이닉스", market: "domestic", aliases: ["에스케이하이닉스", "하이닉스", "sk hynix", "000660"] },
  { ticker: "035420.KS", name: "NAVER", market: "domestic", aliases: ["네이버", "naver", "035420"] },
  { ticker: "035720.KS", name: "카카오", market: "domestic", aliases: ["kakao", "035720"] },
  { ticker: "138080.KQ", name: "오이솔루션", market: "domestic", aliases: ["오이솔루션", "oisolution", "oi solution", "138080"] },
  { ticker: "247540.KQ", name: "에코프로비엠", market: "domestic", aliases: ["에코프로비엠", "ecopro bm", "247540"] },
  { ticker: "086520.KQ", name: "에코프로", market: "domestic", aliases: ["ecopro", "086520"] },
  { ticker: "091990.KQ", name: "셀트리온헬스케어", market: "domestic", aliases: ["셀트리온헬스", "celltrion healthcare", "091990"] },
  { ticker: "068270.KS", name: "셀트리온", market: "domestic", aliases: ["celltrion", "068270"] },
  { ticker: "207940.KS", name: "삼성바이오로직스", market: "domestic", aliases: ["삼바", "samsung biologics", "207940"] },
  { ticker: "051910.KS", name: "LG화학", market: "domestic", aliases: ["엘지화학", "lg chem", "051910"] },
  { ticker: "373220.KS", name: "LG에너지솔루션", market: "domestic", aliases: ["엘지에너지솔루션", "lg energy solution", "373220"] },
  { ticker: "005380.KS", name: "현대차", market: "domestic", aliases: ["현대자동차", "hyundai motor", "005380"] },
  { ticker: "000270.KS", name: "기아", market: "domestic", aliases: ["kia", "000270"] },
  { ticker: "105560.KS", name: "KB금융", market: "domestic", aliases: ["케이비금융", "kb financial", "105560"] },
  { ticker: "055550.KS", name: "신한지주", market: "domestic", aliases: ["신한금융지주", "shinhan", "055550"] },
  { ticker: "035900.KQ", name: "JYP Ent.", market: "domestic", aliases: ["제이와이피", "jyp", "jyp ent", "035900"] },
  { ticker: "352820.KS", name: "하이브", market: "domestic", aliases: ["hybe", "352820"] },
  { ticker: "041510.KQ", name: "에스엠", market: "domestic", aliases: ["sm", "sment", "041510"] },
  { ticker: "240810.KQ", name: "원익IPS", market: "domestic", aliases: ["원익아이피에스", "원익 ips", "wonik ips", "ips", "240810"] },
  { ticker: "011790.KS", name: "SKC", market: "domestic", aliases: ["에스케이씨", "skc", "011790"] },
  { ticker: "010170.KQ", name: "대한광통신", market: "domestic", aliases: ["대한광통신", "dh light", "010170"] },
  { ticker: "042700.KS", name: "한미반도체", market: "domestic", aliases: ["한미반도체", "hanmi semiconductor", "042700"] },
  { ticker: "036930.KQ", name: "주성엔지니어링", market: "domestic", aliases: ["주성엔지니어링", "jusung engineering", "036930"] },
  { ticker: "058470.KQ", name: "리노공업", market: "domestic", aliases: ["리노공업", "leeno", "058470"] },
  { ticker: "000990.KS", name: "DB하이텍", market: "domestic", aliases: ["디비하이텍", "db hitek", "000990"] },
  { ticker: "032500.KQ", name: "케이엠더블유", market: "domestic", aliases: ["kmw", "032500"] },
  { ticker: "218410.KQ", name: "RFHIC", market: "domestic", aliases: ["알에프에이치아이씨", "rfhic", "218410"] },
  { ticker: "050890.KQ", name: "쏠리드", market: "domestic", aliases: ["solid", "050890"] },
  { ticker: "039030.KQ", name: "이오테크닉스", market: "domestic", aliases: ["eo technics", "039030"] },
  { ticker: "AMD", name: "AMD", market: "global", aliases: ["advanced micro devices", "amd"] },
  { ticker: "AVGO", name: "Broadcom", market: "global", aliases: ["broadcom", "avgo"] },
  { ticker: "TSM", name: "TSMC", market: "global", aliases: ["taiwan semiconductor", "tsmc", "tsm"] },
  { ticker: "ASML", name: "ASML", market: "global", aliases: ["asml holding", "asml"] },
  { ticker: "INTC", name: "Intel", market: "global", aliases: ["intel", "intc"] },
];

const newsCoMentionPeerGroups = [
  {
    label: "반도체·AI·HBM 뉴스 동반 언급 그룹",
    tickers: ["NVDA", "AMD", "AVGO", "TSM", "ASML", "INTC"],
  },
  {
    label: "국내 반도체 대형주 뉴스 동반 언급 그룹",
    tickers: ["005930.KS", "000660.KS", "042700.KS", "000990.KS", "039030.KQ"],
  },
  {
    label: "반도체 장비·소재 뉴스 동반 언급 그룹",
    tickers: ["240810.KQ", "042700.KS", "036930.KQ", "058470.KQ", "039030.KQ"],
  },
  {
    label: "광통신·5G 장비 뉴스 동반 언급 그룹",
    tickers: ["010170.KQ", "138080.KQ", "032500.KQ", "218410.KQ", "050890.KQ"],
  },
  {
    label: "인터넷·플랫폼 뉴스 동반 언급 그룹",
    tickers: ["035420.KS", "035720.KS", "GOOGL", "AMZN", "MSFT"],
  },
  {
    label: "배터리·전기차 뉴스 동반 언급 그룹",
    tickers: ["373220.KS", "051910.KS", "247540.KQ", "086520.KQ", "TSLA"],
  },
  {
    label: "자동차·전기차 뉴스 동반 언급 그룹",
    tickers: ["005380.KS", "000270.KS", "TSLA", "AAPL", "NVDA"],
  },
  {
    label: "바이오·헬스케어 뉴스 동반 언급 그룹",
    tickers: ["068270.KS", "207940.KS", "091990.KQ", "AMZN", "GOOGL"],
  },
  {
    label: "엔터·콘텐츠 뉴스 동반 언급 그룹",
    tickers: ["352820.KS", "035900.KQ", "041510.KQ", "035420.KS", "035720.KS"],
  },
  {
    label: "빅테크 뉴스 동반 언급 그룹",
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"],
  },
];

let watchlistSymbols = [];
const liveQuotes = {};
const priceDates = {};
const ohlcvHistory = {};
const marketDataRequests = {};
const stockNews = {};
const newsRequests = {};
let watchlistSortedByScore = false;
let selectedSymbolToAdd = null;
let remoteSymbolResults = [];
let staticSymbolCatalog = [];
let symbolSearchRequestId = 0;
const symbolMetaRequests = new Set();
let authMode = "login";
let currentUserId = null;
let tickerOptionsSignature = "";

const AUTH_USERS_KEY = "bok-invest-users";
const AUTH_SESSION_KEY = "bok-invest-current-user";
const AUTH_REMEMBER_KEY = "bok-invest-remember-user";
const SYMBOL_META_KEY = "bok-invest-symbol-meta";
const ADMIN_USER_ID = "louise";
const ADMIN_DEFAULT_PASSWORD = "mimi0908";
const configuredApiOrigin = normalizeApiOrigin(
  window.BOK_API_ORIGIN || document.querySelector('meta[name="api-origin"]')?.getAttribute("content") || "",
);
const API_ORIGINS = [
  configuredApiOrigin,
  window.location.protocol === "file:" ? "http://127.0.0.1:4173" : "",
].filter((origin, index, origins) => origin !== null && origins.indexOf(origin) === index);
let activeApiOrigin = API_ORIGINS[0] || "";
let apiConnectionState = { ok: null, origin: activeApiOrigin, error: "" };

const sampleDates = buildRecentBusinessDates(13);

const canvas = document.querySelector("#forecastCanvas");
const ctx = canvas.getContext("2d");
const radarCanvas = document.querySelector("#radarCanvas");
const radarCtx = radarCanvas.getContext("2d");
const compareCanvas = document.querySelector("#compareCanvas");
const compareCtx = compareCanvas.getContext("2d");
const technicalCanvas = document.querySelector("#technicalCanvas");
const technicalCtx = technicalCanvas.getContext("2d");
const danteCanvas = document.querySelector("#danteCanvas");
const danteCtx = danteCanvas.getContext("2d");
const smcCanvas = document.querySelector("#smcCanvas");
const smcCtx = smcCanvas.getContext("2d");
const ictCanvas = document.querySelector("#ictCanvas");
const ictCtx = ictCanvas.getContext("2d");
let compareSymbols = [];

const elements = {
  ticker: document.querySelector("#tickerSelect"),
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginId: document.querySelector("#loginId"),
  loginPassword: document.querySelector("#loginPassword"),
  rememberLogin: document.querySelector("#rememberLogin"),
  loginError: document.querySelector("#loginError"),
  authModeCopy: document.querySelector("#authModeCopy"),
  authSubmit: document.querySelector("#authSubmitBtn"),
  authModeToggle: document.querySelector("#authModeToggleBtn"),
  horizon: document.querySelector("#horizonSelect"),
  chartTitle: document.querySelector("#chartTitle"),
  signalPill: document.querySelector("#signalPill"),
  score: document.querySelector("#scoreValue"),
  scoreCopy: document.querySelector("#scoreCopy"),
  dashboardOpinionLabel: document.querySelector("#dashboardOpinionLabel"),
  dashboardOpinionLevel: document.querySelector("#dashboardOpinionLevel"),
  dashboardTargetPrice: document.querySelector("#dashboardTargetPrice"),
  dashboardStopPrice: document.querySelector("#dashboardStopPrice"),
  dashboardWatchPrice: document.querySelector("#dashboardWatchPrice"),
  dashboardOpinionCopy: document.querySelector("#dashboardOpinionCopy"),
  returnMetric: document.querySelector("#returnMetric"),
  riskMetric: document.querySelector("#riskMetric"),
  confidenceMetric: document.querySelector("#confidenceMetric"),
  livePrice: document.querySelector("#livePriceValue"),
  livePriceChange: document.querySelector("#livePriceChange"),
  livePriceSource: document.querySelector("#livePriceSource"),
  livePriceUpdated: document.querySelector("#livePriceUpdated"),
  dataStatusBar: document.querySelector("#dataStatusBar"),
  kospiValue: document.querySelector("#kospiValue"),
  kospiChange: document.querySelector("#kospiChange"),
  kospiSource: document.querySelector("#kospiSource"),
  kosdaqValue: document.querySelector("#kosdaqValue"),
  kosdaqChange: document.querySelector("#kosdaqChange"),
  kosdaqSource: document.querySelector("#kosdaqSource"),
  nasdaqValue: document.querySelector("#nasdaqValue"),
  nasdaqChange: document.querySelector("#nasdaqChange"),
  nasdaqSource: document.querySelector("#nasdaqSource"),
  sp500Value: document.querySelector("#sp500Value"),
  sp500Change: document.querySelector("#sp500Change"),
  sp500Source: document.querySelector("#sp500Source"),
  dowValue: document.querySelector("#dowValue"),
  dowChange: document.querySelector("#dowChange"),
  dowSource: document.querySelector("#dowSource"),
  weatherGrid: document.querySelector("#weatherGrid"),
  issueList: document.querySelector("#issueList"),
  newsList: document.querySelector("#newsList"),
  compareTickerControls: document.querySelector("#compareTickerControls"),
  compareLegend: document.querySelector("#compareLegend"),
  topModelPick: document.querySelector("#topModelPick"),
  topModelCopy: document.querySelector("#topModelCopy"),
  modelAgreement: document.querySelector("#modelAgreementMetric"),
  trendStrength: document.querySelector("#trendStrengthMetric"),
  rsiState: document.querySelector("#rsiStateMetric"),
  modelCards: document.querySelector("#modelCardList"),
  modelRankingBody: document.querySelector("#modelRankingBody"),
  themeToggle: document.querySelector("#themeToggleBtn"),
  aiSignalPill: document.querySelector("#aiSignalPill"),
  aiCurrentPrice: document.querySelector("#aiCurrentPrice"),
  aiPriceChange: document.querySelector("#aiPriceChange"),
  aiVolumeRatio: document.querySelector("#aiVolumeRatio"),
  aiRsiValue: document.querySelector("#aiRsiValue"),
  aiRsiLabel: document.querySelector("#aiRsiLabel"),
  aiSmaDistance: document.querySelector("#aiSmaDistance"),
  aiSmaLabel: document.querySelector("#aiSmaLabel"),
  aiCapGrade: document.querySelector("#aiCapGrade"),
  aiBetaLabel: document.querySelector("#aiBetaLabel"),
  aiPredictionPrice: document.querySelector("#aiPredictionPrice"),
  aiPredictionCopy: document.querySelector("#aiPredictionCopy"),
  aiOpinionLabel: document.querySelector("#aiOpinionLabel"),
  aiOpinionLevel: document.querySelector("#aiOpinionLevel"),
  aiTargetPrice: document.querySelector("#aiTargetPrice"),
  aiStopPrice: document.querySelector("#aiStopPrice"),
  aiWatchPrice: document.querySelector("#aiWatchPrice"),
  aiOpinionCopy: document.querySelector("#aiOpinionCopy"),
  aiConfidence: document.querySelector("#aiConfidence"),
  aiVolatility: document.querySelector("#aiVolatility"),
  aiSharpe: document.querySelector("#aiSharpe"),
  aiInsights: document.querySelector("#aiInsightList"),
  featureImportance: document.querySelector("#featureImportanceList"),
  companyInfo: document.querySelector("#companyInfoList"),
  technicalDataBody: document.querySelector("#technicalDataBody"),
  downloadAiData: document.querySelector("#downloadAiDataBtn"),
  recommendations: document.querySelector("#recommendationList"),
  volatility: document.querySelector("#volatilityLabel"),
  regime: document.querySelector("#regimeLabel"),
  navItems: document.querySelectorAll("[data-view-target]"),
  viewPanels: document.querySelectorAll("[data-view]"),
  mobileMenu: document.querySelector("#mobileMenuBtn"),
  watchlistBody: document.querySelector("#watchlistBody"),
  sortWatchlist: document.querySelector("#sortWatchlistBtn"),
  deleteSelectedWatchlist: document.querySelector("#deleteSelectedWatchlistBtn"),
  selectAllWatchlist: document.querySelector("#selectAllWatchlist"),
  openSymbolModal: document.querySelector("#openSymbolModalBtn"),
  closeSymbolModal: document.querySelector("#closeSymbolModalBtn"),
  confirmSymbol: document.querySelector("#confirmSymbolBtn"),
  symbolModal: document.querySelector("#symbolModal"),
  symbolSearch: document.querySelector("#symbolSearchInput"),
  symbolResults: document.querySelector("#symbolResults"),
  marketRadios: document.querySelectorAll('input[name="market"]'),
  dailyVol: document.querySelector("#dailyVolMetric"),
  drawdown: document.querySelector("#drawdownMetric"),
  valueAtRisk: document.querySelector("#varMetric"),
  riskGrade: document.querySelector("#riskGradeMetric"),
  stressList: document.querySelector("#stressList"),
  var99: document.querySelector("#var99Metric"),
  cvar95: document.querySelector("#cvar95Metric"),
  recovery: document.querySelector("#recoveryMetric"),
  riskSharpe: document.querySelector("#riskSharpeMetric"),
  sortino: document.querySelector("#sortinoMetric"),
  downsideVol: document.querySelector("#downsideVolMetric"),
  stopPrice: document.querySelector("#stopPriceMetric"),
  tradeRisk: document.querySelector("#tradeRiskMetric"),
  positionWeight: document.querySelector("#positionWeightMetric"),
  kellyWeight: document.querySelector("#kellyWeightMetric"),
  safetyMargin: document.querySelector("#safetyMarginMetric"),
  valuationRiskCopy: document.querySelector("#valuationRiskCopy"),
  riskOpinionScore: document.querySelector("#riskOpinionScore"),
  riskOpinionLabel: document.querySelector("#riskOpinionLabel"),
  riskOpinionCopy: document.querySelector("#riskOpinionCopy"),
  riskOpinionReasons: document.querySelector("#riskOpinionReasons"),
  danteSignalPill: document.querySelector("#danteSignalPill"),
  danteScore: document.querySelector("#danteScoreValue"),
  dantePatternName: document.querySelector("#dantePatternName"),
  dantePatternCopy: document.querySelector("#dantePatternCopy"),
  danteChecklist: document.querySelector("#danteChecklist"),
  danteWatchPrice: document.querySelector("#danteWatchPrice"),
  danteRiskLine: document.querySelector("#danteRiskLine"),
  danteVolumePower: document.querySelector("#danteVolumePower"),
  danteLongLineState: document.querySelector("#danteLongLineState"),
  dantePullbackState: document.querySelector("#dantePullbackState"),
  danteBuyLine: document.querySelector("#danteBuyLineMetric"),
  danteRankingBody: document.querySelector("#danteRankingBody"),
  danteVideoRules: document.querySelector("#danteVideoRuleList"),
  dantePlaybook: document.querySelector("#dantePlaybookList"),
  smcSignalPill: document.querySelector("#smcSignalPill"),
  smcScore: document.querySelector("#smcScoreValue"),
  smcSetupName: document.querySelector("#smcSetupName"),
  smcSetupCopy: document.querySelector("#smcSetupCopy"),
  smcStructure: document.querySelector("#smcStructureMetric"),
  smcSweep: document.querySelector("#smcSweepMetric"),
  smcFvg: document.querySelector("#smcFvgMetric"),
  smcOrderBlock: document.querySelector("#smcOrderBlockMetric"),
  smcChecklist: document.querySelector("#smcChecklist"),
  smcInterpretation: document.querySelector("#smcInterpretation"),
  smartTabs: document.querySelectorAll("[data-smart-tab]"),
  smartPanels: document.querySelectorAll("[data-smart-panel]"),
  ictSignalPill: document.querySelector("#ictSignalPill"),
  ictScore: document.querySelector("#ictScoreValue"),
  ictSetupName: document.querySelector("#ictSetupName"),
  ictSetupCopy: document.querySelector("#ictSetupCopy"),
  ictDelivery: document.querySelector("#ictDeliveryMetric"),
  ictOte: document.querySelector("#ictOteMetric"),
  ictLiquidity: document.querySelector("#ictLiquidityMetric"),
  ictEntry: document.querySelector("#ictEntryMetric"),
  ictChecklist: document.querySelector("#ictChecklist"),
  ictInterpretation: document.querySelector("#ictInterpretation"),
  adminUserBody: document.querySelector("#adminUserBody"),
};

function getThemeColor(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function getWebStorage(name) {
  try {
    return window[name];
  } catch {
    return null;
  }
}

const localStore = getWebStorage("localStorage");
const sessionStore = getWebStorage("sessionStorage");

function safeStorageGet(storage, key) {
  try {
    return storage?.getItem(key) || "";
  } catch {
    return "";
  }
}

function safeStorageSet(storage, key, value) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Some published/embedded browser contexts block Web Storage; keep the UI usable.
  }
}

function safeStorageRemove(storage, key) {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignore storage cleanup failures in restricted browser contexts.
  }
}

function getStoredUsers() {
  try {
    return JSON.parse(safeStorageGet(localStore, AUTH_USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStoredUsers(users) {
  safeStorageSet(localStore, AUTH_USERS_KEY, JSON.stringify(users));
}

function getStoredSymbolMeta() {
  try {
    return JSON.parse(safeStorageGet(localStore, SYMBOL_META_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStoredSymbolMeta(meta) {
  safeStorageSet(localStore, SYMBOL_META_KEY, JSON.stringify(meta));
}

function registerKnownSymbol(symbol) {
  if (!symbol?.ticker || !symbol?.name) return;
  const meta = getStoredSymbolMeta();
  meta[symbol.ticker] = {
    ticker: symbol.ticker,
    name: symbol.name,
    market: symbol.market || (isKoreanTicker(symbol.ticker) ? "domestic" : "global"),
    aliases: symbol.aliases || [],
  };
  saveStoredSymbolMeta(meta);
  tickerMeta[symbol.ticker] = symbol.name;
}

function getSymbolSearchCode(ticker) {
  return String(ticker || "").replace(/\.(KS|KQ)$/i, "");
}

function needsSymbolNameHydration(ticker) {
  if (!ticker) return false;
  const knownSymbol = getKnownSymbol(ticker);
  const currentName = tickerMeta[ticker] || knownSymbol?.name;
  return !currentName || currentName === ticker || currentName === getSymbolSearchCode(ticker);
}

async function hydrateSymbolName(ticker) {
  if (!needsSymbolNameHydration(ticker) || symbolMetaRequests.has(ticker)) return;
  symbolMetaRequests.add(ticker);
  try {
    const market = isKoreanTicker(ticker) ? "domestic" : "global";
    const response = await fetchApi(`/api/symbol-search?q=${encodeURIComponent(getSymbolSearchCode(ticker))}&market=${market}`, {
      cache: "no-store",
    });
    if (!response.ok) return;
    const payload = await response.json();
    const match = (payload.results || []).find((symbol) => symbol.ticker === ticker) || payload.results?.[0];
    if (match?.ticker === ticker && match.name) {
      registerKnownSymbol(match);
      render();
    }
  } catch {
    // Keep the non-code display fallback until the next refresh.
  } finally {
    symbolMetaRequests.delete(ticker);
  }
}

function hydratePortfolioSymbolNames() {
  [...new Set([...watchlistSymbols, ...compareSymbols, elements.ticker.value].filter(Boolean))].forEach(hydrateSymbolName);
}

function ensureAdminUser() {
  const users = getStoredUsers();
  if (!users[ADMIN_USER_ID]) {
    users[ADMIN_USER_ID] = {
      password: ADMIN_DEFAULT_PASSWORD,
      role: "admin",
      watchlist: [],
      compareSymbols: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    users[ADMIN_USER_ID] = { ...users[ADMIN_USER_ID], role: "admin", blocked: false };
  }
  saveStoredUsers(users);
}

function normalizeUserId(value) {
  return value.trim().toLowerCase();
}

function loadUserPortfolio(userId) {
  const users = getStoredUsers();
  const user = users[userId];
  watchlistSymbols = Array.isArray(user?.watchlist) ? [...user.watchlist] : [];
  compareSymbols = Array.isArray(user?.compareSymbols) ? user.compareSymbols.filter((ticker) => watchlistSymbols.includes(ticker)).slice(0, 5) : [];
  watchlistSortedByScore = false;
  hydratePortfolioSymbolNames();
}

function saveUserPortfolio() {
  if (!currentUserId) return;
  const users = getStoredUsers();
  if (!users[currentUserId]) return;
  users[currentUserId] = {
    ...users[currentUserId],
    watchlist: [...watchlistSymbols],
    compareSymbols: compareSymbols.filter((ticker) => watchlistSymbols.includes(ticker)).slice(0, 5),
    updatedAt: new Date().toISOString(),
  };
  saveStoredUsers(users);
}

function isAdminUser(userId = currentUserId) {
  return userId === ADMIN_USER_ID;
}

function setAuthMode(nextMode) {
  authMode = nextMode;
  elements.loginError.textContent = "";
  elements.authSubmit.textContent = authMode === "login" ? "로그인" : "가입 후 시작";
  elements.authModeToggle.textContent = authMode === "login" ? "새 계정 만들기" : "로그인으로 돌아가기";
  elements.authModeCopy.textContent =
    authMode === "login" ? "아이디와 패스워드로 로그인하세요." : "본인이 사용할 아이디와 패스워드만 정하면 됩니다.";
}

function saveAuthPreference(userId) {
  safeStorageSet(sessionStore, AUTH_SESSION_KEY, userId);
  if (elements.rememberLogin.checked) {
    safeStorageSet(localStore, AUTH_REMEMBER_KEY, userId);
    return;
  }
  safeStorageRemove(localStore, AUTH_REMEMBER_KEY);
}

function clearAuthPreference() {
  safeStorageRemove(sessionStore, AUTH_SESSION_KEY);
  safeStorageRemove(localStore, AUTH_REMEMBER_KEY);
}

function unlockDashboard(userId) {
  currentUserId = userId;
  loadUserPortfolio(userId);
  document.body.classList.add("is-authenticated");
  document.body.classList.toggle("is-admin", isAdminUser(userId));
  safeStorageSet(sessionStore, AUTH_SESSION_KEY, userId);
  requestAnimationFrame(render);
  requestAnimationFrame(() => {
    if (!elements.ticker.value) return;
    fetchSymbolMarketData(elements.ticker.value);
    watchlistSymbols.slice(0, 6).forEach((ticker) => {
      if (ticker !== elements.ticker.value) fetchSymbolMarketData(ticker, { renderAfter: false });
    });
  });
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getKoreaDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(value)
    .reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 12));
}

function formatIsoDate(value) {
  return value.toISOString().slice(0, 10);
}

function buildRecentBusinessDates(count) {
  const dates = [];
  const cursor = getKoreaDate();
  while (dates.length < count) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) dates.unshift(formatIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return dates;
}

function getReturns(prices) {
  return prices.slice(1).map((price, index) => (price - prices[index]) / prices[index]);
}

function standardDeviation(values) {
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function forecast(prices, options = {}) {
  const horizon = options.horizon ?? Number(elements.horizon.value);
  const returns = getReturns(prices);
  const recent = returns.slice(-5);
  const momentum = average(recent);
  const longMean = average(returns);
  const volatility = standardDeviation(returns);
  const lastPrice = prices.at(-1);
  const dailyDrift = momentum * 0.55 + longMean * 0.45;

  const projected = [];
  let next = lastPrice;
  for (let index = 1; index <= horizon; index += 1) {
    const damping = 1 - index / (horizon * 3.8);
    next *= 1 + dailyDrift * damping;
    projected.push(next);
  }

  const expectedReturn = (projected.at(-1) - lastPrice) / lastPrice;
  const risk = volatility * Math.sqrt(Math.min(horizon, 30)) * 0.72;
  const confidence = Math.max(42, Math.min(88, 78 - volatility * 1200 + Math.abs(expectedReturn) * 140));
  const score = Math.max(5, Math.min(95, 50 + expectedReturn * 520 + confidence / 8 - risk * 180));

  return {
    projected,
    expectedReturn,
    risk,
    confidence,
    score: Math.round(score),
    volatility,
  };
}

function formatPercent(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

function formatPrice(value, ticker = elements.ticker.value) {
  if (isKoreanTicker(ticker)) return `${Math.round(value).toLocaleString("ko-KR")}원`;
  return `$${value.toFixed(2)}`;
}

function formatTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatChartDate(value) {
  const parts = String(value).split("-");
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return String(value);
}

function getLiveQuote(ticker) {
  return liveQuotes[ticker] || null;
}

function getCurrentPrice(ticker) {
  ensureSymbolData(ticker);
  return getLiveQuote(ticker)?.price || samples[ticker].at(-1);
}

function getQuoteChange(ticker) {
  ensureSymbolData(ticker);
  const quote = getLiveQuote(ticker);
  if (quote?.changePercent !== null && quote?.changePercent !== undefined) return quote.changePercent;
  const prices = samples[ticker];
  return (getCurrentPrice(ticker) - prices.at(-2)) / prices.at(-2);
}

function isMarketClosedQuote(quote) {
  if (!quote?.fetchedAt) return false;
  const fetchedAt = new Date(quote.fetchedAt).getTime();
  return Number.isFinite(fetchedAt) && Date.now() - fetchedAt > 20 * 60 * 1000;
}

function getQuoteDisplaySource(quote) {
  if (!quote) return "종가";
  const source = quote.source || "";
  if (source.includes("종가") || source.includes("일봉") || isMarketClosedQuote(quote)) return "종가";
  return "현재가";
}

function getDateKey(value) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (!Number.isFinite(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getMarketClock(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  return { weekday, minutes: hour * 60 + minute };
}

function isKoreaMarketOpenNow() {
  const { weekday, minutes } = getMarketClock("Asia/Seoul");
  if (weekday === "Sat" || weekday === "Sun") return false;
  return minutes >= 9 * 60 && minutes < 15 * 60 + 30;
}

function isUsMarketOpenNow() {
  const { weekday, minutes } = getMarketClock("America/New_York");
  if (weekday === "Sat" || weekday === "Sun") return false;
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

function getIndexDisplaySource(index, key) {
  const source = index?.source || "";
  if (source.includes("종가") || source.includes("일봉")) return "종가";
  if ((key === "KOSPI" || key === "KOSDAQ") && !isKoreaMarketOpenNow()) return "종가";
  if (key === "NASDAQ" || key === "SP500" || key === "DOW") {
    return isUsMarketOpenNow() && index?.tradedAt && String(index.tradedAt).includes(":") ? "현재가" : "종가";
  }
  if (index?.tradedAt && getDateKey(index.tradedAt) !== getDateKey(new Date())) return "종가";
  return "현재가";
}

function formatIndexTime(index, displaySource) {
  const rawValue = index?.tradedAt || index?.fetchedAt;
  if (!rawValue) return "";
  const normalized = String(rawValue).includes(" ") ? String(rawValue).replace(" ", "T") : String(rawValue);
  const date = new Date(normalized);
  if (Number.isFinite(date.getTime())) {
    if (displaySource === "종가") {
      return new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  const text = String(rawValue);
  if (displaySource === "종가") return text.slice(5, 10).replace("-", "/") || text;
  return text.slice(11, 16) || text.slice(0, 10);
}

function applyLiveQuote(ticker, payload) {
  if (!ticker || !Number.isFinite(payload?.price)) return;
  liveQuotes[ticker] = {
    ...payload,
    fetchedAt: payload.fetchedAt || new Date().toISOString(),
  };
  if (!samples[ticker]?.length) return;
  const previousLast = samples[ticker].at(-1);
  if (!previousLast || Math.abs(payload.price - previousLast) / previousLast >= 0.4) return;
  samples[ticker] = [...samples[ticker].slice(0, -1), payload.price];
  const lastOhlcv = ohlcvHistory[ticker]?.at(-1);
  if (lastOhlcv) {
    lastOhlcv.close = payload.price;
    lastOhlcv.high = Math.max(lastOhlcv.high, payload.price);
    lastOhlcv.low = Math.min(lastOhlcv.low, payload.price);
  }
}

function getAnalysisPrices(ticker) {
  ensureSymbolData(ticker);
  const prices = samples[ticker];
  const quote = getLiveQuote(ticker);
  if (!quote?.price) return [...prices];
  const scale = quote.price / prices.at(-1);
  return prices.map((price) => price * scale);
}

function getAnalysisRows(ticker) {
  ensureSymbolData(ticker);
  const prices = getAnalysisPrices(ticker);
  const rows = ohlcvHistory[ticker];
  if (rows?.length >= 8) {
    const scale = prices.at(-1) / rows.at(-1).close;
    return rows.map((row, index) => ({
      date: row.date || priceDates[ticker]?.[index] || sampleDates[index % sampleDates.length],
      open: row.open * scale,
      high: row.high * scale,
      low: row.low * scale,
      close: row.close * scale,
      volume: row.volume || 0,
    }));
  }
  return prices.map((close, index) => {
    const previous = prices[index - 1] || close;
    const spread = Math.max(Math.abs(close - previous), close * 0.008);
    return {
      date: priceDates[ticker]?.[index] || sampleDates[index % sampleDates.length],
      open: previous,
      high: Math.max(close, previous) + spread * 0.45,
      low: Math.min(close, previous) - spread * 0.45,
      close,
      volume: 100000 + index * 4200,
    };
  });
}

function getSignal(score) {
  if (score >= 68) return { label: "매수 우위", tone: "" };
  if (score <= 42) return { label: "방어 우위", tone: "defensive" };
  return { label: "중립", tone: "neutral" };
}

function getInvestmentOpinion(score) {
  if (score >= 82) return { label: "강력매수", level: 5, tone: "strong-buy" };
  if (score >= 65) return { label: "매수", level: 4, tone: "buy" };
  if (score >= 45) return { label: "중립", level: 3, tone: "neutral" };
  if (score >= 30) return { label: "매도", level: 2, tone: "sell" };
  return { label: "강력매도", level: 1, tone: "strong-sell" };
}

function buildOpinionFromForecast({ currentPrice, targetPrice, expectedReturn, risk, confidence }) {
  const riskPenalty = Math.max(0, risk || 0) * 180;
  const confidenceBonus = Math.max(0, confidence || 0) / 10;
  const rawScore = 50 + expectedReturn * 520 + confidenceBonus - riskPenalty;
  const score = clamp(rawScore, 5, 95);
  const opinion = getInvestmentOpinion(score);
  const stopDistance = clamp(Math.max(Math.abs(risk || 0) * 0.9, 0.015), 0.012, 0.12);
  const watchReturn = expectedReturn >= 0 ? expectedReturn * 0.35 : expectedReturn * 0.55;
  return {
    ...opinion,
    score,
    targetPrice,
    stopPrice: currentPrice * (1 - stopDistance),
    watchPrice: currentPrice * (1 + watchReturn),
  };
}

function updateOpinionCard(prefix, opinion, ticker, copy) {
  const label = elements[`${prefix}OpinionLabel`];
  const level = elements[`${prefix}OpinionLevel`];
  const target = elements[`${prefix}TargetPrice`];
  const stop = elements[`${prefix}StopPrice`];
  const watch = elements[`${prefix}WatchPrice`];
  const copyElement = elements[`${prefix}OpinionCopy`];
  if (!label || !level || !target || !stop || !watch || !copyElement) return;
  label.textContent = opinion.label;
  label.className = opinion.tone;
  level.dataset.level = String(opinion.level);
  target.textContent = formatPrice(opinion.targetPrice, ticker);
  stop.textContent = formatPrice(opinion.stopPrice, ticker);
  watch.textContent = formatPrice(opinion.watchPrice, ticker);
  copyElement.textContent = copy;
}

function isKoreanTicker(ticker) {
  return ticker.endsWith(".KS") || ticker.endsWith(".KQ");
}

function normalizeApiOrigin(origin) {
  const value = String(origin || "").trim();
  if (!value) return "";
  return value.replace(/\/+$/, "");
}

function apiUrl(path, origin = activeApiOrigin) {
  return `${origin}${path}`;
}

function getApiOriginLabel() {
  if (activeApiOrigin) return activeApiOrigin;
  if (window.location.protocol === "file:") return "로컬 API";
  return "같은 도메인 API";
}

function getDataStatusLabel(ticker = elements.ticker.value) {
  if (ticker && getLiveQuote(ticker)) return `실시간/종가 API 반영 · ${getApiOriginLabel()}`;
  if (ticker && ohlcvHistory[ticker]?.length) return `히스토리 API 반영 · ${getApiOriginLabel()}`;
  if (apiConnectionState.ok === false) return `API 연결 실패 · 로컬 기준 계산 중`;
  return `API 대기 · 로컬 기준 계산 중`;
}

function updateDataStatusBar(ticker = elements.ticker.value) {
  if (!elements.dataStatusBar) return;
  const hasApiData = Boolean(ticker && (getLiveQuote(ticker) || ohlcvHistory[ticker]?.length));
  const message = ticker
    ? `${getTickerName(ticker)} 데이터 상태: ${getDataStatusLabel(ticker)}`
    : apiConnectionState.ok === false
      ? `데이터 상태: API 연결 실패 · 종목 등록과 가격 갱신은 로컬 fallback으로 제한됩니다.`
      : "데이터 상태: 종목 등록 후 API 연결 상태를 확인합니다.";
  elements.dataStatusBar.textContent = message;
  elements.dataStatusBar.classList.toggle("warning", apiConnectionState.ok === false && !hasApiData);
  elements.dataStatusBar.classList.toggle("live", hasApiData);
}

async function fetchApi(path, options = {}) {
  const preferredOrigins = [activeApiOrigin, ...API_ORIGINS].filter((origin, index, origins) => origins.indexOf(origin) === index);
  let lastError = null;
  for (const origin of preferredOrigins) {
    const fetchOptions = { ...options };
    let timeoutId = null;
    if (!fetchOptions.signal && typeof AbortController !== "undefined") {
      const controller = new AbortController();
      fetchOptions.signal = controller.signal;
      timeoutId = window.setTimeout(() => controller.abort(), 7000);
    }
    try {
      const response = await fetch(apiUrl(path, origin), fetchOptions);
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && !contentType.includes("application/json")) {
        throw new Error(`API JSON이 아닌 응답: ${contentType || "unknown"}`);
      }
      activeApiOrigin = origin;
      apiConnectionState = { ok: response.ok, origin, error: response.ok ? "" : `HTTP ${response.status}` };
      return response;
    } catch (error) {
      lastError = error;
      apiConnectionState = { ok: false, origin, error: error.message || "API 연결 실패" };
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  }
  throw lastError || new Error("API 연결 실패");
}

function getTickerName(ticker) {
  const knownSymbol = getKnownSymbol(ticker);
  if (tickerMeta[ticker] && tickerMeta[ticker] !== ticker) return tickerMeta[ticker];
  if (knownSymbol?.name && knownSymbol.name !== ticker) return knownSymbol.name;
  if (isKoreanTicker(ticker)) return "종목명 확인 중";
  return String(ticker || "").replace(/\.(KS|KQ)$/i, "");
}

function createSeededSeries(ticker, basePrice) {
  let seed = [...ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const values = [];
  let price = basePrice;
  for (let index = 0; index < 13; index += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const noise = (seed / 233280 - 0.5) * 0.035;
    const drift = (index - 6) * 0.0012;
    price *= 1 + noise + drift;
    values.push(Math.max(100, Math.round(price / 10) * 10));
  }
  return values;
}

function normalizePriceSeries(prices, dates = []) {
  const rows = prices
    .map((price, index) => ({ price: Number(price), date: dates[index] }))
    .filter((row) => Number.isFinite(row.price) && row.price > 0);
  return {
    prices: rows.map((row) => row.price).slice(-60),
    dates: rows.map((row) => row.date).slice(-60),
  };
}

function normalizeOhlcvSeries(rows = []) {
  return rows
    .map((row) => ({
      date: row.date,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume),
    }))
    .filter((row) => [row.open, row.high, row.low, row.close].every(Number.isFinite))
    .slice(-60);
}

function getDefaultBasePrice(ticker) {
  if (ticker.endsWith(".KQ")) return 18000;
  if (ticker.endsWith(".KS")) return 76000;
  return 150;
}

function ensureSymbolData(ticker) {
  const catalogItem = getKnownSymbol(ticker);
  if (!tickerMeta[ticker] || tickerMeta[ticker] === ticker) tickerMeta[ticker] = catalogItem?.name || ticker;
  if (!samples[ticker]) samples[ticker] = createSeededSeries(ticker, getDefaultBasePrice(ticker));
  if (!fundamentals[ticker]) {
    const seed = [...ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    fundamentals[ticker] = {
      dividend: seed % 55,
      liquidity: 82 + (seed % 54),
      stability: 76 + (seed % 48),
      profitability: 24 + (seed % 42),
      growth: 22 + (seed % 58),
      per: 1.2 + (seed % 24) / 10,
      pbr: 0.7 + (seed % 18) / 10,
      roe: 0.8 + (seed % 22) / 10,
      eps: 0.8 + (seed % 20) / 10,
      bps: 1 + (seed % 14) / 10,
      foreignFlow: (seed % 2 === 0 ? 1 : -1) * (90000 + seed * 180),
      institutionFlow: (seed % 3 === 0 ? 1 : -1) * (65000 + seed * 120),
    };
  }
  if (!companyProfiles[ticker]) {
    companyProfiles[ticker] = {
      sector: isKoreanTicker(ticker) ? "Korea Equity" : "Technology",
      industry: isKoreanTicker(ticker) ? "Listed Company" : "Equity",
      country: isKoreanTicker(ticker) ? "Korea" : "United States",
      employees: 1000 + ([...ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 9000),
      cap: ticker.endsWith(".KQ") ? "Mid" : "Large",
      beta: 0.8 + ([...ticker].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 90) / 100,
    };
  }
}

function selectTicker(ticker) {
  ensureSymbolData(ticker);
  elements.ticker.value = ticker;
  render();
  fetchSymbolMarketData(ticker);
}

function updateLivePricePanel(ticker) {
  const quote = getLiveQuote(ticker);
  const change = getQuoteChange(ticker);
  elements.livePrice.textContent = formatPrice(getCurrentPrice(ticker), ticker);
  elements.livePriceChange.textContent = quote ? formatPercent(change) : "종가 기준";
  elements.livePriceChange.className = change >= 0 ? "positive" : "negative";
  elements.livePriceSource.textContent = getQuoteDisplaySource(quote);
  elements.livePriceSource.title = quote?.source || "종가 기준";
  elements.livePriceUpdated.textContent = quote
    ? `갱신 ${formatTime(quote.fetchedAt)} · ${getApiOriginLabel()}`
    : apiConnectionState.ok === false
      ? `API 연결 실패 · 로컬 기준`
      : "API 대기 · 로컬 기준";
}

function renderTickerOptions(preferredTicker = elements.ticker.value) {
  watchlistSymbols.forEach(ensureSymbolData);
  hydratePortfolioSymbolNames();
  const symbols = watchlistSymbols;
  const nextTicker = symbols.includes(preferredTicker) ? preferredTicker : symbols[0];
  const nextOptionsSignature = symbols.map((ticker) => `${ticker}:${getTickerName(ticker)}`).join("|");
  if (tickerOptionsSignature !== nextOptionsSignature) {
    elements.ticker.innerHTML = symbols
      .map((ticker) => `<option value="${ticker}">${getTickerName(ticker)}</option>`)
      .join("");
    tickerOptionsSignature = nextOptionsSignature;
  }
  elements.ticker.disabled = symbols.length === 0;
  if (elements.ticker.value !== (nextTicker || "")) elements.ticker.value = nextTicker || "";
  document.body.classList.toggle("no-symbols", symbols.length === 0);
}

async function fetchCurrentQuote(ticker = elements.ticker.value) {
  try {
    const response = await fetchApi(`/api/quote?symbol=${encodeURIComponent(ticker)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!Number.isFinite(payload.price)) throw new Error("Invalid quote");
    applyLiveQuote(ticker, payload);
  } catch {
    if (!liveQuotes[ticker]) delete liveQuotes[ticker];
  } finally {
    render();
  }
}

async function fetchPriceHistory(ticker) {
  const response = await fetchApi(`/api/history?symbol=${encodeURIComponent(ticker)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  const series = normalizePriceSeries(payload.prices || [], payload.dates || []);
  if (series.prices.length < 5) throw new Error("Invalid history");
  const ohlcv = normalizeOhlcvSeries(payload.ohlcv || []);
  samples[ticker] = series.prices;
  priceDates[ticker] = series.dates;
  if (ohlcv.length === series.prices.length) ohlcvHistory[ticker] = ohlcv;
  const existingQuote = liveQuotes[ticker];
  const shouldUseHistoryQuote = !existingQuote || existingQuote.source?.includes("종가") || existingQuote.source?.includes("일봉");
  if (shouldUseHistoryQuote && Number.isFinite(series.prices.at(-1))) {
    liveQuotes[ticker] = {
      symbol: ticker,
      price: series.prices.at(-1),
      change: series.prices.length > 1 ? series.prices.at(-1) - series.prices.at(-2) : null,
      changePercent: series.prices.length > 1 ? (series.prices.at(-1) - series.prices.at(-2)) / series.prices.at(-2) : null,
      quote: ticker,
      source: payload.source || "실시간 지연",
      fetchedAt: payload.fetchedAt || new Date().toISOString(),
    };
  }
}

async function fetchSymbolMarketData(ticker = elements.ticker.value, options = {}) {
  if (!ticker) return;
  ensureSymbolData(ticker);
  const renderAfter = options.renderAfter ?? true;
  const loadHistory = options.history ?? true;
  if (marketDataRequests[ticker]) return marketDataRequests[ticker];
  marketDataRequests[ticker] = (async () => {
    let historyLoaded = false;
    let quoteLoaded = false;
    const historyTask = loadHistory
      ? (async () => {
          try {
            await fetchPriceHistory(ticker);
            historyLoaded = true;
          } catch {
            // Keep the local seed series, then still try the latest quote below.
          }
        })()
      : Promise.resolve();
    const quoteTask = (async () => {
      try {
        const response = await fetchApi(`/api/quote?symbol=${encodeURIComponent(ticker)}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        if (!Number.isFinite(payload.price)) throw new Error("Invalid quote");
        applyLiveQuote(ticker, payload);
        quoteLoaded = true;
        if (renderAfter) render();
      } catch {
        if (!historyLoaded && !liveQuotes[ticker]) delete liveQuotes[ticker];
      }
    })();
    try {
      await quoteTask;
      if (loadHistory) {
        await historyTask;
        if (renderAfter && historyLoaded && !quoteLoaded) render();
        else if (renderAfter && historyLoaded) render();
      }
    } finally {
      delete marketDataRequests[ticker];
      if (renderAfter) render();
    }
  })();
  return marketDataRequests[ticker];
}

function getTrackedMarketSymbols() {
  return [...new Set([elements.ticker.value, ...watchlistSymbols, ...compareSymbols].filter(Boolean))];
}

async function refreshTrackedMarketData(options = {}) {
  const tickers = getTrackedMarketSymbols();
  if (!tickers.length) return;
  const includeMissingHistory = options.includeMissingHistory ?? false;
  await Promise.allSettled(
    tickers.map((ticker) =>
      fetchSymbolMarketData(ticker, {
        renderAfter: false,
        history: includeMissingHistory && !ohlcvHistory[ticker],
      }),
    ),
  );
  render();
}

function drawChart(prices, projected, volatility, ticker = elements.ticker.value) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 26, right: 82, bottom: 42, left: 76 };
  const allValues = [...prices, ...projected];
  const last = prices.at(-1);
  const band = projected.map((value, index) => value * volatility * Math.sqrt(index + 1) * 1.35);
  const lineMin = Math.min(...allValues);
  const lineMax = Math.max(...allValues);
  const domainPadding = Math.max((lineMax - lineMin) * 0.12, last * 0.01);
  const min = lineMin - domainPadding;
  const max = lineMax + domainPadding;
  const span = max - min || 1;
  const xStep = (width - padding.left - padding.right) / (allValues.length - 1);
  const boundedY = (value) => clamp(value, min, max);
  const y = (value) => height - padding.bottom - ((boundedY(value) - min) / span) * (height - padding.top - padding.bottom);
  const x = (index) => padding.left + index * xStep;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = getThemeColor("--line");
  ctx.lineWidth = 1;
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillStyle = getThemeColor("--muted");
  ctx.textAlign = "right";

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = min + (span / 4) * tick;
    const yPos = y(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, yPos);
    ctx.lineTo(width - padding.right, yPos);
    ctx.stroke();
    ctx.fillText(formatPrice(value, ticker), padding.left - 8, yPos + 4);
  }
  ctx.textAlign = "left";

  const currentY = y(last);
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = getThemeColor("--muted");
  ctx.beginPath();
  ctx.moveTo(padding.left, currentY);
  ctx.lineTo(width - padding.right, currentY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = getThemeColor("--ink");
  ctx.textAlign = "left";
  ctx.fillText(formatPrice(last, ticker), width - padding.right + 8, currentY + 4);

  const splitX = x(prices.length - 1);
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = getThemeColor("--muted");
  ctx.beginPath();
  ctx.moveTo(splitX, padding.top);
  ctx.lineTo(splitX, height - padding.bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  projected.forEach((value, index) => {
    const pointX = x(prices.length + index);
    const pointY = y(value + band[index]);
    if (index === 0) ctx.moveTo(x(prices.length - 1), y(last));
    ctx.lineTo(pointX, pointY);
  });
  [...projected].reverse().forEach((value, reverseIndex) => {
    const index = projected.length - reverseIndex - 1;
    ctx.lineTo(x(prices.length + index), y(value - band[index]));
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 194, 71, 0.22)";
  ctx.fill();

  drawLine(prices, 0, getThemeColor("--ink"), 3);
  drawLine([last, ...projected], prices.length - 1, getThemeColor("--accent"), 3);

  ctx.fillStyle = getThemeColor("--ink");
  ctx.beginPath();
  ctx.arc(x(prices.length - 1), y(last), 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText(formatPrice(last, ticker), x(prices.length - 1) + 8, y(last) - 8);

  const forecastPrice = projected.at(-1);
  ctx.fillStyle = getThemeColor("--accent");
  ctx.beginPath();
  ctx.arc(x(allValues.length - 1), y(forecastPrice), 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText(formatPrice(forecastPrice, ticker), x(allValues.length - 1) + 8, y(forecastPrice) - 8);

  ctx.fillStyle = getThemeColor("--muted");
  ctx.textAlign = "center";
  ctx.fillText("현재", x(prices.length - 1), height - 10);
  ctx.fillText(`+${projected.length}일`, x(allValues.length - 1), height - 10);
  ctx.textAlign = "left";

  function drawLine(values, startIndex, color, lineWidth) {
    ctx.beginPath();
    values.forEach((value, index) => {
      const pointX = x(startIndex + index);
      const pointY = y(value);
      if (index === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

async function fetchMarketIndices() {
  try {
    const response = await fetchApi("/api/google-indices", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    Object.entries(payload.indices || {}).forEach(([key, index]) => {
      if (!marketIndices[key]) return;
      if (!Number.isFinite(index.value) || !Number.isFinite(index.change)) return;
      marketIndices[key] = {
        ...marketIndices[key],
        value: index.value,
        change: index.change,
        source: index.source || "Google Finance 지연",
        tradedAt: index.tradedAt,
        fetchedAt: index.fetchedAt || new Date().toISOString(),
      };
    });
    marketIndicesLoaded = Object.values(marketIndices).some((index) => index.fetchedAt || !String(index.source || "").includes("종가"));
  } catch (error) {
    marketIndicesLoaded = false;
  } finally {
    updateMarketStrip();
    render();
  }
}

function updateMarketStrip() {
  const map = [
    ["kospi", "KOSPI"],
    ["kosdaq", "KOSDAQ"],
    ["nasdaq", "NASDAQ"],
    ["sp500", "SP500"],
    ["dow", "DOW"],
  ];

  map.forEach(([prefix, key]) => {
    const index = marketIndices[key];
    const change = index.change;
    elements[`${prefix}Value`].textContent = index.value.toLocaleString("ko-KR", {
      maximumFractionDigits: 1,
    });
    elements[`${prefix}Change`].textContent = formatPercent(change);
    const displaySource = getIndexDisplaySource(index, key);
    const displayTime = formatIndexTime(index, displaySource);
    elements[`${prefix}Change`].title = index.source || displaySource;
    const sourceLabel =
      apiConnectionState.ok === false && !marketIndicesLoaded && !index.fetchedAt
        ? "API 연결 필요"
        : displayTime
          ? `${displaySource} ${displayTime}`
          : displaySource;
    elements[`${prefix}Source`].textContent = sourceLabel;
    elements[`${prefix}Change`].classList.toggle("negative", change < 0);
  });
}

function drawRadar(ticker) {
  const ratio = window.devicePixelRatio || 1;
  const rect = radarCanvas.getBoundingClientRect();
  radarCanvas.width = Math.floor(rect.width * ratio);
  radarCanvas.height = Math.floor(rect.height * ratio);
  radarCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2 + 8;
  const radius = Math.min(width, height) * 0.34;
  const labels = ["배당", "유동성", "건전성", "수익성", "성장성"];
  const peerAverage = [42, 112, 96, 38, 48];
  const data = fundamentals[ticker];
  const values = [data.dividend, data.liquidity, data.stability, data.profitability, data.growth].map((value, index) =>
    Math.max(18, Math.min(145, (value / peerAverage[index]) * 100)),
  );

  radarCtx.clearRect(0, 0, width, height);
  radarCtx.font = "12px Inter, system-ui, sans-serif";

  for (let ring = 1; ring <= 4; ring += 1) {
    radarCtx.beginPath();
    labels.forEach((_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / labels.length;
      const pointRadius = (radius * ring) / 4;
      const x = centerX + Math.cos(angle) * pointRadius;
      const y = centerY + Math.sin(angle) * pointRadius;
      if (index === 0) radarCtx.moveTo(x, y);
      else radarCtx.lineTo(x, y);
    });
    radarCtx.closePath();
    radarCtx.strokeStyle = getThemeColor("--line");
    radarCtx.lineWidth = 1;
    radarCtx.stroke();
  }

  labels.forEach((label, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / labels.length;
    radarCtx.beginPath();
    radarCtx.moveTo(centerX, centerY);
    radarCtx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    radarCtx.strokeStyle = getThemeColor("--line");
    radarCtx.stroke();
    radarCtx.fillStyle = getThemeColor("--muted");
    radarCtx.textAlign = Math.cos(angle) > 0.25 ? "left" : Math.cos(angle) < -0.25 ? "right" : "center";
    radarCtx.fillText(label, centerX + Math.cos(angle) * (radius + 22), centerY + Math.sin(angle) * (radius + 22));
  });

  radarCtx.beginPath();
  values.forEach((value, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / labels.length;
    const pointRadius = radius * (value / 145);
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;
    if (index === 0) radarCtx.moveTo(x, y);
    else radarCtx.lineTo(x, y);
  });
  radarCtx.closePath();
  radarCtx.fillStyle = "rgba(67, 124, 247, 0.2)";
  radarCtx.strokeStyle = getThemeColor("--accent");
  radarCtx.lineWidth = 3;
  radarCtx.fill();
  radarCtx.stroke();
}

function weatherIcon(value, inverse = false) {
  const score = inverse ? 1 / Math.max(value, 0.1) : value;
  if (score > 2.4) return "맑음";
  if (score > 1.2) return "구름조금";
  if (score > 0.8) return "흐림";
  return "비";
}

function renderCompanyIntelligence(ticker, result) {
  const data = fundamentals[ticker];
  const weatherItems = [
    ["PER", data.per, true],
    ["PBR", data.pbr, true],
    ["ROE", data.roe, false],
    ["EPS", data.eps, false],
    ["BPS", data.bps, false],
    ["수급", (data.foreignFlow + data.institutionFlow) / 500000, false],
  ];

  elements.weatherGrid.innerHTML = weatherItems
    .map(([label, value, inverse]) => {
      const weather = weatherIcon(value, inverse);
      const icon = weather === "맑음" ? "◎" : weather === "구름조금" ? "◐" : weather === "흐림" ? "○" : "●";
      return `
        <div class="weather-card">
          <em>${icon}</em>
          <strong>${label} ${weather}</strong>
          <span>동종 평균 대비 ${Number(value).toFixed(1)}배</span>
        </div>
      `;
    })
    .join("");

  const totalFlow = data.foreignFlow + data.institutionFlow;
  const issues = [
    [`${getTickerName(ticker)} 수급`, `외국인 ${formatFlow(data.foreignFlow)}, 기관 ${formatFlow(data.institutionFlow)}로 합산 ${formatFlow(totalFlow)}입니다.`],
    ["재무 해석", `수익성 ${data.profitability}, 성장성 ${data.growth}, 건전성 ${data.stability} 기준으로 ${data.stability > 100 ? "재무 방어력이 양호" : "재무 변동성 점검이 필요"}합니다.`],
    ["예측 연결", `현재 모델은 ${formatPercent(result.expectedReturn)} 기대수익률과 ${Math.round(result.confidence)}% 신뢰도를 반영합니다.`],
  ];

  elements.issueList.innerHTML = issues
    .map(([title, body]) => `<li><strong>${title}</strong><span>${body}</span></li>`)
    .join("");
  renderStockNews(ticker);
  fetchStockNews(ticker);
}

function formatFlow(value) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(Math.round(value)).toLocaleString("ko-KR")}주`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderStockNews(ticker) {
  const articles = stockNews[ticker] || [];
  if (newsRequests[ticker]) {
    elements.newsList.innerHTML = `<li><span>관련 뉴스 헤드라인을 불러오는 중입니다.</span></li>`;
    return;
  }
  if (!articles.length) {
    const name = getTickerName(ticker);
    const query = encodeURIComponent(`${name} 주가 뉴스`);
    elements.newsList.innerHTML = `
      <li>
        <a href="https://news.google.com/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko" target="_blank" rel="noopener noreferrer">${escapeHtml(name)} 관련 뉴스 검색</a>
        <span>${apiConnectionState.ok === false ? "뉴스 API 연결 실패 · 외부 뉴스 검색 링크 제공" : "최근 뉴스 헤드라인을 아직 불러오지 못했습니다."}</span>
      </li>
    `;
    return;
  }
  elements.newsList.innerHTML = articles
    .slice(0, 6)
    .map(
      (article) => `
        <li>
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a>
          <span>${escapeHtml(article.source || "뉴스")}${article.publishedAt ? ` · ${escapeHtml(article.publishedAt)}` : ""}</span>
        </li>
      `,
    )
    .join("");
}

async function fetchStockNews(ticker) {
  if (!ticker || stockNews[ticker] || newsRequests[ticker]) return;
  newsRequests[ticker] = true;
  renderStockNews(ticker);
  try {
    const name = getTickerName(ticker);
    const response = await fetchApi(`/api/news?symbol=${encodeURIComponent(ticker)}&name=${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error("뉴스 응답 오류");
    const payload = await response.json();
    stockNews[ticker] = Array.isArray(payload.articles) ? payload.articles : [];
  } catch (error) {
    stockNews[ticker] = [];
  } finally {
    delete newsRequests[ticker];
    if (elements.ticker.value === ticker) renderStockNews(ticker);
  }
}

function simpleLinearPrediction(prices) {
  const n = prices.length;
  const xMean = (n - 1) / 2;
  const yMean = average(prices);
  const numerator = prices.reduce((sum, price, index) => sum + (index - xMean) * (price - yMean), 0);
  const denominator = prices.reduce((sum, _, index) => sum + (index - xMean) ** 2, 0) || 1;
  const slope = numerator / denominator;
  return prices.at(-1) + slope * 5;
}

function arimaLikePrediction(prices) {
  const returns = getReturns(prices);
  const recent = average(returns.slice(-5));
  const baseline = average(returns);
  const drift = baseline + (recent - baseline) * 0.35;
  return prices.at(-1) * (1 + drift * 5);
}

function lstmLikePrediction(prices) {
  const returns = getReturns(prices);
  const weights = returns.slice(-8).map((_, index, arr) => (index + 1) / arr.length);
  const weighted = returns
    .slice(-8)
    .reduce((sum, value, index) => sum + value * weights[index], 0) / weights.reduce((sum, value) => sum + value, 0);
  const volatilityPenalty = standardDeviation(returns) * 0.4;
  return prices.at(-1) * (1 + (weighted - volatilityPenalty) * 5);
}

function calculateIndicators(prices) {
  const last = prices.at(-1);
  const sma5 = average(prices.slice(-5));
  const sma10 = average(prices.slice(-10));
  const returns = getReturns(prices);
  const gains = returns.slice(-10).filter((value) => value > 0);
  const losses = returns.slice(-10).filter((value) => value < 0).map(Math.abs);
  const avgGain = gains.length ? average(gains) : 0.001;
  const avgLoss = losses.length ? average(losses) : 0.001;
  const rsi = 100 - 100 / (1 + avgGain / avgLoss);
  const macd = average(prices.slice(-5)) - average(prices.slice(-12));
  const trend = last > sma5 && sma5 > sma10 ? "상승" : last < sma5 && sma5 < sma10 ? "하락" : "중립";
  return { sma5, sma10, rsi, macd, trend };
}

function buildOhlcv(ticker, prices = samples[ticker]) {
  ensureSymbolData(ticker);
  const actualRows = ohlcvHistory[ticker];
  if (actualRows?.length === prices.length) {
    return actualRows.map((row, index) => ({
      date: row.date || priceDates[ticker]?.[index] || sampleDates[index] || `D+${index + 1}`,
      open: row.open,
      high: row.high,
      low: row.low,
      close: prices[index] ?? row.close,
      volume: Number.isFinite(row.volume) ? row.volume : 0,
    }));
  }
  const profile = companyProfiles[ticker];
  return prices.map((close, index) => {
    const previous = prices[index - 1] ?? close * 0.992;
    const open = previous * (1 + Math.sin(index + ticker.length) * 0.004);
    const spread = Math.max(close * (0.008 + (profile.beta - 0.8) * 0.002), close * 0.006);
    const high = Math.max(open, close) + spread;
    const low = Math.max(1, Math.min(open, close) - spread);
    const volumeBase = isKoreanTicker(ticker) ? 1800000 : 24000000;
    const volume = Math.round(volumeBase * (1 + index * 0.035 + Math.abs(close - previous) / previous * 5));
    return {
      date: priceDates[ticker]?.[index] || sampleDates[index] || `D+${index + 1}`,
      open,
      high,
      low,
      close,
      volume,
    };
  });
}

function movingAverage(values, window) {
  return values.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    return average(values.slice(start, index + 1));
  });
}

function ema(values, span) {
  const alpha = 2 / (span + 1);
  return values.reduce((acc, value, index) => {
    acc.push(index === 0 ? value : value * alpha + acc[index - 1] * (1 - alpha));
    return acc;
  }, []);
}

function calculateAdvancedIndicators(ticker, prices = samples[ticker]) {
  ensureSymbolData(ticker);
  const rows = buildOhlcv(ticker, prices);
  const closes = rows.map((row) => row.close);
  const highs = rows.map((row) => row.high);
  const lows = rows.map((row) => row.low);
  const volumes = rows.map((row) => row.volume);
  const returns = getReturns(closes);
  const sma20 = movingAverage(closes, 20);
  const sma50 = movingAverage(closes, 50);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macd = ema12.map((value, index) => value - ema26[index]);
  const macdSignal = ema(macd, 9);
  const bbMiddle = sma20;
  const bbStd = closes.map((_, index) => {
    const start = Math.max(0, index - 19);
    return standardDeviation(closes.slice(start, index + 1));
  });
  const bbUpper = bbMiddle.map((value, index) => value + bbStd[index] * 2);
  const bbLower = bbMiddle.map((value, index) => value - bbStd[index] * 2);
  const rsi = closes.map((_, index) => {
    const localReturns = getReturns(closes.slice(Math.max(0, index - 14), index + 1));
    const gains = localReturns.filter((value) => value > 0);
    const losses = localReturns.filter((value) => value < 0).map(Math.abs);
    const avgGain = gains.length ? average(gains) : 0.001;
    const avgLoss = losses.length ? average(losses) : 0.001;
    return 100 - 100 / (1 + avgGain / avgLoss);
  });
  const atr = rows.map((row, index) => {
    const prevClose = rows[index - 1]?.close ?? row.close;
    const trueRange = Math.max(row.high - row.low, Math.abs(row.high - prevClose), Math.abs(row.low - prevClose));
    const start = Math.max(0, index - 13);
    const ranges = rows.slice(start, index + 1).map((innerRow, innerIndex) => {
      const absoluteIndex = start + innerIndex;
      const prev = rows[absoluteIndex - 1]?.close ?? innerRow.close;
      return Math.max(innerRow.high - innerRow.low, Math.abs(innerRow.high - prev), Math.abs(innerRow.low - prev));
    });
    return ranges.length ? average(ranges) : trueRange;
  });
  const volumeSma = movingAverage(volumes, 20);
  const stochK = rows.map((row, index) => {
    const start = Math.max(0, index - 13);
    const low = Math.min(...lows.slice(start, index + 1));
    const high = Math.max(...highs.slice(start, index + 1));
    return high === low ? 50 : ((row.close - low) / (high - low)) * 100;
  });

  return rows.map((row, index) => ({
    ...row,
    returnValue: index === 0 ? 0 : returns[index - 1],
    sma20: sma20[index],
    sma50: sma50[index],
    macd: macd[index],
    macdSignal: macdSignal[index],
    bbUpper: bbUpper[index],
    bbLower: bbLower[index],
    rsi: rsi[index],
    atr: atr[index],
    volumeRatio: volumeSma[index] ? row.volume / volumeSma[index] : 1,
    stochK: stochK[index],
  }));
}

function getModelSummary(ticker) {
  ensureSymbolData(ticker);
  const prices = samples[ticker];
  const last = prices.at(-1);
  const lr = simpleLinearPrediction(prices);
  const arima = arimaLikePrediction(prices);
  const lstm = lstmLikePrediction(prices);
  const indicators = calculateIndicators(prices);
  const modelReturns = [lr, arima, lstm].map((value) => (value - last) / last);
  const avgReturn = average(modelReturns);
  const agreement = modelReturns.filter((value) => Math.sign(value) === Math.sign(avgReturn)).length / modelReturns.length;
  const rsiPenalty = indicators.rsi > 72 ? -0.08 : indicators.rsi < 32 ? 0.05 : 0;
  const trendBonus = indicators.trend === "상승" ? 0.06 : indicators.trend === "하락" ? -0.06 : 0;
  const recommendationScore = Math.round(50 + avgReturn * 420 + agreement * 18 + trendBonus * 100 + rsiPenalty * 100);
  return {
    ticker,
    last,
    lr,
    arima,
    lstm,
    indicators,
    avgReturn,
    agreement,
    recommendationScore: Math.max(0, Math.min(100, recommendationScore)),
  };
}

function renderCompareControls(peerSymbols, groupLabel) {
  elements.compareTickerControls.innerHTML = peerSymbols
    .map(
      (ticker) => `
        <label class="compare-toggle">
          <input type="checkbox" value="${ticker}" checked />
          <span>${getTickerName(ticker)}</span>
        </label>
      `,
    )
    .join("") + `<span class="peer-group-label">${groupLabel || "뉴스 동반 언급 그룹"}</span>`;
}

function drawCompareChart(seriesSymbols = compareSymbols) {
  const ratio = window.devicePixelRatio || 1;
  const rect = compareCanvas.getBoundingClientRect();
  compareCanvas.width = Math.floor(rect.width * ratio);
  compareCanvas.height = Math.floor(rect.height * ratio);
  compareCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 24, right: 28, bottom: 34, left: 48 };
  const colors = ["#0f7b6c", "#2367a8", "#b56b00", "#8b4aa0", "#b03232"];
  const series = seriesSymbols.map((ticker) => {
    ensureSymbolData(ticker);
    const prices = samples[ticker];
    const base = prices[0];
    return { ticker, values: prices.map((price) => ((price - base) / base) * 100) };
  });
  const allValues = series.flatMap((item) => item.values);
  const min = Math.min(-2, ...allValues);
  const max = Math.max(2, ...allValues);
  const span = max - min || 1;
  const y = (value) => height - padding.bottom - ((value - min) / span) * (height - padding.top - padding.bottom);
  const x = (index, length) => {
    const localStep = (width - padding.left - padding.right) / Math.max(1, length - 1);
    return padding.left + index * localStep;
  };

  compareCtx.clearRect(0, 0, width, height);
  compareCtx.strokeStyle = getThemeColor("--line");
  compareCtx.lineWidth = 1;
  compareCtx.font = "12px Inter, system-ui, sans-serif";
  compareCtx.fillStyle = getThemeColor("--muted");

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = min + (span / 4) * tick;
    compareCtx.beginPath();
    compareCtx.moveTo(padding.left, y(value));
    compareCtx.lineTo(width - padding.right, y(value));
    compareCtx.stroke();
    compareCtx.fillText(`${value.toFixed(1)}%`, 8, y(value) + 4);
  }

  series.forEach((item, seriesIndex) => {
    compareCtx.beginPath();
    item.values.forEach((value, index) => {
      if (index === 0) compareCtx.moveTo(x(index, item.values.length), y(value));
      else compareCtx.lineTo(x(index, item.values.length), y(value));
    });
    compareCtx.strokeStyle = colors[seriesIndex % colors.length];
    compareCtx.lineWidth = 3;
    compareCtx.lineJoin = "round";
    compareCtx.lineCap = "round";
    compareCtx.stroke();
  });

  elements.compareLegend.innerHTML = series
    .map((item, index) => `<span><i class="dot" style="background:${colors[index % colors.length]}"></i>${getTickerName(item.ticker)}</span>`)
    .join("");
}

function renderModelAnalysis() {
  const peerGroup = getNewsCoMentionGroup(elements.ticker.value);
  const peerSymbols = getPeerComparisonSymbols(elements.ticker.value);
  compareSymbols = peerSymbols;
  peerSymbols.forEach((ticker) => {
    if (!ohlcvHistory[ticker] && !marketDataRequests[ticker]) fetchSymbolMarketData(ticker, { renderAfter: true });
  });
  renderCompareControls(peerSymbols, peerGroup?.label);
  drawCompareChart(peerSymbols);

  const summaries = peerSymbols.map(getModelSummary).sort((a, b) => b.recommendationScore - a.recommendationScore);
  const selectedSummary = getModelSummary(elements.ticker.value);
  const top = summaries[0];
  elements.topModelPick.textContent = getTickerName(top.ticker);
  elements.topModelPick.classList.add("model-company-name");
  elements.topModelCopy.textContent = `${getTickerName(top.ticker)}은 ${peerGroup?.label || "뉴스 동반 언급 그룹"} 5개 종목 중 모델 평균 ${formatPercent(top.avgReturn)}와 ${Math.round(top.agreement * 100)}% 합의도를 보입니다.`;
  if (apiConnectionState.ok === false) {
    elements.topModelCopy.textContent += " 현재 웹 배포 환경에서는 API 연결 실패로 로컬 기준 데이터를 함께 사용합니다.";
  }
  elements.modelAgreement.textContent = `${Math.round(selectedSummary.agreement * 100)}%`;
  elements.trendStrength.textContent = selectedSummary.indicators.trend;
  elements.rsiState.textContent =
    selectedSummary.indicators.rsi > 72 ? "과열" : selectedSummary.indicators.rsi < 32 ? "침체" : "중립";

  const last = selectedSummary.last;
  const modelCards = [
    ["LR", selectedSummary.lr, "5일 가격 창을 선형 추세로 학습한 단순 회귀형 모델"],
    ["ARIMA형", selectedSummary.arima, "평균 수익률과 최근 추세를 섞어 되돌림을 반영한 모델"],
    ["LSTM형", selectedSummary.lstm, "최근 수익률에 더 큰 가중치를 둔 순차 패턴 모델"],
  ];
  elements.modelCards.innerHTML = modelCards
    .map(
      ([name, value, copy]) => `
        <div class="model-card">
          <header><span>${name}</span><strong class="${value >= last ? "positive" : "negative"}">${formatPercent((value - last) / last)}</strong></header>
          <span>${copy}</span>
          <span>예측가 ${formatPrice(value)}</span>
        </div>
      `,
    )
    .join("");

  elements.modelRankingBody.innerHTML = summaries
    .map((summary) => {
      const signal = summary.recommendationScore >= 70 ? "매수" : summary.recommendationScore <= 45 ? "보류" : "관망";
      return `
        <tr>
          <td><strong class="model-company-name">${getTickerName(summary.ticker)}</strong></td>
          <td>${formatPercent((summary.lr - summary.last) / summary.last)}</td>
          <td>${formatPercent((summary.arima - summary.last) / summary.last)}</td>
          <td>${formatPercent((summary.lstm - summary.last) / summary.last)}</td>
          <td>${Math.round(summary.indicators.rsi)}</td>
          <td><span class="signal-badge ${signal === "관망" ? "neutral" : signal === "보류" ? "defensive" : ""}">${signal} ${summary.recommendationScore}</span></td>
        </tr>
      `;
    })
    .join("");
}

function getAiPrediction(indicators) {
  const latest = indicators.at(-1);
  const previous = indicators.at(-2);
  const priceChange = clamp((latest.close - previous.close) / previous.close, -0.04, 0.04);
  const maSignal = clamp((latest.close - latest.sma20) / latest.sma20, -0.08, 0.08);
  const macdSignal = clamp((latest.macd - latest.macdSignal) / latest.close, -0.03, 0.03);
  const rsiSignal = latest.rsi > 70 ? -0.006 : latest.rsi < 30 ? 0.008 : (latest.rsi - 50) / 8000;
  const volumeSignal = clamp((latest.volumeRatio - 1) / 120, -0.006, 0.012);
  const predictedReturn = clamp(priceChange * 0.26 + maSignal * 0.18 + macdSignal * 0.32 + rsiSignal + volumeSignal, -0.05, 0.05);
  const prediction = latest.close * (1 + predictedReturn);
  const confidence = Math.max(48, Math.min(91, 68 + Math.abs(predictedReturn) * 620 - latest.atr / latest.close * 180));
  return { prediction, predictedReturn, confidence };
}

function getFeatureImportance(indicators) {
  const latest = indicators.at(-1);
  const raw = [
    ["MACD momentum", Math.abs(latest.macd - latest.macdSignal) / latest.close],
    ["RSI position", Math.abs(latest.rsi - 50) / 100],
    ["Price vs SMA20", Math.abs((latest.close - latest.sma20) / latest.sma20)],
    ["Volume ratio", Math.abs(latest.volumeRatio - 1) / 3],
    ["ATR volatility", latest.atr / latest.close],
    ["Stochastic", Math.abs(latest.stochK - 50) / 100],
  ];
  const total = raw.reduce((sum, [, value]) => sum + value, 0) || 1;
  return raw
    .map(([name, value]) => [name, value / total])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

function getFeatureDescription(name) {
  const descriptions = {
    "MACD momentum": "MACD와 신호선의 벌어진 정도입니다. 값이 클수록 추세 전환이나 가속 신호가 예측에 더 많이 반영됩니다.",
    "RSI position": "RSI가 중립선 50에서 얼마나 떨어져 있는지 봅니다. 과열·침체에 가까울수록 모멘텀 판단 비중이 커집니다.",
    "Price vs SMA20": "현재가가 20일 평균선에서 얼마나 벗어났는지 나타냅니다. 추세 유지와 평균 회귀 가능성을 함께 해석합니다.",
    "Volume ratio": "현재 거래량이 평균 거래량 대비 얼마나 강한지 봅니다. 거래량이 커질수록 가격 움직임의 신뢰도를 높게 봅니다.",
    "ATR volatility": "최근 가격 변동 폭입니다. 값이 클수록 예측에는 리스크와 불확실성이 더 크게 반영됩니다.",
    Stochastic: "최근 고가·저가 범위 안에서 현재가의 위치를 봅니다. 상단에 가까우면 과열, 하단에 가까우면 침체로 해석합니다.",
  };
  return descriptions[name] || "해당 지표가 이번 예측값에 어느 정도 영향을 줬는지 나타냅니다.";
}

function generateAiInsights(ticker, indicators, prediction) {
  const latest = indicators.at(-1);
  const previous = indicators.at(-2);
  const change = (latest.close - previous.close) / previous.close;
  const displayName = getTickerName(ticker);
  const insights = [];

  if (change > 0.03) insights.push(["positive", `${displayName}는 단기 급등 흐름입니다. 하루 변동률이 ${formatPercent(change)}로 강한 매수세가 감지됩니다.`]);
  else if (change > 0.01) insights.push(["positive", `${displayName}는 우상향 움직임입니다. 종가 기준 ${formatPercent(change)} 상승했습니다.`]);
  else if (change < -0.03) insights.push(["negative", `${displayName}는 강한 매도 압력을 받고 있습니다. 단기 리스크 관리가 우선입니다.`]);
  else if (change < -0.01) insights.push(["negative", `${displayName}는 약세 압력이 있습니다. 추세 회복 확인 전 신규 진입은 보수적으로 봅니다.`]);
  else insights.push(["neutral", `${displayName}는 좁은 범위에서 움직이고 있습니다. 방향성 확인이 필요합니다.`]);

  if (latest.rsi > 70) insights.push(["negative", `RSI ${latest.rsi.toFixed(1)}로 과열 구간입니다. 추격 매수보다 분할 접근이 적합합니다.`]);
  else if (latest.rsi < 30) insights.push(["positive", `RSI ${latest.rsi.toFixed(1)}로 침체 구간입니다. 반등 가능성은 있으나 거래량 확인이 필요합니다.`]);
  else insights.push(["neutral", `RSI ${latest.rsi.toFixed(1)}로 모멘텀은 균형권입니다.`]);

  if (latest.close > latest.sma20 && latest.sma20 > latest.sma50) insights.push(["positive", "가격이 주요 이동평균 위에 있어 상승 정렬이 유지됩니다."]);
  else if (latest.close < latest.sma20 && latest.sma20 < latest.sma50) insights.push(["negative", "가격이 주요 이동평균 아래에 있어 하락 추세가 우세합니다."]);
  else insights.push(["neutral", "이동평균 신호가 혼재되어 있습니다. 돌파 또는 이탈 확인이 필요합니다."]);

  if (latest.close > latest.bbUpper) insights.push(["negative", "종가가 볼린저 상단을 넘어 단기 과열 가능성이 있습니다."]);
  else if (latest.close < latest.bbLower) insights.push(["positive", "종가가 볼린저 하단에 가까워 기술적 반등 구간일 수 있습니다."]);

  if (latest.volumeRatio > 1.5) insights.push(["positive", `거래량이 평균 대비 ${latest.volumeRatio.toFixed(1)}배로 가격 움직임의 신뢰도가 높습니다.`]);
  else if (latest.volumeRatio < 0.7) insights.push(["neutral", "거래량이 평균보다 낮아 현재 움직임의 확신은 약합니다."]);

  insights.push([
    prediction.predictedReturn >= 0 ? "positive" : "negative",
    `AI 예측은 다음 거래일 ${formatPercent(prediction.predictedReturn)} 변화를 제시하며 신뢰도는 ${Math.round(prediction.confidence)}%입니다.`,
  ]);

  return insights;
}

function drawTechnicalChart(indicators) {
  const ratio = window.devicePixelRatio || 1;
  const rect = technicalCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  technicalCanvas.width = Math.floor(rect.width * ratio);
  technicalCanvas.height = Math.floor(rect.height * ratio);
  technicalCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 24, right: 30, bottom: 34, left: 56 };
  const priceHeight = height * 0.56;
  const macdTop = priceHeight + 24;
  const rsiTop = height * 0.78;
  const prices = indicators.map((row) => row.close);
  const upper = indicators.map((row) => row.bbUpper);
  const lower = indicators.map((row) => row.bbLower);
  const min = Math.min(...prices, ...lower);
  const max = Math.max(...prices, ...upper);
  const span = max - min || 1;
  const xStep = (width - padding.left - padding.right) / (indicators.length - 1);
  const x = (index) => padding.left + index * xStep;
  const yPrice = (value) => padding.top + (1 - (value - min) / span) * (priceHeight - padding.top);

  technicalCtx.clearRect(0, 0, width, height);
  technicalCtx.font = "12px Inter, system-ui, sans-serif";
  technicalCtx.strokeStyle = getThemeColor("--line");
  technicalCtx.fillStyle = getThemeColor("--muted");

  for (let tick = 0; tick <= 3; tick += 1) {
    const value = min + (span / 3) * tick;
    technicalCtx.beginPath();
    technicalCtx.moveTo(padding.left, yPrice(value));
    technicalCtx.lineTo(width - padding.right, yPrice(value));
    technicalCtx.stroke();
    technicalCtx.fillText(Math.round(value).toLocaleString("ko-KR"), 12, yPrice(value) + 4);
  }

  drawSeries(indicators.map((row) => row.bbUpper), "rgba(255, 194, 71, 0.45)", 1, yPrice);
  drawSeries(indicators.map((row) => row.bbLower), "rgba(255, 194, 71, 0.45)", 1, yPrice);
  drawSeries(indicators.map((row) => row.sma20), "#ffb547", 2, yPrice);
  drawSeries(prices, getThemeColor("--accent"), 3, yPrice);

  const macdValues = indicators.flatMap((row) => [row.macd, row.macdSignal]);
  const macdMax = Math.max(Math.abs(Math.min(...macdValues)), Math.abs(Math.max(...macdValues)), 1);
  const yMacd = (value) => macdTop + 70 - (value / macdMax) * 52;
  drawSeries(indicators.map((row) => row.macd), "#af52de", 2, yMacd);
  drawSeries(indicators.map((row) => row.macdSignal), "#35a852", 2, yMacd);
  technicalCtx.fillText("MACD", 12, macdTop + 20);

  const yRsi = (value) => rsiTop + 90 - (value / 100) * 80;
  technicalCtx.strokeStyle = getThemeColor("--line");
  [30, 70].forEach((level) => {
    technicalCtx.beginPath();
    technicalCtx.moveTo(padding.left, yRsi(level));
    technicalCtx.lineTo(width - padding.right, yRsi(level));
    technicalCtx.stroke();
  });
  drawSeries(indicators.map((row) => row.rsi), "#ff6ccf", 2, yRsi);
  technicalCtx.fillText("RSI", 12, rsiTop + 20);

  function drawSeries(values, color, lineWidth, yFn) {
    technicalCtx.beginPath();
    values.forEach((value, index) => {
      if (index === 0) technicalCtx.moveTo(x(index), yFn(value));
      else technicalCtx.lineTo(x(index), yFn(value));
    });
    technicalCtx.strokeStyle = color;
    technicalCtx.lineWidth = lineWidth;
    technicalCtx.lineJoin = "round";
    technicalCtx.lineCap = "round";
    technicalCtx.stroke();
  }
}

function renderAiInsights(ticker) {
  const indicators = calculateAdvancedIndicators(ticker, getAnalysisPrices(ticker));
  const latest = indicators.at(-1);
  const previous = indicators.at(-2);
  const profile = companyProfiles[ticker];
  const prediction = getAiPrediction(indicators);
  const dailyReturns = indicators.slice(1).map((row) => row.returnValue);
  const dailyVolatility = standardDeviation(dailyReturns);
  const annualVolatility = dailyVolatility * Math.sqrt(252);
  const sharpe = dailyVolatility ? (average(dailyReturns) * 252) / (dailyVolatility * Math.sqrt(252)) : 0;
  const change = (latest.close - previous.close) / previous.close;
  const smaDistance = (latest.close - latest.sma20) / latest.sma20;
  const aiOpinion = buildOpinionFromForecast({
    currentPrice: latest.close,
    targetPrice: prediction.prediction,
    expectedReturn: prediction.predictedReturn,
    risk: dailyVolatility * 1.35,
    confidence: prediction.confidence,
  });

  elements.aiCurrentPrice.textContent = formatPrice(latest.close, ticker);
  elements.aiPriceChange.textContent = formatPercent(change);
  elements.aiPriceChange.className = change >= 0 ? "positive" : "negative";
  elements.aiVolumeRatio.textContent = `${latest.volumeRatio.toFixed(1)}x`;
  elements.aiRsiValue.textContent = latest.rsi.toFixed(1);
  elements.aiRsiLabel.textContent = latest.rsi > 70 ? "과열" : latest.rsi < 30 ? "침체" : "중립";
  elements.aiSmaDistance.textContent = formatPercent(smaDistance);
  elements.aiSmaLabel.textContent = smaDistance >= 0 ? "SMA 상단" : "SMA 하단";
  elements.aiCapGrade.textContent = profile.cap;
  elements.aiBetaLabel.textContent = `Beta ${profile.beta.toFixed(2)}`;
  elements.aiPredictionPrice.textContent = formatPrice(prediction.prediction, ticker);
  elements.aiPredictionCopy.textContent = `예상 변화율 ${formatPercent(prediction.predictedReturn)} 기준입니다.`;
  updateOpinionCard(
    "ai",
    aiOpinion,
    ticker,
    `기술지표와 변동성을 반영한 다음 거래일 ${aiOpinion.label} 의견입니다.`
  );
  elements.aiConfidence.textContent = `${Math.round(prediction.confidence)}%`;
  elements.aiVolatility.textContent = formatPercent(annualVolatility).replace("+", "");
  elements.aiSharpe.textContent = sharpe.toFixed(2);
  elements.aiSignalPill.textContent = prediction.predictedReturn >= 0.015 ? "강세" : prediction.predictedReturn <= -0.01 ? "약세" : "중립";
  elements.aiSignalPill.style.background =
    prediction.predictedReturn >= 0.015 ? "var(--success)" : prediction.predictedReturn <= -0.01 ? "var(--red)" : "var(--amber)";

  drawTechnicalChart(indicators);

  elements.aiInsights.innerHTML = generateAiInsights(ticker, indicators, prediction)
    .map(([tone, text]) => `<li class="${tone}">${text}</li>`)
    .join("");

  elements.featureImportance.innerHTML = getFeatureImportance(indicators)
    .map(
      ([name, value]) => `
        <div class="importance-row">
          <header><strong>${name}</strong><span>${Math.round(value * 100)}%</span></header>
          <div class="importance-bar"><i style="width:${Math.max(4, value * 100)}%"></i></div>
          <p>${getFeatureDescription(name)}</p>
        </div>
      `,
    )
    .join("");

  const companyInfo = [
    ["회사", getTickerName(ticker)],
    ["섹터", profile.sector],
    ["산업", profile.industry],
    ["국가", profile.country],
    ["직원 수", profile.employees.toLocaleString("ko-KR")],
    ["시총 등급", profile.cap],
  ];
  elements.companyInfo.innerHTML = companyInfo
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  elements.technicalDataBody.innerHTML = indicators
    .slice(-8)
    .map(
      (row) => `
        <tr>
          <td>${row.date}</td>
          <td>${formatPrice(row.close, ticker)}</td>
          <td>${row.rsi.toFixed(1)}</td>
          <td>${row.macd.toFixed(2)}</td>
          <td>${formatPrice(row.bbUpper, ticker)}</td>
          <td>${formatPrice(row.bbLower, ticker)}</td>
          <td>${row.atr.toFixed(2)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderAiInsightsVisible() {
  if (!elements.ticker.value) {
    render();
    return;
  }
  requestAnimationFrame(() => {
    renderAiInsights(elements.ticker.value);
  });
}

function findSwingPoints(rows, radius = 2) {
  const highs = [];
  const lows = [];
  for (let index = radius; index < rows.length - radius; index += 1) {
    const window = rows.slice(index - radius, index + radius + 1);
    if (rows[index].high === Math.max(...window.map((row) => row.high))) highs.push({ index, value: rows[index].high, row: rows[index] });
    if (rows[index].low === Math.min(...window.map((row) => row.low))) lows.push({ index, value: rows[index].low, row: rows[index] });
  }
  return { highs, lows };
}

function getSmartMoneySetup(ticker, mode = "smc") {
  const rows = getAnalysisRows(ticker).slice(-70);
  const latest = rows.at(-1);
  const previousRows = rows.slice(0, -1);
  const { highs, lows } = findSwingPoints(rows);
  const previousHigh = highs.filter((point) => point.index < rows.length - 1).at(-1);
  const previousLow = lows.filter((point) => point.index < rows.length - 1).at(-1);
  const rangeHigh = Math.max(...rows.slice(-35).map((row) => row.high));
  const rangeLow = Math.min(...rows.slice(-35).map((row) => row.low));
  const equilibrium = (rangeHigh + rangeLow) / 2;
  const premiumDiscount = latest.close < equilibrium ? "Discount" : "Premium";
  const avgBody = average(rows.slice(-20).map((row) => Math.abs(row.close - row.open)));
  const avgVolume = average(rows.slice(-20).map((row) => row.volume || 1));
  const bullishBos = previousHigh ? latest.close > previousHigh.value : false;
  const bearishBos = previousLow ? latest.close < previousLow.value : false;
  const bullishSweep = previousLow ? latest.low < previousLow.value && latest.close > previousLow.value : false;
  const bearishSweep = previousHigh ? latest.high > previousHigh.value && latest.close < previousHigh.value : false;
  const structure = bullishBos ? "상방 BOS" : bearishBos ? "하방 BOS" : bullishSweep ? "SSL 스윕" : bearishSweep ? "BSL 스윕" : "횡보/대기";
  const direction = bullishBos || bullishSweep || latest.close >= equilibrium ? "bullish" : "bearish";

  const fvgList = [];
  for (let index = 2; index < rows.length; index += 1) {
    const first = rows[index - 2];
    const third = rows[index];
    if (first.high < third.low) {
      fvgList.push({ index, type: "bullish", low: first.high, high: third.low, midpoint: (first.high + third.low) / 2 });
    }
    if (first.low > third.high) {
      fvgList.push({ index, type: "bearish", low: third.high, high: first.low, midpoint: (third.high + first.low) / 2 });
    }
  }
  const fairValueGap = [...fvgList]
    .reverse()
    .find((gap) => gap.type === direction && latest.close >= gap.low * 0.985 && latest.close <= gap.high * 1.04) || fvgList.at(-1);

  let orderBlock = null;
  for (let index = rows.length - 1; index >= 5; index -= 1) {
    const row = rows[index];
    const body = Math.abs(row.close - row.open);
    const volumePower = avgVolume ? (row.volume || avgVolume) / avgVolume : 1;
    const displacement = body > avgBody * 1.25 && volumePower > 0.95;
    if (!displacement) continue;
    const isBullishMove = row.close > row.open;
    for (let cursor = index - 1; cursor >= Math.max(0, index - 6); cursor -= 1) {
      const candidate = rows[cursor];
      if (isBullishMove && candidate.close < candidate.open) {
        orderBlock = { index: cursor, type: "bullish", low: candidate.low, high: candidate.high, midpoint: (candidate.low + candidate.high) / 2 };
        break;
      }
      if (!isBullishMove && candidate.close > candidate.open) {
        orderBlock = { index: cursor, type: "bearish", low: candidate.low, high: candidate.high, midpoint: (candidate.low + candidate.high) / 2 };
        break;
      }
    }
    if (orderBlock) break;
  }

  const swingRange = rangeHigh - rangeLow || latest.close * 0.01;
  const oteLow = direction === "bullish" ? rangeHigh - swingRange * 0.79 : rangeLow + swingRange * 0.62;
  const oteHigh = direction === "bullish" ? rangeHigh - swingRange * 0.62 : rangeLow + swingRange * 0.79;
  const inOte = latest.close >= Math.min(oteLow, oteHigh) && latest.close <= Math.max(oteLow, oteHigh);
  const fvgAligned = Boolean(fairValueGap && fairValueGap.type === direction);
  const obAligned = Boolean(orderBlock && orderBlock.type === direction);
  const inOrderBlock = orderBlock ? latest.close >= orderBlock.low && latest.close <= orderBlock.high : false;
  const volumePower = avgVolume ? (latest.volume || avgVolume) / avgVolume : 1;
  const displacement = Math.abs(latest.close - latest.open) > avgBody * 1.2 && volumePower >= 1.0;

  const checks =
    mode === "ict"
      ? [
          ["FVG 가격 비효율", fairValueGap ? `${fairValueGap.type === "bullish" ? "상승" : "하락"} FVG ${formatPrice(fairValueGap.low, ticker)}~${formatPrice(fairValueGap.high, ticker)} 확인` : "최근 FVG 부재", fvgAligned, 22],
          ["OTE 되돌림", `최근 스윙의 62~79% 구간은 ${formatPrice(Math.min(oteLow, oteHigh), ticker)}~${formatPrice(Math.max(oteLow, oteHigh), ticker)}입니다.`, inOte, 18],
          ["유동성 회수", bullishSweep || bearishSweep ? `${bullishSweep ? "SSL" : "BSL"} 스윕 후 되돌림` : "명확한 스윕 부재", bullishSweep || bearishSweep, 18],
          ["Displacement", `몸통·거래량 기준 가격 전달 강도 ${volumePower.toFixed(1)}x`, displacement, 16],
          ["프리미엄/디스카운트", `${premiumDiscount} 구간에서 ${direction === "bullish" ? "롱" : "숏/방어"} 관점`, direction === "bullish" ? latest.close <= equilibrium : latest.close >= equilibrium, 14],
          ["유동성 타깃", `상단 BSL ${formatPrice(previousHigh?.value || rangeHigh, ticker)}, 하단 SSL ${formatPrice(previousLow?.value || rangeLow, ticker)}`, Boolean(previousHigh && previousLow), 12],
        ]
      : [
          ["시장구조", `${structure} 상태입니다.`, bullishBos || bearishBos || bullishSweep || bearishSweep, 22],
          ["유동성 스윕", bullishSweep || bearishSweep ? `${bullishSweep ? "매도 유동성" : "매수 유동성"} 회수 후 종가 복귀` : "최근 스윙 유동성 회수 부재", bullishSweep || bearishSweep, 18],
          ["오더블록", orderBlock ? `${orderBlock.type === "bullish" ? "상승" : "하락"} OB ${formatPrice(orderBlock.low, ticker)}~${formatPrice(orderBlock.high, ticker)}` : "검출된 OB 부재", obAligned || inOrderBlock, 18],
          ["FVG", fairValueGap ? `${fairValueGap.type === "bullish" ? "상승" : "하락"} FVG ${formatPrice(fairValueGap.low, ticker)}~${formatPrice(fairValueGap.high, ticker)}` : "최근 FVG 부재", fvgAligned, 16],
          ["균형가", `현재는 ${premiumDiscount} 영역입니다. 균형가는 ${formatPrice(equilibrium, ticker)}입니다.`, direction === "bullish" ? latest.close <= equilibrium : latest.close >= equilibrium, 14],
          ["거래량 확인", `최근 거래량 강도 ${volumePower.toFixed(1)}x`, volumePower >= 1.0, 12],
        ];

  const totalWeight = checks.reduce((sum, item) => sum + item[3], 0);
  const score = Math.round((checks.reduce((sum, item) => sum + (item[2] ? item[3] : 0), 0) / totalWeight) * 100);
  const signal = score >= 72 ? "강한 셋업" : score >= 55 ? "관찰" : score >= 38 ? "중립" : "대기";
  const setupName =
    mode === "ict"
      ? score >= 72
        ? "FVG·OTE 정렬"
        : score >= 55
          ? "가격 전달 관찰"
          : "유동성 대기"
      : score >= 72
        ? "구조·유동성 정렬"
        : score >= 55
          ? "오더블록 관찰"
          : "구조 확인 대기";

  return {
    ticker,
    rows,
    latest,
    previousHigh,
    previousLow,
    rangeHigh,
    rangeLow,
    equilibrium,
    premiumDiscount,
    direction,
    structure,
    bullishSweep,
    bearishSweep,
    fairValueGap,
    orderBlock,
    oteLow: Math.min(oteLow, oteHigh),
    oteHigh: Math.max(oteLow, oteHigh),
    inOte,
    volumePower,
    displacement,
    checks,
    score,
    signal,
    setupName,
  };
}

function drawSmartMoneyChart(canvasElement, context, setup, mode = "smc") {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvasElement.getBoundingClientRect();
  canvasElement.width = Math.floor(rect.width * ratio);
  canvasElement.height = Math.floor(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 24, right: 18, bottom: 44, left: 66 };
  const rows = setup.rows;
  const lows = rows.map((row) => row.low);
  const highs = rows.map((row) => row.high);
  if (setup.fairValueGap) {
    lows.push(setup.fairValueGap.low);
    highs.push(setup.fairValueGap.high);
  }
  if (setup.orderBlock) {
    lows.push(setup.orderBlock.low);
    highs.push(setup.orderBlock.high);
  }
  lows.push(setup.rangeLow, setup.equilibrium, setup.oteLow);
  highs.push(setup.rangeHigh, setup.equilibrium, setup.oteHigh);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = max - min || 1;
  const xStep = (width - padding.left - padding.right) / Math.max(1, rows.length - 1);
  const x = (index) => padding.left + index * xStep;
  const y = (value) => padding.top + (1 - (value - min) / span) * (height - padding.top - padding.bottom);

  context.clearRect(0, 0, width, height);
  context.font = "12px Inter, system-ui, sans-serif";
  context.strokeStyle = getThemeColor("--line");
  context.fillStyle = getThemeColor("--muted");
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = min + (span / 4) * tick;
    context.beginPath();
    context.moveTo(padding.left, y(value));
    context.lineTo(width - padding.right, y(value));
    context.stroke();
    context.fillText(Math.round(value).toLocaleString("ko-KR"), 12, y(value) + 4);
  }

  drawZone(setup.rangeLow, setup.equilibrium, "rgba(15, 123, 108, 0.07)", "Discount");
  drawZone(setup.equilibrium, setup.rangeHigh, "rgba(207, 65, 65, 0.06)", "Premium");
  if (setup.fairValueGap) drawZone(setup.fairValueGap.low, setup.fairValueGap.high, "rgba(67, 124, 247, 0.16)", "FVG");
  if (setup.orderBlock) drawZone(setup.orderBlock.low, setup.orderBlock.high, "rgba(255, 181, 71, 0.18)", "OB");
  if (mode === "ict") drawZone(setup.oteLow, setup.oteHigh, "rgba(175, 82, 222, 0.13)", "OTE");

  rows.forEach((row, index) => {
    const candleX = x(index);
    const candleWidth = Math.max(3, Math.min(8, xStep * 0.56));
    const rising = row.close >= row.open;
    context.strokeStyle = rising ? getThemeColor("--accent") : getThemeColor("--red");
    context.fillStyle = rising ? getThemeColor("--accent") : getThemeColor("--red");
    context.beginPath();
    context.moveTo(candleX, y(row.high));
    context.lineTo(candleX, y(row.low));
    context.stroke();
    const top = y(Math.max(row.open, row.close));
    const bodyHeight = Math.max(2, Math.abs(y(row.open) - y(row.close)));
    context.fillRect(candleX - candleWidth / 2, top, candleWidth, bodyHeight);
  });

  drawLine(setup.equilibrium, getThemeColor("--muted"), "50%");
  if (setup.previousHigh) drawLine(setup.previousHigh.value, "#cf4141", "BSL");
  if (setup.previousLow) drawLine(setup.previousLow.value, "#0f7b6c", "SSL");

  context.textAlign = "center";
  context.fillStyle = getThemeColor("--muted");
  const labelEvery = Math.max(1, Math.floor(rows.length / 5));
  rows.forEach((row, index) => {
    if (index % labelEvery !== 0 && index !== rows.length - 1) return;
    context.fillText(formatChartDate(row.date), x(index), height - 16);
  });
  context.textAlign = "left";

  function drawZone(low, high, color, label) {
    const top = y(Math.max(low, high));
    const zoneHeight = Math.max(4, Math.abs(y(low) - y(high)));
    context.fillStyle = color;
    context.fillRect(padding.left, top, width - padding.left - padding.right, zoneHeight);
    context.fillStyle = getThemeColor("--muted");
    context.fillText(label, padding.left + 8, top + 14);
  }

  function drawLine(value, color, label) {
    context.setLineDash([7, 6]);
    context.beginPath();
    context.moveTo(padding.left, y(value));
    context.lineTo(width - padding.right, y(value));
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = color;
    context.fillText(label, width - padding.right - 40, y(value) - 7);
  }
}

function renderSmcAnalysis() {
  const ticker = elements.ticker.value;
  if (!ticker) return;
  const setup = getSmartMoneySetup(ticker, "smc");
  drawSmartMoneyChart(smcCanvas, smcCtx, setup, "smc");
  elements.smcScore.textContent = setup.score;
  elements.smcSetupName.textContent = setup.setupName;
  elements.smcSetupCopy.textContent = `${setup.structure}, ${setup.premiumDiscount} 구간. 기관·대형 투자자의 구조 장악, 유동성 회수, 오더블록 반응을 넓은 틀에서 점수화했습니다.${apiConnectionState.ok === false ? " API 연결 실패 시 로컬 기준 차트로 해석합니다." : ""}`;
  elements.smcSignalPill.textContent = setup.signal;
  elements.smcSignalPill.style.background = setup.score >= 72 ? "var(--accent)" : setup.score >= 55 ? "var(--amber)" : "var(--muted)";
  elements.smcStructure.textContent = setup.structure;
  elements.smcSweep.textContent = setup.bullishSweep ? "SSL 회수" : setup.bearishSweep ? "BSL 회수" : "미확인";
  elements.smcFvg.textContent = setup.fairValueGap ? `${setup.fairValueGap.type === "bullish" ? "상승" : "하락"} FVG` : "미확인";
  elements.smcOrderBlock.textContent = setup.orderBlock ? `${setup.orderBlock.type === "bullish" ? "상승" : "하락"} OB` : "미확인";
  renderSmartMoneyText(elements.smcChecklist, elements.smcInterpretation, setup, "smc");
}

function renderIctAnalysis() {
  const ticker = elements.ticker.value;
  if (!ticker) return;
  const setup = getSmartMoneySetup(ticker, "ict");
  drawSmartMoneyChart(ictCanvas, ictCtx, setup, "ict");
  elements.ictScore.textContent = setup.score;
  elements.ictSetupName.textContent = setup.setupName;
  elements.ictSetupCopy.textContent = `FVG ${setup.fairValueGap ? "확인" : "부재"}, OTE ${setup.inOte ? "진입" : "외부"}. SMC 안에서 유동성 확보와 페이크 무브 가능성을 정밀 보완했습니다.${apiConnectionState.ok === false ? " API 연결 실패 시 로컬 기준 차트로 해석합니다." : ""}`;
  elements.ictSignalPill.textContent = setup.signal;
  elements.ictSignalPill.style.background = setup.score >= 72 ? "var(--accent)" : setup.score >= 55 ? "var(--amber)" : "var(--muted)";
  elements.ictDelivery.textContent = setup.displacement ? "강함" : "보통";
  elements.ictOte.textContent = setup.inOte ? "구간 진입" : `${formatPrice(setup.oteLow, ticker)}~${formatPrice(setup.oteHigh, ticker)}`;
  elements.ictLiquidity.textContent = setup.direction === "bullish" ? "상단 BSL" : "하단 SSL";
  elements.ictEntry.textContent = setup.score >= 72 ? "양호" : setup.score >= 55 ? "관찰" : "대기";
  renderSmartMoneyText(elements.ictChecklist, elements.ictInterpretation, setup, "ict");
}

function renderSmartMoneyText(checklistElement, interpretationElement, setup, mode) {
  checklistElement.innerHTML = setup.checks
    .map(
      ([label, body, pass]) => `
        <div class="smart-money-check ${pass ? "pass" : ""}">
          <strong>${label}</strong>
          <span>${pass ? "충족" : "관찰"}</span>
          <p>${body}</p>
        </div>
      `,
    )
    .join("");
  const firstTarget =
    setup.direction === "bullish"
      ? setup.previousHigh?.value || setup.rangeHigh
      : setup.previousLow?.value || setup.rangeLow;
  const invalidation =
    setup.direction === "bullish"
      ? setup.previousLow?.value || setup.rangeLow
      : setup.previousHigh?.value || setup.rangeHigh;
  const rows =
    mode === "ict"
      ? [
          ["주요 관찰 구간", `OTE ${formatPrice(setup.oteLow, setup.ticker)}~${formatPrice(setup.oteHigh, setup.ticker)}와 FVG 중첩 여부를 우선 확인합니다.`],
          ["유동성 목표", `${setup.direction === "bullish" ? "상단 BSL" : "하단 SSL"} ${formatPrice(firstTarget, setup.ticker)}를 1차 타깃으로 둡니다.`],
          ["무효화 기준", `반대편 유동성 ${formatPrice(invalidation, setup.ticker)} 이탈 시 ICT 셋업 신뢰도를 낮춥니다.`],
        ]
      : [
          ["매수·매도 편향", `${setup.direction === "bullish" ? "상승" : "하락/방어"} 편향입니다. 현재가는 ${setup.premiumDiscount} 영역입니다.`],
          ["관찰 가격", `오더블록 ${setup.orderBlock ? `${formatPrice(setup.orderBlock.low, setup.ticker)}~${formatPrice(setup.orderBlock.high, setup.ticker)}` : "미검출"} 재반응을 봅니다.`],
          ["무효화 기준", `반대편 스윙 ${formatPrice(invalidation, setup.ticker)} 이탈 시 구조 해석을 재검토합니다.`],
        ];
  interpretationElement.innerHTML = rows.map(([title, body]) => `<li><strong>${title}</strong><span>${body}</span></li>`).join("");
}

function getDanteSetup(ticker) {
  const indicators = calculateAdvancedIndicators(ticker, getAnalysisPrices(ticker));
  const latest = { ...indicators.at(-1) };
  const previous = indicators.at(-2);

  const closes = [...indicators.slice(0, -1).map((row) => row.close), latest.close];
  const recentHigh = Math.max(...closes.slice(-6, -1));
  const recentLow = Math.min(...closes.slice(-8));
  const sma3 = average(closes.slice(-3));
  const prevSma3 = average(closes.slice(-4, -1));
  const longLine = latest.sma50;
  const longDistance = (latest.close - longLine) / longLine;
  const pullbackDepth = recentHigh ? (recentHigh - latest.close) / recentHigh : 0;
  const recoveryFromLow = recentLow ? (latest.close - recentLow) / recentLow : 0;
  const preBreakoutCloses = closes.slice(-8, -2);
  const baseTightness = standardDeviation(getReturns(preBreakoutCloses)) || 0;
  const shortSlope = sma3 - prevSma3;
  const waveRoom = recentHigh ? (latest.close - recentHigh) / recentHigh : 0;
  const accumulationCandidates = indicators.slice(-10, -1).map((row) => {
    const range = Math.max(row.high - row.low, row.close * 0.001);
    const upperWickRatio = (row.high - Math.max(row.open, row.close)) / range;
    const bodyRatio = Math.abs(row.close - row.open) / range;
    const forceScore = row.volumeRatio * (1 + upperWickRatio * 0.65 + bodyRatio * 0.25);
    return { ...row, upperWickRatio, bodyRatio, forceScore };
  });
  const baseCandle = [...accumulationCandidates].sort((a, b) => b.forceScore - a.forceScore)[0] || latest;
  const forceAveragePrice = (baseCandle.high + baseCandle.low + baseCandle.close) / 3;
  const forceSupport = Math.min(baseCandle.low, longLine);
  const forceResistance = Math.max(baseCandle.high, recentHigh);
  const forceAverageDistance = (latest.close - forceAveragePrice) / forceAveragePrice;
  const volumeDryUp = average(indicators.slice(-4, -1).map((row) => row.volumeRatio)) <= Math.max(0.96, baseCandle.volumeRatio * 0.72);
  const hasAccumulationCandle = baseCandle.volumeRatio >= 1.12 && baseTightness <= 0.032;
  const hasLongUpperWick = baseCandle.upperWickRatio >= 0.28 && baseCandle.volumeRatio >= 1.05;
  const forceAverageRetest = forceAverageDistance >= -0.025 && forceAverageDistance <= 0.08;
  const supportHolds = latest.close >= forceSupport;
  const boxBreakout = latest.close >= forceResistance * 0.995 && latest.volumeRatio >= 1.05;
  const nWaveReady = recoveryFromLow >= 0.035 && pullbackDepth <= 0.065 && latest.close >= sma3 && volumeDryUp;
  const riskLine = Math.min(forceSupport, longLine, latest.close - latest.atr * 0.85);
  const riskDistance = (latest.close - riskLine) / latest.close;
  const pullbackBuyLine = Math.max(riskLine, Math.min(latest.close, sma3));
  const breakoutBuyLine = recentHigh * 1.003;
  const buyLine =
    latest.close > recentHigh && latest.volumeRatio >= 1.05
      ? Math.max(latest.close * 0.985, pullbackBuyLine)
      : pullbackDepth <= 0.055
        ? pullbackBuyLine
        : Math.min(breakoutBuyLine, latest.close * 1.015);
  const buyLineType =
    latest.close > recentHigh && latest.volumeRatio >= 1.05
      ? "돌파 후 눌림"
      : pullbackDepth <= 0.055
        ? "3일선 눌림"
        : "전고점 돌파";

  const checks = [
    {
      label: "장기선 위 매수세 영역",
      body: `224일선 원칙을 현재 데이터의 장기선 프록시로 환산했습니다. 괴리 ${formatPercent(longDistance)}입니다.`,
      pass: longDistance >= 0,
      weight: 12,
    },
    {
      label: "거래량 동반 돌파",
      body: `거래량은 평균 대비 ${latest.volumeRatio.toFixed(1)}배이고 최근 고점 대비 ${formatPercent((latest.close - recentHigh) / recentHigh)} 위치입니다.`,
      pass: latest.close >= recentHigh * 0.995 && latest.volumeRatio >= 1.05,
      weight: 12,
    },
    {
      label: "3일선 언덕 회복",
      body: `현재가가 3일 평균 ${formatPrice(sma3, ticker)} ${latest.close >= sma3 ? "위" : "아래"}에 있고 3일 평균 기울기는 ${sma3 >= prevSma3 ? "상승" : "둔화"}입니다.`,
      pass: latest.close >= sma3 && sma3 >= prevSma3,
      weight: 10,
    },
    {
      label: "눌림목 리스크 보상",
      body: `최근 고점 대비 눌림은 ${formatPercent(pullbackDepth).replace("+", "")}, 리스크 라인까지 거리는 ${formatPercent(riskDistance).replace("+", "")}입니다.`,
      pass: pullbackDepth >= -0.005 && pullbackDepth <= 0.055 && riskDistance <= 0.08,
      weight: 10,
    },
    {
      label: "밥그릇 3번자리 후보",
      body: `저점 대비 회복률 ${formatPercent(recoveryFromLow)}와 장기선 회복 여부로 하락-횡보-회복 구조를 점검합니다.`,
      pass: recoveryFromLow >= 0.035 && longDistance >= -0.015,
      weight: 8,
    },
    {
      label: "세력 매집봉 후보",
      body: `후보 봉의 거래량은 평균 대비 ${baseCandle.volumeRatio.toFixed(1)}배입니다. 횡보 뒤 거래량 급증 봉을 매집 흔적 프록시로 봅니다.`,
      pass: hasAccumulationCandle,
      weight: 12,
    },
    {
      label: "긴 윗꼬리 테스트",
      body: `후보 봉 윗꼬리 비중은 ${(baseCandle.upperWickRatio * 100).toFixed(0)}%입니다. 매물대 테스트 또는 물량 흡수 흔적을 점검합니다.`,
      pass: hasLongUpperWick,
      weight: 8,
    },
    {
      label: "세력 평단 재접근",
      body: `추정 평단은 ${formatPrice(forceAveragePrice, ticker)}이고 현재 괴리는 ${formatPercent(forceAverageDistance)}입니다. 근접 시 분할 접근 후보입니다.`,
      pass: forceAverageRetest && supportHolds,
      weight: 10,
    },
    {
      label: "N자 파동 준비",
      body: `1차 회복 ${formatPercent(recoveryFromLow)}, 눌림 ${formatPercent(pullbackDepth).replace("+", "")}, 조정 거래량 감소 여부를 함께 봅니다.`,
      pass: nWaveReady,
      weight: 10,
    },
    {
      label: "박스권 상단 돌파",
      body: `저항 프록시는 ${formatPrice(forceResistance, ticker)}입니다. 횡보 상단을 거래량으로 넘는지 확인합니다.`,
      pass: boxBreakout,
      weight: 10,
    },
    {
      label: "손절선 선확정",
      body: `기준봉 저가·지지라인 기반 리스크 라인은 ${formatPrice(riskLine, ticker)}이며 이탈 시 분석 신뢰도가 크게 낮아집니다.`,
      pass: riskDistance > 0 && riskDistance <= 0.1,
      weight: 8,
    },
  ];

  const totalWeight = checks.reduce((sum, item) => sum + item.weight, 0);
  const score = Math.round((checks.reduce((sum, item) => sum + (item.pass ? item.weight : 0), 0) / totalWeight) * 100);
  const passed = checks.filter((item) => item.pass).length;
  const pattern =
    score >= 76
      ? "돌파·눌림 동시 충족"
      : score >= 58
        ? "관찰 가능한 눌림 후보"
        : score >= 38
          ? "조건 일부 충족"
          : "대기 구간";
  const signal = score >= 76 ? "강한 관찰" : score >= 58 ? "관찰" : score >= 38 ? "보류" : "대기";

  return {
    ticker,
    latest,
    checks,
    score,
    passed,
    pattern,
    signal,
    longDistance,
    pullbackDepth,
    riskLine,
    volumePower: latest.volumeRatio,
    indicators,
    closes,
    baseTightness,
    shortSlope,
    waveRoom,
    buyLine,
    buyLineType,
    baseCandle,
    forceAveragePrice,
    forceAverageDistance,
    forceSupport,
    forceResistance,
    volumeDryUp,
    hasAccumulationCandle,
    hasLongUpperWick,
    forceAverageRetest,
    supportHolds,
    boxBreakout,
    nWaveReady,
  };
}

function getDanteVideoRules(setup) {
  return [
    {
      title: "세력 매집봉 포착",
      state: setup.hasAccumulationCandle ? "충족" : "관찰",
      body: `하락·횡보 뒤 평균 ${setup.baseCandle.volumeRatio.toFixed(1)}배 거래량 봉을 찾습니다. 변동성 ${(setup.baseTightness * 100).toFixed(1)}%로 박스권 압축 여부도 함께 봅니다.`,
    },
    {
      title: "긴 윗꼬리 매물 테스트",
      state: setup.hasLongUpperWick ? "확인" : "약함",
      body: `후보 봉 윗꼬리 비중은 ${(setup.baseCandle.upperWickRatio * 100).toFixed(0)}%입니다. 단순 차익 실현보다 매물대 테스트와 물량 흡수 가능성을 분리해 봅니다.`,
    },
    {
      title: "세력 평단가 재접근",
      state: setup.forceAverageRetest ? "근접" : "이격",
      body: `추정 평단 ${formatPrice(setup.forceAveragePrice, setup.ticker)} 부근을 분할 매수 후보로 두고, 지지선 ${formatPrice(setup.forceSupport, setup.ticker)} 이탈 여부를 먼저 확인합니다.`,
    },
    {
      title: "N자 파동 전환",
      state: setup.nWaveReady ? "준비" : "대기",
      body: `1차 상승 뒤 조정 거래량이 줄고 3일선 위로 회복하는지 봅니다. 전고점 대비 위치는 ${formatPercent(setup.waveRoom)}입니다.`,
    },
    {
      title: "박스권 돌파 매매",
      state: setup.boxBreakout ? "돌파" : "관찰",
      body: `횡보 상단 ${formatPrice(setup.forceResistance, setup.ticker)} 돌파와 거래량 재증가가 동시에 나와야 추격보다 확인 매수 근거가 강해집니다.`,
    },
    {
      title: "손절 기준 선확정",
      state: setup.riskLine < setup.latest.close ? "확정" : "위험",
      body: `기준선은 ${formatPrice(setup.riskLine, setup.ticker)}입니다. 기준봉 저가, 지지라인 이탈, 거래량 실종 중 하나라도 나오면 관찰 등급을 낮춥니다.`,
    },
  ];
}

function getDantePlaybook(setup) {
  return [
    ["1. 매집봉 선별", `평균 ${setup.baseCandle.volumeRatio.toFixed(1)}배 거래량 봉과 긴 윗꼬리 여부를 먼저 확인합니다. 횡보 뒤 나온 봉일수록 우선순위를 높입니다.`],
    ["2. 세력 평단 대기", `추정 평단 ${formatPrice(setup.forceAveragePrice, setup.ticker)} 근처에서만 1차 분할을 검토하고, 이격이 크면 추격하지 않습니다.`],
    ["3. 눌림목 확인", `제안 매수라인은 ${formatPrice(setup.buyLine, setup.ticker)}이며 ${setup.buyLineType} 기준입니다. 상승 전환 후 첫 조정인지 확인합니다.`],
    ["4. N자 파동 확인", "1차 상승 거래량, 조정 거래량 감소, 전고점 재돌파 순서가 맞을 때만 2차 진입 근거를 강화합니다."],
    ["5. 박스권 상단 반응", `저항 프록시 ${formatPrice(setup.forceResistance, setup.ticker)} 돌파 시 거래량이 다시 붙는지 확인합니다.`],
    ["6. 손절선 준수", `현재 리스크 라인은 ${formatPrice(setup.riskLine, setup.ticker)}입니다. 기준봉 저가·지지라인·거래량 실종을 손절 조건으로 고정합니다.`],
  ];
}

function drawDanteChart(setup) {
  const ratio = window.devicePixelRatio || 1;
  const rect = danteCanvas.getBoundingClientRect();
  danteCanvas.width = Math.floor(rect.width * ratio);
  danteCanvas.height = Math.floor(rect.height * ratio);
  danteCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 28, right: 34, bottom: 64, left: 58 };
  const rows = setup.indicators.map((row, index) => ({
    ...row,
    close: setup.closes[index],
  }));
  const closes = rows.map((row) => row.close);
  const shortLine = movingAverage(closes, 3);
  const longLine = rows.map((row) => row.sma50);
  const breakoutLine = Math.max(...closes.slice(-6, -1));
  const lows = [...rows.map((row) => row.low), setup.riskLine, setup.buyLine, setup.forceAveragePrice];
  const highs = [...rows.map((row) => row.high), breakoutLine, setup.buyLine, setup.forceAveragePrice, ...shortLine, ...longLine];
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const span = max - min || 1;
  const xStep = (width - padding.left - padding.right) / (rows.length - 1 || 1);
  const x = (index) => padding.left + index * xStep;
  const y = (value) => height - padding.bottom - ((value - min) / span) * (height - padding.top - padding.bottom);

  danteCtx.clearRect(0, 0, width, height);
  danteCtx.font = "12px Inter, system-ui, sans-serif";
  danteCtx.strokeStyle = getThemeColor("--line");
  danteCtx.fillStyle = getThemeColor("--muted");
  danteCtx.lineWidth = 1;

  for (let tick = 0; tick <= 4; tick += 1) {
    const value = min + (span / 4) * tick;
    danteCtx.beginPath();
    danteCtx.moveTo(padding.left, y(value));
    danteCtx.lineTo(width - padding.right, y(value));
    danteCtx.stroke();
    danteCtx.fillText(Math.round(value).toLocaleString("ko-KR"), 12, y(value) + 4);
  }

  const dateTicks = [...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])];
  danteCtx.textAlign = "center";
  danteCtx.fillStyle = getThemeColor("--muted");
  dateTicks.forEach((index) => {
    const label = formatChartDate(rows[index].date);
    danteCtx.beginPath();
    danteCtx.moveTo(x(index), height - padding.bottom);
    danteCtx.lineTo(x(index), height - padding.bottom + 6);
    danteCtx.strokeStyle = getThemeColor("--line");
    danteCtx.stroke();
    danteCtx.fillText(label, x(index), height - padding.bottom + 22);
  });
  danteCtx.textAlign = "left";

  const candleWidth = Math.max(7, Math.min(18, xStep * 0.52));
  rows.forEach((row, index) => {
    const open = row.open;
    const close = row.close;
    const rising = close >= open;
    const candleX = x(index);
    danteCtx.strokeStyle = rising ? getThemeColor("--accent") : getThemeColor("--red");
    danteCtx.fillStyle = rising ? getThemeColor("--accent") : getThemeColor("--red");
    danteCtx.beginPath();
    danteCtx.moveTo(candleX, y(row.high));
    danteCtx.lineTo(candleX, y(row.low));
    danteCtx.stroke();
    const top = y(Math.max(open, close));
    const bodyHeight = Math.max(3, Math.abs(y(open) - y(close)));
    danteCtx.fillRect(candleX - candleWidth / 2, top, candleWidth, bodyHeight);
  });

  drawLine(shortLine, getThemeColor("--amber"), 2.5);
  drawLine(longLine, "#8b4aa0", 2.5);
  drawHorizontal(breakoutLine, getThemeColor("--success"), "돌파 기준");
  drawHorizontal(setup.forceAveragePrice, "#35a8a2", "세력 평단");
  drawHorizontal(setup.buyLine, "#00a6a6", "매수라인");
  drawHorizontal(setup.riskLine, getThemeColor("--red"), "손절 기준");

  danteCtx.fillStyle = getThemeColor("--muted");
  danteCtx.fillText("224일선은 장기선 프록시로 표시", padding.left, height - 16);

  function drawLine(values, color, lineWidth) {
    danteCtx.beginPath();
    values.forEach((value, index) => {
      if (index === 0) danteCtx.moveTo(x(index), y(value));
      else danteCtx.lineTo(x(index), y(value));
    });
    danteCtx.strokeStyle = color;
    danteCtx.lineWidth = lineWidth;
    danteCtx.lineJoin = "round";
    danteCtx.lineCap = "round";
    danteCtx.stroke();
  }

  function drawHorizontal(value, color, label) {
    danteCtx.setLineDash([7, 6]);
    danteCtx.beginPath();
    danteCtx.moveTo(padding.left, y(value));
    danteCtx.lineTo(width - padding.right, y(value));
    danteCtx.strokeStyle = color;
    danteCtx.lineWidth = 1.5;
    danteCtx.stroke();
    danteCtx.setLineDash([]);
    danteCtx.fillStyle = color;
    danteCtx.fillText(label, width - padding.right - 64, y(value) - 7);
  }
}

function renderDanteAnalysis() {
  const setup = getDanteSetup(elements.ticker.value);
  drawDanteChart(setup);
  elements.danteScore.textContent = setup.score;
  elements.dantePatternName.textContent = setup.pattern;
  elements.dantePatternCopy.textContent = `${setup.passed}/${setup.checks.length}개 조건 충족. 장기선·매집봉·세력 평단·N자 파동·손절 원칙을 보조 지표로 점수화했습니다.${apiConnectionState.ok === false ? " API 연결 실패 시 로컬 기준 차트로 해석합니다." : ""}`;
  elements.danteSignalPill.textContent = setup.signal;
  elements.danteSignalPill.style.background =
    setup.score >= 76 ? "var(--success)" : setup.score >= 58 ? "var(--accent)" : setup.score >= 38 ? "var(--amber)" : "var(--red)";
  elements.danteWatchPrice.textContent = formatPrice(setup.latest.close, setup.ticker);
  elements.danteRiskLine.textContent = `리스크 라인 ${formatPrice(setup.riskLine, setup.ticker)}`;
  elements.danteVolumePower.textContent = `${setup.volumePower.toFixed(1)}x`;
  elements.danteLongLineState.textContent = setup.longDistance >= 0 ? "장기선 상단" : "장기선 하단";
  elements.dantePullbackState.textContent =
    setup.pullbackDepth > 0.055 ? "깊은 눌림" : setup.pullbackDepth >= 0 ? "정상 눌림" : "고점 돌파";
  elements.danteBuyLine.textContent = formatPrice(setup.buyLine, setup.ticker);

  elements.danteChecklist.innerHTML = setup.checks
    .map(
      (item) => `
        <div class="dante-check ${item.pass ? "pass" : ""}">
          <strong>${item.pass ? "통과" : "대기"}</strong>
          <span>${item.label}</span>
          <p>${item.body}</p>
        </div>
      `,
    )
    .join("");

  elements.danteVideoRules.innerHTML = getDanteVideoRules(setup)
    .map(
      (rule) => `
        <div class="dante-rule-card">
          <header><strong>${rule.title}</strong><span>${rule.state}</span></header>
          <p>${rule.body}</p>
        </div>
      `,
    )
    .join("");

  elements.dantePlaybook.innerHTML = getDantePlaybook(setup)
    .map(([title, body]) => `<li><strong>${title}</strong><span>${body}</span></li>`)
    .join("");

  const rankings = watchlistSymbols.map(getDanteSetup).sort((a, b) => b.score - a.score);
  elements.danteRankingBody.innerHTML = rankings
    .map(
      (item) => `
        <tr>
          <td><strong>${getTickerName(item.ticker)}</strong></td>
          <td>${item.score}</td>
          <td>${item.pattern}</td>
          <td class="${item.longDistance >= 0 ? "positive" : "negative"}">${formatPercent(item.longDistance)}</td>
          <td>${item.volumePower.toFixed(1)}x</td>
          <td>${formatPrice(item.riskLine, item.ticker)}</td>
        </tr>
      `,
    )
    .join("");
}

function updateRecommendations(result) {
  const items = [];
  if (result.score >= 68) {
    items.push(["목표 비중을 소폭 확대하되, 예측 종가 기준 분할 매수 구간을 유지합니다.", ""]);
  } else if (result.score <= 42) {
    items.push(["신규 진입보다 현금 비중과 손절 기준을 먼저 확정하는 편이 적합합니다.", "danger"]);
  } else {
    items.push(["방향성이 강하지 않아 관망 또는 기존 포지션 유지가 우선입니다.", "warning"]);
  }

  items.push([`예상 하방 리스크가 ${(result.risk * 100).toFixed(1)}%이므로 손절선은 최근 종가 대비 이보다 좁게 두지 않습니다.`, result.risk > 0.04 ? "warning" : ""]);
  items.push([`신뢰도 ${Math.round(result.confidence)}% 기준으로 단일 모델 판단보다 실적 발표와 거래량 확인을 병행합니다.`, ""]);

  elements.recommendations.innerHTML = items
    .map(([text, tone]) => `<li class="${tone}">${text}</li>`)
    .join("");
}

function renderWatchlist() {
  watchlistSymbols.forEach(ensureSymbolData);
  const rows = watchlistSymbols
    .map((ticker) => {
      const prices = samples[ticker];
      const result = forecast(prices);
      return { ticker, prices, result, signal: getSignal(result.score) };
    });

  elements.watchlistBody.innerHTML = rows
    .map(
      ({ ticker, prices, result, signal }) => `
        <tr data-ticker-row="${ticker}">
          <td class="select-column">
            <input type="checkbox" data-watchlist-select="${ticker}" aria-label="${getTickerName(ticker)} 선택" />
          </td>
          <td>
            <span class="ticker-cell">
              <strong>${getTickerName(ticker)}</strong>
            </span>
          </td>
          <td>${formatPrice(getCurrentPrice(ticker), ticker)}</td>
          <td class="${result.expectedReturn >= 0 ? "positive" : "negative"}">${formatPercent(result.expectedReturn)}</td>
          <td class="negative">${formatPercent(-result.risk)}</td>
          <td>${Math.round(result.confidence)}%</td>
          <td><strong>${result.score}</strong></td>
          <td><span class="signal-badge ${signal.tone}">${signal.label}</span></td>
          <td>
            <button class="table-action danger" type="button" data-remove-watchlist="${ticker}" aria-label="${getTickerName(ticker)} 관심종목 삭제">삭제</button>
          </td>
        </tr>
      `,
    )
    .join("") || `<tr><td colspan="9">등록된 관심종목이 없습니다. 종목 추가 버튼으로 새 종목을 등록하세요.</td></tr>`;
  elements.selectAllWatchlist.checked = false;
  elements.selectAllWatchlist.indeterminate = false;
  elements.deleteSelectedWatchlist.disabled = true;
}

function sortWatchlistByScore() {
  watchlistSymbols.forEach(ensureSymbolData);
  watchlistSymbols = [...watchlistSymbols].sort((left, right) => {
    const leftScore = forecast(samples[left]).score;
    const rightScore = forecast(samples[right]).score;
    return rightScore - leftScore;
  });
  watchlistSortedByScore = true;
  elements.sortWatchlist.textContent = "점수순 정렬됨";
  renderTickerOptions();
  renderWatchlist();
  saveUserPortfolio();
}

function syncWatchlistSelectionState() {
  const checkboxes = [...elements.watchlistBody.querySelectorAll("[data-watchlist-select]")];
  const selectedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
  elements.deleteSelectedWatchlist.disabled = selectedCount === 0;
  elements.selectAllWatchlist.checked = checkboxes.length > 0 && selectedCount === checkboxes.length;
  elements.selectAllWatchlist.indeterminate = selectedCount > 0 && selectedCount < checkboxes.length;
}

function removeWatchlistSymbols(symbols) {
  if (!symbols.length) return;
  const nextSymbols = watchlistSymbols.filter((item) => !symbols.includes(item));
  watchlistSymbols = nextSymbols;
  compareSymbols = compareSymbols.filter((item) => !symbols.includes(item));
  if (symbols.includes(elements.ticker.value) && watchlistSymbols.length) elements.ticker.value = watchlistSymbols[0];
  if (!watchlistSymbols.length) elements.ticker.value = "";
  saveUserPortfolio();
  render();
}

const koreanInitials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function normalizeSymbolSearch(value) {
  return value.toString().toLowerCase().replace(/\s+/g, "");
}

function getKoreanInitials(value) {
  return [...value.toString()]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < 0xac00 || code > 0xd7a3) return "";
      return koreanInitials[Math.floor((code - 0xac00) / 588)];
    })
    .join("");
}

function getMixedInitials(value) {
  return [...value.toString()]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) return koreanInitials[Math.floor((code - 0xac00) / 588)];
      return /[a-z0-9]/i.test(char) ? char.toLowerCase() : "";
    })
    .join("");
}

function getSymbolSearchTokens(symbol) {
  const values = [symbol.ticker, symbol.name, ...(symbol.aliases || [])];
  return values.flatMap((value) => {
    const normalized = normalizeSymbolSearch(value);
    const initials = getKoreanInitials(value);
    const mixedInitials = getMixedInitials(value);
    return [...new Set([normalized, initials, mixedInitials].filter(Boolean))];
  });
}

function getKnownSymbols() {
  const storedSymbols = Object.values(getStoredSymbolMeta());
  return [...remoteSymbolResults, ...storedSymbols, ...staticSymbolCatalog, ...symbolCatalog].filter(
    (symbol, index, all) => all.findIndex((item) => item.ticker === symbol.ticker) === index,
  );
}

function getKnownSymbol(ticker) {
  return getKnownSymbols().find((symbol) => symbol.ticker === ticker);
}

function getNewsCoMentionGroup(ticker) {
  const group =
    newsCoMentionPeerGroups.find((item) => item.tickers.includes(ticker)) ||
    newsCoMentionPeerGroups.find((item) => {
      const name = getTickerName(ticker);
      return item.tickers.some((peerTicker) => {
        const peerName = getTickerName(peerTicker);
        return name && peerName && (name.includes(peerName) || peerName.includes(name));
      });
    });
  const fallback = isKoreanTicker(ticker)
    ? newsCoMentionPeerGroups.find((item) => item.label.includes("국내 반도체"))
    : newsCoMentionPeerGroups.find((item) => item.label.includes("빅테크"));
  return group || fallback;
}

function getPeerComparisonSymbols(ticker) {
  if (!ticker) return [];
  const group = getNewsCoMentionGroup(ticker);
  const peers = [ticker, ...(group?.tickers || [])].filter((item, index, all) => item && all.indexOf(item) === index);
  peers.slice(0, 5).forEach(ensureSymbolData);
  return peers.slice(0, 5);
}

function rankSymbolMatch(symbol, query) {
  if (!query) return watchlistSymbols.includes(symbol.ticker) ? 5 : 0;
  const tokens = getSymbolSearchTokens(symbol);
  if (tokens.some((token) => token === query)) return 0;
  if (tokens.some((token) => token.startsWith(query))) return 1;
  if (tokens.some((token) => token.includes(query))) return 2;
  return 99;
}

function updateSelectedSymbolAddState() {
  const selectedSymbol = getKnownSymbol(selectedSymbolToAdd);
  const alreadyAdded = selectedSymbol ? watchlistSymbols.includes(selectedSymbol.ticker) : false;
  elements.confirmSymbol.disabled = !selectedSymbol || alreadyAdded;
  elements.confirmSymbol.textContent = selectedSymbol ? `${selectedSymbol.name} 등록` : "선택 종목 등록";
}

async function fetchRemoteSymbolResults(query, market) {
  try {
    const response = await fetchApi(`/api/symbol-search?q=${encodeURIComponent(query)}&market=${encodeURIComponent(market)}`, { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload.results) ? payload.results : [];
  } catch {
    return [];
  }
}

async function loadStaticSymbolCatalog() {
  try {
    const response = await fetch("./assets/symbols.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload)) return;
    staticSymbolCatalog = payload.filter((symbol) => symbol?.ticker && symbol?.name && symbol?.market);
    hydratePortfolioSymbolNames();
    renderTickerOptions();
    if (!elements.symbolModal.hidden) renderSymbolResults();
  } catch {
    staticSymbolCatalog = [];
  }
}

function getRankedSymbolResults(query, market) {
  return getKnownSymbols()
    .map((symbol, order) => ({ ...symbol, order, rank: rankSymbolMatch(symbol, query) }))
    .filter((symbol) => {
      const marketMatches = market === "all" || symbol.market === market;
      return marketMatches && symbol.rank < 99;
    })
    .sort((left, right) => left.rank - right.rank || left.order - right.order)
    .slice(0, 12);
}

function renderSymbolResultList(results) {
  elements.symbolResults.innerHTML = results.length
    ? results
        .map((symbol) => {
          const isAdded = watchlistSymbols.includes(symbol.ticker);
          const isSelected = selectedSymbolToAdd === symbol.ticker;
          return `
            <button class="symbol-option ${isSelected ? "selected" : ""}" type="button" data-symbol="${symbol.ticker}" aria-pressed="${isSelected ? "true" : "false"}" ${isAdded ? "disabled" : ""}>
              <span class="symbol-main">
                <strong>${symbol.name}</strong>
              </span>
              <span class="symbol-market">${isAdded ? "추가됨" : symbol.market === "global" ? "해외" : "국내"}</span>
            </button>
          `;
        })
        .join("")
    : `<div class="empty-state">검색 결과가 없습니다.</div>`;
}

async function renderSymbolResults() {
  const market = document.querySelector('input[name="market"]:checked').value;
  const query = normalizeSymbolSearch(elements.symbolSearch.value);
  if (!query) {
    remoteSymbolResults = [];
    elements.symbolResults.innerHTML = `<div class="empty-state">검색어를 입력하면 관련 종목이 표시됩니다.</div>`;
    updateSelectedSymbolAddState();
    return;
  }
  const requestId = ++symbolSearchRequestId;
  remoteSymbolResults = [];
  const localResults = getRankedSymbolResults(query, market);
  if (localResults.length) renderSymbolResultList(localResults);
  else elements.symbolResults.innerHTML = `<div class="empty-state">검색 중입니다.</div>`;
  const remoteResults = await fetchRemoteSymbolResults(elements.symbolSearch.value.trim(), market);
  if (requestId !== symbolSearchRequestId) return;
  remoteSymbolResults = remoteResults;
  renderSymbolResultList(getRankedSymbolResults(query, market));
  updateSelectedSymbolAddState();
}

function collapseSymbolResultsAfterSelect() {
  const symbol = getKnownSymbol(selectedSymbolToAdd);
  if (!symbol) {
    updateSelectedSymbolAddState();
    return;
  }
  elements.symbolResults.innerHTML = `
    <button class="symbol-option selected" type="button" data-symbol="${symbol.ticker}" aria-pressed="true">
      <span class="symbol-main">
        <strong>${symbol.name}</strong>
      </span>
      <span class="symbol-market">선택됨</span>
    </button>
  `;
  updateSelectedSymbolAddState();
}

function openSymbolModal() {
  elements.symbolModal.hidden = false;
  elements.symbolSearch.value = "";
  selectedSymbolToAdd = null;
  elements.marketRadios.forEach((radio) => {
    radio.checked = radio.value === "all";
  });
  renderSymbolResults();
  elements.symbolSearch.focus();
}

function closeSymbolModal() {
  elements.symbolModal.hidden = true;
  selectedSymbolToAdd = null;
  updateSelectedSymbolAddState();
}

function addSelectedSymbolToWatchlist() {
  if (!selectedSymbolToAdd || watchlistSymbols.includes(selectedSymbolToAdd)) return;
  registerKnownSymbol(getKnownSymbol(selectedSymbolToAdd));
  ensureSymbolData(selectedSymbolToAdd);
  watchlistSymbols = [selectedSymbolToAdd, ...watchlistSymbols.filter((item) => item !== selectedSymbolToAdd)];
  compareSymbols = [selectedSymbolToAdd, ...compareSymbols.filter((item) => item !== selectedSymbolToAdd)].slice(0, 5);
  saveUserPortfolio();
  renderTickerOptions(selectedSymbolToAdd);
  elements.ticker.value = selectedSymbolToAdd;
  fetchSymbolMarketData(selectedSymbolToAdd);
  if (watchlistSortedByScore) sortWatchlistByScore();
  else renderWatchlist();
  renderModelAnalysis();
  render();
  closeSymbolModal();
}

function formatAdminDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function renderAdminUsers() {
  if (!elements.adminUserBody) return;
  if (!isAdminUser()) {
    elements.adminUserBody.innerHTML = `<tr><td colspan="6">관리자 권한이 필요합니다.</td></tr>`;
    return;
  }
  const users = getStoredUsers();
  const rows = Object.entries(users).sort(([leftId], [rightId]) => leftId.localeCompare(rightId));
  elements.adminUserBody.innerHTML = rows.length
    ? rows
        .map(([userId, user]) => {
          const isAdmin = userId === ADMIN_USER_ID;
          const blocked = Boolean(user.blocked);
          return `
            <tr data-admin-user="${userId}">
              <td><strong>${userId}</strong></td>
              <td>${isAdmin ? "관리자" : "사용자"}</td>
              <td><span class="signal-badge ${blocked ? "defensive" : "neutral"}">${blocked ? "차단" : "정상"}</span></td>
              <td>${Array.isArray(user.watchlist) ? user.watchlist.length : 0}</td>
              <td>${formatAdminDate(user.createdAt)}</td>
              <td>
                <button class="table-action" type="button" data-admin-block="${userId}" ${isAdmin ? "disabled" : ""}>${blocked ? "차단 해제" : "차단"}</button>
                <button class="table-action danger" type="button" data-admin-delete="${userId}" ${isAdmin ? "disabled" : ""}>삭제</button>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="6">가입자가 없습니다.</td></tr>`;
}

function toggleUserBlock(userId) {
  if (!isAdminUser() || userId === ADMIN_USER_ID) return;
  const users = getStoredUsers();
  if (!users[userId]) return;
  users[userId] = { ...users[userId], blocked: !users[userId].blocked, updatedAt: new Date().toISOString() };
  saveStoredUsers(users);
  renderAdminUsers();
}

function deleteUser(userId) {
  if (!isAdminUser() || userId === ADMIN_USER_ID) return;
  const users = getStoredUsers();
  delete users[userId];
  saveStoredUsers(users);
  renderAdminUsers();
}

function maxDrawdown(prices) {
  let peak = prices[0];
  let worst = 0;
  prices.forEach((price) => {
    peak = Math.max(peak, price);
    worst = Math.min(worst, (price - peak) / peak);
  });
  return worst;
}

function percentile(values, percentileValue) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((percentileValue / 100) * sorted.length)));
  return sorted[index];
}

function recoveryReturn(drawdown) {
  const loss = Math.abs(Math.min(0, drawdown));
  return loss >= 1 ? Infinity : loss / (1 - loss);
}

function renderRisk(prices, result) {
  const ticker = elements.ticker.value;
  const returns = getReturns(prices);
  const dailyVol = standardDeviation(returns);
  const drawdown = maxDrawdown(prices);
  const valueAtRisk = percentile(returns, 5);
  const var99 = percentile(returns, 1);
  const tailLosses = returns.filter((value) => value <= valueAtRisk);
  const cvar95 = tailLosses.length ? average(tailLosses) : valueAtRisk;
  const downsideReturns = returns.filter((value) => value < 0);
  const downsideVol = downsideReturns.length ? standardDeviation(downsideReturns) * Math.sqrt(252) : 0;
  const annualReturn = average(returns) * 252;
  const annualVol = dailyVol * Math.sqrt(252);
  const sharpe = annualVol ? annualReturn / annualVol : 0;
  const sortino = downsideVol ? annualReturn / downsideVol : 0;
  const currentPrice = getCurrentPrice(ticker);
  const latestIndicator = calculateAdvancedIndicators(ticker, getAnalysisPrices(ticker)).at(-1);
  const stopPrice = Math.max(0, currentPrice - latestIndicator.atr * 1.5);
  const tradeRisk = Math.max(0.005, (currentPrice - stopPrice) / currentPrice);
  const positionWeight = Math.min(0.35, 0.02 / tradeRisk);
  const winProbability = clamp(result.confidence / 100, 0.35, 0.68);
  const rewardRisk = Math.max(0.25, Math.abs(result.expectedReturn) / Math.max(result.risk, 0.005));
  const fullKelly = clamp(winProbability - (1 - winProbability) / rewardRisk, 0, 0.25);
  const quarterKelly = fullKelly / 4;
  const estimatedFairValue = currentPrice * (1 + result.expectedReturn);
  const safetyMargin = estimatedFairValue > 0 ? (estimatedFairValue - currentPrice) / estimatedFairValue : 0;
  const profile = companyProfiles[ticker];
  const fundamental = fundamentals[ticker];
  const returnScore = clamp(45 + result.expectedReturn * 450, 0, 92);
  const safetyScore = clamp(48 + safetyMargin * 360, 0, 92);
  const sharpeScore = clamp(42 + Math.tanh(sharpe / 2.5) * 32, 0, 86);
  const sortinoScore = clamp(42 + Math.tanh(sortino / 3) * 24, 0, 78);
  const tailRiskScore = clamp(95 - Math.abs(cvar95) * 2200 - profile.beta * 4, 0, 100);
  const drawdownScore = clamp(95 - Math.abs(drawdown) * 780 - profile.beta * 5, 0, 100);
  const volatilityScore = clamp(96 - dailyVol * 3200 - profile.beta * 8, 0, 100);
  const betaScore = clamp(100 - Math.max(0, profile.beta - 0.75) * 42, 30, 100);
  const qualityScore = clamp(
    fundamental.stability * 0.38 +
      fundamental.profitability * 0.28 +
      fundamental.liquidity * 0.2 +
      fundamental.growth * 0.14 -
      profile.beta * 10,
    0,
    100,
  );
  const valuationScore = clamp(
    82 - fundamental.per * 7.5 - fundamental.pbr * 4.5 + fundamental.roe * 5 + fundamental.eps * 3 + fundamental.bps * 2,
    0,
    100,
  );
  const flowScore = clamp(50 + ((fundamental.foreignFlow + fundamental.institutionFlow) / 1500000) * 18, 20, 92);
  const riskOpinionScore = Math.round(
    returnScore * 0.12 +
      safetyScore * 0.08 +
      sharpeScore * 0.1 +
      sortinoScore * 0.05 +
      tailRiskScore * 0.13 +
      drawdownScore * 0.11 +
      volatilityScore * 0.1 +
      betaScore * 0.1 +
      qualityScore * 0.1 +
      valuationScore * 0.07 +
      flowScore * 0.04,
  );
  const riskOpinion =
    riskOpinionScore >= 82
      ? "비중 확대"
      : riskOpinionScore >= 66
        ? "선별 매수"
        : riskOpinionScore >= 48
          ? "관망"
          : "비중 축소";
  const opinionTone = riskOpinionScore >= 66 ? "positive" : riskOpinionScore >= 48 ? "neutral" : "negative";
  const opinionReasons = [
    `예상 수익률 ${formatPercent(result.expectedReturn)}, 안전마진 ${formatPercent(safetyMargin)}입니다.`,
    `CVaR 95%는 ${formatPercent(cvar95)}로 최악 구간 평균 손실을 나타냅니다.`,
    `Sharpe ${sharpe.toFixed(2)}, Sortino ${sortino.toFixed(2)}, Beta ${profile.beta.toFixed(2)}를 반영했습니다.`,
    `재무 품질 ${Math.round(qualityScore)}점, 밸류에이션 ${Math.round(valuationScore)}점, 수급 ${Math.round(flowScore)}점을 함께 반영했습니다.`,
    `2% Rule 기준 권장 비중은 ${formatPercent(positionWeight).replace("+", "")}입니다.`,
  ];
  const grade = result.risk > 0.055 ? "높음" : result.risk > 0.028 ? "중립" : "낮음";

  elements.dailyVol.textContent = formatPercent(dailyVol).replace("+", "");
  elements.drawdown.textContent = formatPercent(drawdown);
  elements.valueAtRisk.textContent = formatPercent(valueAtRisk);
  elements.riskGrade.textContent = grade;
  elements.var99.textContent = formatPercent(var99);
  elements.cvar95.textContent = formatPercent(cvar95);
  elements.recovery.textContent = Number.isFinite(recoveryReturn(drawdown)) ? formatPercent(recoveryReturn(drawdown)) : "불가";
  elements.riskSharpe.textContent = sharpe.toFixed(2);
  elements.sortino.textContent = sortino.toFixed(2);
  elements.downsideVol.textContent = formatPercent(downsideVol).replace("+", "");
  elements.stopPrice.textContent = formatPrice(stopPrice, ticker);
  elements.tradeRisk.textContent = formatPercent(-tradeRisk);
  elements.positionWeight.textContent = formatPercent(positionWeight).replace("+", "");
  elements.kellyWeight.textContent = formatPercent(quarterKelly).replace("+", "");
  elements.safetyMargin.textContent = formatPercent(safetyMargin);
  elements.safetyMargin.className = safetyMargin >= 0 ? "positive" : "negative";
  elements.valuationRiskCopy.textContent =
    safetyMargin >= 0 ? "예상가가 현재가보다 높아 완충 폭이 있습니다." : "예상가가 현재가보다 낮아 안전마진이 부족합니다.";
  elements.riskOpinionScore.textContent = riskOpinionScore;
  elements.riskOpinionLabel.textContent = riskOpinion;
  elements.riskOpinionLabel.className = opinionTone;
  elements.riskOpinionCopy.textContent =
    riskOpinion === "비중 확대"
      ? "위험 대비 보상이 우세합니다. 다만 손절가와 포지션 한도를 함께 적용하는 조건부 의견입니다."
      : riskOpinion === "선별 매수"
        ? "보상은 존재하지만 손실 구간도 의미 있습니다. 분할 진입과 비중 제한이 적합합니다."
        : riskOpinion === "관망"
          ? "위험과 보상이 균형권입니다. 추가 확인 신호 전까지 무리한 진입은 피합니다."
          : "손실 위험이 기대 보상보다 큽니다. 신규 진입보다 방어와 비중 축소가 우선입니다.";
  elements.riskOpinionReasons.innerHTML = opinionReasons.map((reason) => `<li>${reason}</li>`).join("");

  const stressCases = [
    ["시장 -5%", result.expectedReturn - 0.05],
    ["금리 급등", result.expectedReturn - 0.035],
    ["실적 하향", result.expectedReturn - 0.045],
    ["심리 회복", result.expectedReturn + 0.03],
  ];

  elements.stressList.innerHTML = stressCases
    .map(([label, value]) => {
      const width = Math.min(100, Math.max(8, Math.abs(value) * 900));
      const tone = value < -0.04 ? "danger" : value < 0 ? "warning" : "";
      return `
        <div class="stress-row ${tone}">
          <span>${label}</span>
          <div class="stress-bar"><i style="width: ${width}%"></i></div>
          <strong class="${value >= 0 ? "positive" : "negative"}">${formatPercent(value)}</strong>
        </div>
      `;
    })
    .join("");
}

function clearCanvas(canvasElement, context, message) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvasElement.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  canvasElement.width = Math.floor(rect.width * ratio);
  canvasElement.height = Math.floor(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);
  context.fillStyle = getThemeColor("--muted");
  context.font = "13px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(message, rect.width / 2, rect.height / 2);
  context.textAlign = "left";
}

function renderEmptyDashboard() {
  updateMarketStrip();
  updateDataStatusBar("");
  renderWatchlist();
  clearCanvas(canvas, ctx, "관심종목/등록에서 종목을 추가하면 예측 그래프가 표시됩니다.");
  clearCanvas(radarCanvas, radarCtx, "종목 등록 후 재무 레이더가 표시됩니다.");
  clearCanvas(compareCanvas, compareCtx, "종목 등록 후 비교 차트가 표시됩니다.");
  clearCanvas(technicalCanvas, technicalCtx, "종목 등록 후 기술 분석 차트가 표시됩니다.");
  clearCanvas(danteCanvas, danteCtx, "종목 등록 후 단테 기법 차트가 표시됩니다.");
  clearCanvas(smcCanvas, smcCtx, "종목 등록 후 SMC 차트 분석이 표시됩니다.");
  clearCanvas(ictCanvas, ictCtx, "종목 등록 후 ICT 차트 분석이 표시됩니다.");

  elements.chartTitle.textContent = "종목 등록 대기";
  elements.signalPill.textContent = "대기";
  elements.signalPill.style.background = "var(--muted)";
  elements.score.textContent = "0";
  elements.scoreCopy.textContent = "관심종목/등록 메뉴에서 종목을 추가하면 분석을 시작합니다.";
  elements.dashboardOpinionLabel.textContent = "대기";
  elements.dashboardOpinionLabel.className = "";
  elements.dashboardOpinionLevel.dataset.level = "0";
  [elements.dashboardTargetPrice, elements.dashboardStopPrice, elements.dashboardWatchPrice].forEach((item) => {
    item.textContent = "-";
  });
  elements.dashboardOpinionCopy.textContent = "종목 등록 후 5단계 투자의견을 계산합니다.";
  elements.returnMetric.textContent = "-";
  elements.riskMetric.textContent = "-";
  elements.confidenceMetric.textContent = "-";
  elements.livePrice.textContent = "-";
  elements.livePriceChange.textContent = "종목 미등록";
  elements.livePriceChange.className = "";
  elements.livePriceSource.textContent = "-";
  elements.livePriceUpdated.textContent = "종목 등록 후 갱신";
  elements.volatility.textContent = "-";
  elements.regime.textContent = "-";
  elements.recommendations.innerHTML = `<li>관심종목/등록에서 분석할 종목을 먼저 추가하세요.</li>`;
  elements.weatherGrid.innerHTML = `<div class="empty-state">종목 등록 후 투자 지표 날씨가 표시됩니다.</div>`;
  elements.issueList.innerHTML = `<li><strong>종목 등록 대기</strong><span>분석할 종목을 등록하면 수급, 재무, 예측 연결 이슈가 표시됩니다.</span></li>`;
  elements.newsList.innerHTML = `<li><span>종목 등록 후 관련 뉴스 헤드라인이 표시됩니다.</span></li>`;

  elements.compareTickerControls.innerHTML = "";
  elements.compareLegend.innerHTML = "";
  elements.topModelPick.textContent = "-";
  elements.topModelCopy.textContent = "종목을 등록하면 모델 조합과 기술 지표를 기준으로 추천을 계산합니다.";
  elements.modelAgreement.textContent = "-";
  elements.trendStrength.textContent = "-";
  elements.rsiState.textContent = "-";
  elements.modelCards.innerHTML = `<div class="empty-state">종목 등록 후 모델별 예측이 표시됩니다.</div>`;
  elements.modelRankingBody.innerHTML = `<tr><td colspan="6">등록된 관심종목이 없습니다.</td></tr>`;

  elements.aiSignalPill.textContent = "대기";
  elements.aiSignalPill.style.background = "var(--muted)";
  [elements.aiCurrentPrice, elements.aiVolumeRatio, elements.aiRsiValue, elements.aiSmaDistance, elements.aiCapGrade].forEach((item) => {
    item.textContent = "-";
  });
  [elements.aiPriceChange, elements.aiRsiLabel, elements.aiSmaLabel, elements.aiBetaLabel].forEach((item) => {
    item.textContent = "-";
    item.className = "";
  });
  elements.aiPredictionPrice.textContent = "-";
  elements.aiPredictionCopy.textContent = "종목 등록 후 기술지표 기반 예측을 계산합니다.";
  elements.aiOpinionLabel.textContent = "대기";
  elements.aiOpinionLabel.className = "";
  elements.aiOpinionLevel.dataset.level = "0";
  [elements.aiTargetPrice, elements.aiStopPrice, elements.aiWatchPrice].forEach((item) => {
    item.textContent = "-";
  });
  elements.aiOpinionCopy.textContent = "종목 등록 후 다음 거래일 투자의견을 계산합니다.";
  elements.aiConfidence.textContent = "-";
  elements.aiVolatility.textContent = "-";
  elements.aiSharpe.textContent = "-";
  elements.aiInsights.innerHTML = `<li class="neutral">분석할 종목을 등록하면 AI 인사이트가 표시됩니다.</li>`;
  elements.featureImportance.innerHTML = `<div class="empty-state">종목 등록 후 특징 중요도가 표시됩니다.</div>`;
  elements.companyInfo.innerHTML = `<div class="empty-state">종목 등록 후 회사 정보가 표시됩니다.</div>`;
  elements.technicalDataBody.innerHTML = `<tr><td colspan="7">등록된 종목이 없습니다.</td></tr>`;

  [elements.dailyVol, elements.drawdown, elements.valueAtRisk, elements.riskGrade, elements.var99, elements.cvar95, elements.recovery, elements.riskSharpe, elements.sortino, elements.downsideVol, elements.stopPrice, elements.tradeRisk, elements.positionWeight, elements.kellyWeight, elements.safetyMargin].forEach((item) => {
    item.textContent = "-";
  });
  elements.valuationRiskCopy.textContent = "종목 등록 후 안전마진을 계산합니다.";
  elements.riskOpinionScore.textContent = "0";
  elements.riskOpinionLabel.textContent = "분석 대기";
  elements.riskOpinionLabel.className = "";
  elements.riskOpinionCopy.textContent = "종목 등록 후 리스크 지표를 종합해 투자의견을 계산합니다.";
  elements.riskOpinionReasons.innerHTML = `<li>등록된 관심종목이 없습니다.</li>`;
  elements.stressList.innerHTML = `<div class="empty-state">종목 등록 후 스트레스 테스트가 표시됩니다.</div>`;

  elements.danteSignalPill.textContent = "대기";
  elements.danteSignalPill.style.background = "var(--muted)";
  elements.danteScore.textContent = "0";
  elements.dantePatternName.textContent = "종목 등록 대기";
  elements.dantePatternCopy.textContent = "종목을 등록하면 단테식 조건을 점수화합니다.";
  elements.danteWatchPrice.textContent = "-";
  elements.danteRiskLine.textContent = "종목 등록 후 손절 기준을 계산합니다.";
  elements.danteVolumePower.textContent = "-";
  elements.danteLongLineState.textContent = "-";
  elements.dantePullbackState.textContent = "-";
  elements.danteBuyLine.textContent = "-";
  elements.danteChecklist.innerHTML = `<div class="empty-state">종목 등록 후 체크리스트가 표시됩니다.</div>`;
  elements.danteRankingBody.innerHTML = `<tr><td colspan="6">등록된 관심종목이 없습니다.</td></tr>`;
  elements.danteVideoRules.innerHTML = `<div class="empty-state">종목 등록 후 보완 규칙이 표시됩니다.</div>`;
  elements.dantePlaybook.innerHTML = `<li><strong>종목 등록</strong><span>관심종목/등록에서 분석할 종목을 추가하세요.</span></li>`;
  elements.smcSignalPill.textContent = "대기";
  elements.smcSignalPill.style.background = "var(--muted)";
  elements.smcScore.textContent = "0";
  elements.smcSetupName.textContent = "종목 등록 대기";
  elements.smcSetupCopy.textContent = "종목을 등록하면 SMC 조건을 점수화합니다.";
  [elements.smcStructure, elements.smcSweep, elements.smcFvg, elements.smcOrderBlock].forEach((item) => {
    item.textContent = "-";
  });
  elements.smcChecklist.innerHTML = `<div class="empty-state">종목 등록 후 SMC 체크리스트가 표시됩니다.</div>`;
  elements.smcInterpretation.innerHTML = `<li><strong>종목 등록</strong><span>관심종목/등록에서 분석할 종목을 추가하세요.</span></li>`;
  elements.ictSignalPill.textContent = "대기";
  elements.ictSignalPill.style.background = "var(--muted)";
  elements.ictScore.textContent = "0";
  elements.ictSetupName.textContent = "종목 등록 대기";
  elements.ictSetupCopy.textContent = "종목을 등록하면 ICT 조건을 점수화합니다.";
  [elements.ictDelivery, elements.ictOte, elements.ictLiquidity, elements.ictEntry].forEach((item) => {
    item.textContent = "-";
  });
  elements.ictChecklist.innerHTML = `<div class="empty-state">종목 등록 후 ICT 체크리스트가 표시됩니다.</div>`;
  elements.ictInterpretation.innerHTML = `<li><strong>종목 등록</strong><span>관심종목/등록에서 분석할 종목을 추가하세요.</span></li>`;
  renderAdminUsers();
}

function render() {
  renderTickerOptions();
  const selectedTicker = elements.ticker.value;
  if (!selectedTicker) {
    renderEmptyDashboard();
    return;
  }
  const prices = getAnalysisPrices(selectedTicker);
  const result = forecast(prices);
  const horizon = Number(elements.horizon.value);
  const currentPrice = prices.at(-1);
  const dashboardOpinion = buildOpinionFromForecast({
    currentPrice,
    targetPrice: result.projected.at(-1),
    expectedReturn: result.expectedReturn,
    risk: result.risk,
    confidence: result.confidence,
  });

  elements.chartTitle.textContent = `${getTickerName(selectedTicker)} ${horizon}일 예측`;
  elements.score.textContent = result.score;
  elements.returnMetric.textContent = formatPercent(result.expectedReturn);
  elements.riskMetric.textContent = formatPercent(-result.risk);
  elements.confidenceMetric.textContent = `${Math.round(result.confidence)}%`;
  updateLivePricePanel(selectedTicker);
  elements.volatility.textContent = result.volatility > 0.025 ? "높음" : result.volatility > 0.012 ? "중립" : "낮음";
  elements.regime.textContent = result.expectedReturn > 0.03 ? "상승 확장" : result.expectedReturn < -0.01 ? "약세 전환" : "상승 둔화";

  if (result.score >= 68) {
    elements.signalPill.textContent = "매수 우위";
    elements.signalPill.style.background = "var(--accent)";
    elements.scoreCopy.textContent = "상승 확률이 우세하지만 변동성 관리가 필요합니다.";
  } else if (result.score <= 42) {
    elements.signalPill.textContent = "방어 우위";
    elements.signalPill.style.background = "var(--red)";
    elements.scoreCopy.textContent = "예측 수익률보다 리스크가 커 방어적인 접근이 필요합니다.";
  } else {
    elements.signalPill.textContent = "중립";
    elements.signalPill.style.background = "var(--amber)";
    elements.scoreCopy.textContent = "추세 확인 전까지 관망 신호가 강합니다.";
  }
  if (apiConnectionState.ok === false && !getLiveQuote(selectedTicker) && !ohlcvHistory[selectedTicker]?.length) {
    elements.scoreCopy.textContent += " 현재 웹 배포 환경에서는 API 연결 실패로 로컬 기준 데이터를 사용합니다.";
  }

  updateOpinionCard(
    "dashboard",
    dashboardOpinion,
    selectedTicker,
    `${horizon}일 목표가와 하방 리스크를 함께 반영한 ${dashboardOpinion.label} 의견입니다.`
  );

  drawChart(prices, result.projected, result.volatility, selectedTicker);
  updateMarketStrip();
  drawRadar(selectedTicker);
  renderCompanyIntelligence(selectedTicker, result);
  updateRecommendations(result);
  renderWatchlist();
  renderRisk(prices, result);
  renderModelAnalysis();
  renderAiInsights(selectedTicker);
  renderDanteAnalysis();
  renderSmcAnalysis();
  renderIctAnalysis();
  renderAdminUsers();
  updateDataStatusBar(selectedTicker);
}

document.querySelectorAll("select, input").forEach((control) => {
  control.addEventListener("input", render);
});

elements.navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.viewTarget;
    document.body.dataset.activeView = target;
    document.body.classList.remove("mobile-nav-open");
    elements.mobileMenu.setAttribute("aria-expanded", "false");
    elements.navItems.forEach((navItem) => {
      const isActive = navItem === item;
      navItem.classList.toggle("active", isActive);
      if (isActive) navItem.setAttribute("aria-current", "page");
      else navItem.removeAttribute("aria-current");
    });
    elements.viewPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.view === target);
    });
    if (target === "dashboard" || target === "dante" || target === "smartmoney" || target === "admin") render();
    if (target === "ai") renderAiInsightsVisible();
  });
});

elements.smartTabs.forEach((tabButton) => {
  tabButton.addEventListener("click", () => {
    const target = tabButton.dataset.smartTab;
    elements.smartTabs.forEach((button) => {
      const isActive = button === tabButton;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
    elements.smartPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.smartPanel === target);
    });
    requestAnimationFrame(() => {
      if (target === "smc") renderSmcAnalysis();
      if (target === "ict") renderIctAnalysis();
    });
  });
});

elements.mobileMenu.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("mobile-nav-open");
  elements.mobileMenu.setAttribute("aria-expanded", String(isOpen));
  elements.mobileMenu.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("mobile-nav-open")) return;
  if (event.target.closest(".sidebar") || event.target.closest("#mobileMenuBtn")) return;
  document.body.classList.remove("mobile-nav-open");
  elements.mobileMenu.setAttribute("aria-expanded", "false");
  elements.mobileMenu.setAttribute("aria-label", "메뉴 열기");
});

elements.watchlistBody.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-watchlist]");
  if (removeButton) {
    event.stopPropagation();
    removeWatchlistSymbols([removeButton.dataset.removeWatchlist]);
    return;
  }
  if (event.target.closest("[data-watchlist-select]")) {
    event.stopPropagation();
    syncWatchlistSelectionState();
    return;
  }
  const row = event.target.closest("[data-ticker-row]");
  if (!row) return;
  selectTicker(row.dataset.tickerRow);
});

elements.watchlistBody.addEventListener("change", (event) => {
  if (!event.target.closest("[data-watchlist-select]")) return;
  syncWatchlistSelectionState();
});

elements.selectAllWatchlist.addEventListener("change", () => {
  const checkboxes = [...elements.watchlistBody.querySelectorAll("[data-watchlist-select]")];
  checkboxes.forEach((checkbox) => {
    checkbox.checked = elements.selectAllWatchlist.checked;
  });
  syncWatchlistSelectionState();
});

elements.deleteSelectedWatchlist.addEventListener("click", () => {
  const selectedSymbols = [...elements.watchlistBody.querySelectorAll("[data-watchlist-select]:checked")].map(
    (checkbox) => checkbox.dataset.watchlistSelect,
  );
  removeWatchlistSymbols(selectedSymbols);
});

elements.sortWatchlist.addEventListener("click", sortWatchlistByScore);

elements.compareTickerControls.addEventListener("change", (event) => {
  const input = event.target.closest('input[type="checkbox"]');
  if (!input) return;
  if (input.checked === false) {
    input.checked = true;
    return;
  }
  if (input.checked && compareSymbols.length >= 5) {
    input.checked = false;
    return;
  }
  const checked = [...elements.compareTickerControls.querySelectorAll("input:checked")].map((item) => item.value);
  compareSymbols = checked.slice(0, 5);
  saveUserPortfolio();
  renderModelAnalysis();
});

elements.downloadAiData.addEventListener("click", () => {
  const ticker = elements.ticker.value;
  const rows = calculateAdvancedIndicators(ticker);
  const header = "date,open,high,low,close,volume,rsi,macd,bb_upper,bb_lower,atr";
  const body = rows
    .map((row) =>
      [
        row.date,
        row.open.toFixed(2),
        row.high.toFixed(2),
        row.low.toFixed(2),
        row.close.toFixed(2),
        row.volume,
        row.rsi.toFixed(2),
        row.macd.toFixed(4),
        row.bbUpper.toFixed(2),
        row.bbLower.toFixed(2),
        row.atr.toFixed(2),
      ].join(","),
    )
    .join("\n");
  const blob = new Blob([[header, body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `bok-ai-${ticker}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
});

elements.openSymbolModal.addEventListener("click", openSymbolModal);
elements.closeSymbolModal.addEventListener("click", closeSymbolModal);
elements.symbolModal.addEventListener("click", (event) => {
  if (event.target === elements.symbolModal) closeSymbolModal();
});
elements.symbolSearch.addEventListener("input", () => {
  selectedSymbolToAdd = null;
  renderSymbolResults();
});
elements.symbolSearch.addEventListener("compositionend", () => {
  selectedSymbolToAdd = null;
  renderSymbolResults();
});
elements.symbolSearch.addEventListener("search", () => {
  selectedSymbolToAdd = null;
  renderSymbolResults();
});
elements.marketRadios.forEach((radio) => {
  radio.addEventListener("input", () => {
    selectedSymbolToAdd = null;
    renderSymbolResults();
  });
});
elements.symbolResults.addEventListener("click", (event) => {
  const option = event.target.closest("[data-symbol]");
  if (!option || option.disabled) return;
  selectedSymbolToAdd = option.dataset.symbol;
  collapseSymbolResultsAfterSelect();
});
elements.confirmSymbol.addEventListener("click", addSelectedSymbolToWatchlist);
elements.adminUserBody?.addEventListener("click", (event) => {
  const blockButton = event.target.closest("[data-admin-block]");
  if (blockButton) {
    toggleUserBlock(blockButton.dataset.adminBlock);
    return;
  }
  const deleteButton = event.target.closest("[data-admin-delete]");
  if (deleteButton) deleteUser(deleteButton.dataset.adminDelete);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.symbolModal.hidden) closeSymbolModal();
});

function setTheme(theme) {
  document.body.dataset.theme = theme;
  elements.themeToggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  safeStorageSet(localStore, "bok-invest-theme", theme);
  render();
}

elements.themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = normalizeUserId(elements.loginId.value);
  const password = elements.loginPassword.value;
  if (!id || !password) {
    elements.loginError.textContent = "아이디와 패스워드를 입력하세요.";
    return;
  }

  const users = getStoredUsers();
  if (authMode === "signup") {
    if (id === ADMIN_USER_ID) {
      elements.loginError.textContent = "관리자 아이디는 가입할 수 없습니다.";
      return;
    }
    if (users[id]) {
      elements.loginError.textContent = "이미 등록된 아이디입니다.";
      return;
    }
    users[id] = {
      password,
      watchlist: [],
      compareSymbols: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveStoredUsers(users);
    elements.loginError.textContent = "";
    elements.loginPassword.value = "";
    saveAuthPreference(id);
    unlockDashboard(id);
    return;
  }

  if (users[id]?.blocked) {
    elements.loginError.textContent = "관리자가 차단한 계정입니다.";
    return;
  }

  if (users[id]?.password === password) {
    elements.loginError.textContent = "";
    elements.loginPassword.value = "";
    saveAuthPreference(id);
    unlockDashboard(id);
    return;
  }
  elements.loginError.textContent = "아이디 또는 패스워드를 확인하세요.";
});

elements.authModeToggle.addEventListener("click", () => {
  setAuthMode(authMode === "login" ? "signup" : "login");
});

elements.ticker.addEventListener("change", () => {
  selectTicker(elements.ticker.value);
});
document.querySelector("#refreshBtn").addEventListener("click", () => {
  render();
  fetchMarketIndices();
  refreshTrackedMarketData({ includeMissingHistory: true });
});

window.addEventListener("resize", render);
document.body.dataset.theme = safeStorageGet(localStore, "bok-invest-theme") || "dark";
document.body.dataset.activeView = "dashboard";
ensureAdminUser();
safeStorageRemove(sessionStore, "bok-invest-authenticated");
elements.themeToggle.setAttribute("aria-checked", document.body.dataset.theme === "dark" ? "true" : "false");
setAuthMode("login");
const rememberedUserId = safeStorageGet(localStore, AUTH_REMEMBER_KEY);
const sessionUserId = safeStorageGet(sessionStore, AUTH_SESSION_KEY);
const autoLoginUserId = rememberedUserId || sessionUserId;
const storedUsers = getStoredUsers();
if (autoLoginUserId && storedUsers[autoLoginUserId] && !storedUsers[autoLoginUserId].blocked) {
  elements.rememberLogin.checked = rememberedUserId === autoLoginUserId;
  unlockDashboard(autoLoginUserId);
} else if (autoLoginUserId) {
  clearAuthPreference();
}
render();
loadStaticSymbolCatalog();
fetchMarketIndices();
if (elements.ticker.value) refreshTrackedMarketData({ includeMissingHistory: true });
setInterval(() => refreshTrackedMarketData(), 30000);
setInterval(fetchMarketIndices, 60000);
