import { readFile } from "node:fs/promises";

function normalizeMarket(typeCode) {
  if (typeCode === "KOSPI") return "KS";
  if (typeCode === "KOSDAQ") return "KQ";
  return null;
}

const fallbackSymbols = [
  { ticker: "011790.KS", name: "SKC", market: "domestic", aliases: ["skc", "에스케이씨", "011790"] },
  { ticker: "005930.KS", name: "삼성전자", market: "domestic", aliases: ["samsung", "삼전", "005930"] },
  { ticker: "000660.KS", name: "SK하이닉스", market: "domestic", aliases: ["sk hynix", "하이닉스", "000660"] },
  { ticker: "240810.KQ", name: "원익IPS", market: "domestic", aliases: ["wonik ips", "원익아이피에스", "240810"] },
  { ticker: "138080.KQ", name: "오이솔루션", market: "domestic", aliases: ["oisolution", "oi solution", "138080"] },
  { ticker: "010170.KQ", name: "대한광통신", market: "domestic", aliases: ["dh light", "010170"] },
];

let staticFallbackSymbols;

async function getStaticFallbackSymbols() {
  if (staticFallbackSymbols) return staticFallbackSymbols;
  try {
    const fileUrl = new URL("../assets/symbols.json", import.meta.url);
    const payload = JSON.parse(await readFile(fileUrl, "utf8"));
    staticFallbackSymbols = Array.isArray(payload) ? payload : [];
  } catch {
    staticFallbackSymbols = [];
  }
  return staticFallbackSymbols;
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s._\-()&/]+/g, "");
}

const koreanInitials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function getKoreanInitials(value) {
  return [...String(value || "")]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < 0xac00 || code > 0xd7a3) return "";
      return koreanInitials[Math.floor((code - 0xac00) / 588)];
    })
    .join("");
}

function getMixedInitials(value) {
  return [...String(value || "")]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) return koreanInitials[Math.floor((code - 0xac00) / 588)];
      return /[a-z0-9]/i.test(char) ? char.toLowerCase() : "";
    })
    .join("");
}

function getSearchTokens(symbol) {
  const values = [symbol.ticker, symbol.name, ...(symbol.aliases || [])];
  return values.flatMap((value) => {
    const normalized = normalizeSearchText(value);
    const initials = getKoreanInitials(value);
    const mixedInitials = getMixedInitials(value);
    return [normalized, initials, mixedInitials].filter(Boolean);
  });
}

async function searchFallbackSymbols(query, market) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const staticSymbols = await getStaticFallbackSymbols();
  return [...fallbackSymbols, ...staticSymbols]
    .filter((symbol) => market === "all" || symbol.market === market)
    .filter((symbol) => {
      const tokens = getSearchTokens(symbol);
      return tokens.some((token) => token === normalizedQuery || token.startsWith(normalizedQuery) || token.includes(normalizedQuery));
    })
    .map(({ aliases, ...symbol }) => ({ ...symbol, source: "Fallback" }));
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
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
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
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
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
  const fallbackResults = await searchFallbackSymbols(query, market);
  const remoteResults = settled.flatMap((item) => (item.status === "fulfilled" ? item.value : []));
  const results = dedupeSymbols([...fallbackResults, ...remoteResults]).slice(0, 20);
  response.status(200).json({ query, results });
}
