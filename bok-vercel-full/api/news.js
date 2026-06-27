function decodeEntity(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

function stripTags(value) {
  return decodeEntity(value.replace(/<[^>]*>/g, "").trim());
}

function readTag(item, tagName) {
  const match = item.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function parseRssItems(xml) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].slice(0, 8).map(([item]) => {
    const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const published = readTag(item, "pubDate");
    return {
      title: readTag(item, "title"),
      link: readTag(item, "link"),
      source: source ? stripTags(source[1]) : "",
      publishedAt: published ? new Date(published).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) : "",
    };
  });
}

const alphaSquareHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Origin: "https://alphasquare.co.kr",
};

const alphaSquareStockIdCache = new Map();

function getDomesticCode(symbol) {
  const match = symbol.match(/^(\d{6})\.K[QS]$/i);
  return match ? match[1] : "";
}

function formatNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

function pickAlphaSquareStock(payload, code) {
  return payload?.[code] || payload?.data?.[code] || payload?.data || payload;
}

async function fetchAlphaSquareStockId(code) {
  if (!code) return null;
  if (alphaSquareStockIdCache.has(code)) return alphaSquareStockIdCache.get(code);

  const detailsUrl = `https://api.alphasquare.co.kr/data/v2/stock/details?code=${encodeURIComponent(code)}`;
  const response = await fetch(detailsUrl, {
    headers: {
      ...alphaSquareHeaders,
      Referer: `https://alphasquare.co.kr/home/stock-information?code=${encodeURIComponent(code)}`,
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return null;

  const payload = await response.json();
  const stock = pickAlphaSquareStock(payload, code);
  const stockId = Number(stock?.id || stock?.stock_id || stock?.stockId);
  const normalizedId = Number.isFinite(stockId) ? stockId : null;
  alphaSquareStockIdCache.set(code, normalizedId);
  return normalizedId;
}

async function fetchAlphaSquareNews(symbol) {
  const code = getDomesticCode(symbol);
  const stockId = await fetchAlphaSquareStockId(code);
  if (!stockId) return [];

  const newsUrl = `https://api.alphasquare.co.kr/data/v3/issue/stock-news?stock-id=${encodeURIComponent(stockId)}&limit=8`;
  const response = await fetch(newsUrl, {
    headers: {
      ...alphaSquareHeaders,
      Referer: `https://alphasquare.co.kr/home/theme-factor?theme-id=67&code=${encodeURIComponent(code)}`,
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return [];

  const payload = await response.json();
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows
    .map((item) => ({
      title: typeof item.title === "string" ? item.title.trim() : "",
      link: typeof item.link === "string" ? item.link.trim() : "",
      source: typeof item.source === "string" ? item.source.trim() : "AlphaSquare",
      publishedAt: formatNewsDate(item.dt),
    }))
    .filter((article) => article.title && article.link);
}

async function fetchGoogleNews(symbol, name) {
  const isDomestic = /\.K[QS]$/i.test(symbol);
  const query = isDomestic ? `${name} 주식` : `${name} stock`;
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  const response = await fetch(rssUrl, {
    headers: { "User-Agent": "Mozilla/5.0 BOK-Invest-Dashboard/1.0" },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`Google News returned ${response.status}`);
  const xml = await response.text();
  return parseRssItems(xml).filter((article) => article.title && article.link);
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const symbol = (url.searchParams.get("symbol") || "").trim();
  const name = (url.searchParams.get("name") || symbol).trim();
  const isDomestic = /\.K[QS]$/i.test(symbol);

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    let source = "google-news";
    let articles = [];
    if (isDomestic) {
      articles = await fetchAlphaSquareNews(symbol);
      if (articles.length) source = "alphasquare";
    }
    if (!articles.length) {
      articles = await fetchGoogleNews(symbol, name);
    }
    res.status(200).json({ symbol, name, source, articles });
  } catch (error) {
    res.status(200).json({ symbol, name, articles: [] });
  }
}
