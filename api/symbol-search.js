const FETCH_TIMEOUT_MS = 7000;

function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Fetch timeout")), timeoutMs)),
  ]);
}

function normalizeMarket(typeCode) {
  if (typeCode === "KOSPI") return "KS";
  if (typeCode === "KOSDAQ") return "KQ";
  return null;
}

const fallbackSymbols = [
  { ticker: "005930.KS", name: "삼성전자", market: "domestic", aliases: ["samsung", "삼전", "005930"] },
  { ticker: "NVDA", name: "NVIDIA", market: "global", aliases: ["nvda"] },
  { ticker: "AAPL", name: "Apple", market: "global", aliases: ["aapl"] },
];

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[\s._\-()&/]+/g, "");
}

function dedupeSymbols(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.ticker || seen.has(item.ticker)) return false;
    seen.add(item.ticker);
    return true;
  });
}

async function searchNaverDomestic(query) {
  const url = `https://ac.stock.naver.com/ac?q=${encodeURIComponent(query)}&target=stock`;
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json",
    },
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.items || [])
    .map((item) => {
      const suffix = normalizeMarket(item.typeCode);
      if (!suffix || !item.code || !item.name) return null;
      return {
        ticker: `${item.code}.${suffix}`,
        name: item.name,
        market: "domestic",
        source: "Naver",
      };
    })
    .filter(Boolean);
}

async function searchYahooGlobal(query) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json",
    },
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return (payload.quotes || [])
    .filter((item) => item.quoteType === "EQUITY" && item.symbol && item.shortname)
    .map((item) => ({
      ticker: item.symbol,
      name: item.shortname,
      market: "global",
      source: "Yahoo",
    }));
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=180");
  response.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const query = url.searchParams.get("q")?.trim() || "";
  const market = url.searchParams.get("market") || "all";
  
  if (!query) {
    response.status(200).json({ query, results: [] });
    return;
  }

  const tasks = [];
  if (market === "all" || market === "domestic") tasks.push(searchNaverDomestic(query));
  if (market === "all" || market === "global") tasks.push(searchYahooGlobal(query));

  const settled = await Promise.allSettled(tasks);
  const fallbackResults = fallbackSymbols.filter(s => 
    (market === "all" || s.market === market) &&
    (normalizeSearchText(s.ticker).includes(normalizeSearchText(query)) ||
     normalizeSearchText(s.name).includes(normalizeSearchText(query)))
  );
  const remoteResults = settled.flatMap((item) => (item.status === "fulfilled" ? item.value : []));
  const results = dedupeSymbols([...fallbackResults, ...remoteResults]).slice(0, 20);
  response.status(200).json({ query, results });
}
