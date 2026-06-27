const QUOTE_MAP = {
  NVDA: ["NVDA:NASDAQ"],
  AAPL: ["AAPL:NASDAQ"],
  MSFT: ["MSFT:NASDAQ"],
  TSLA: ["TSLA:NASDAQ"],
  GOOGL: ["GOOGL:NASDAQ"],
  AMZN: ["AMZN:NASDAQ"],
  "005930.KS": ["005930:KRX"],
  "000660.KS": ["000660:KRX"],
  "035420.KS": ["035420:KRX"],
  "035720.KS": ["035720:KRX"],
  "138080.KQ": ["138080:KOSDAQ", "138080:KRX"],
};

const quoteCache = new Map();
const QUOTE_CACHE_MS = 25_000;
const QUOTE_CACHE_MAX_SIZE = 100; // 메모리 누수 방지
const FETCH_TIMEOUT_MS = 7000; // 타임아웃 추가

// LRU 캐시 정리 함수
function maintainCacheSize() {
  if (quoteCache.size > QUOTE_CACHE_MAX_SIZE) {
    // 가장 오래된 항목 제거 (FIFO)
    const firstKey = quoteCache.keys().next().value;
    if (firstKey) quoteCache.delete(firstKey);
  }
}

function getYahooSymbol(symbol) {
  return symbol;
}

function getStooqSymbol(symbol) {
  if (symbol.endsWith(".KS") || symbol.endsWith(".KQ")) return null;
  return `${symbol.toLowerCase()}.us`;
}

function isDomesticSymbol(symbol) {
  return symbol?.endsWith(".KS") || symbol?.endsWith(".KQ");
}

function getDomesticCode(symbol) {
  return symbol?.replace(/\.(KS|KQ)$/i, "");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function normalizeText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
      .replace(/\s+/g, " "),
  );
}

function toNumber(value) {
  if (!value) return null;
  const parsed = Number(String(value).replace(/[,+%₩$]/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseGoogleFinance(html, quote) {
  const text = normalizeText(html);
  if (/Page Not Found|couldn't find any match/i.test(text)) return null;

  const escapedQuote = quote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quoteSection =
    html.match(new RegExp(`<div class="JV7gl">${escapedQuote}</div>[\\s\\S]{0,5000}`))?.[0] ||
    html.match(new RegExp(`${escapedQuote}[\\s\\S]{0,5000}`))?.[0] ||
    "";

  const priceMatch =
    quoteSection.match(/jsname="Pdsbrc"[^>]*>\s*<span>([^<]+)<\/span>/) ||
    html.match(new RegExp(`<div class="JV7gl">${escapedQuote}</div>[\\s\\S]*?jsname="Pdsbrc"[^>]*>\\s*<span>([^<]+)<\\/span>`));
  const pointMatch = quoteSection.match(/jsname="Fe7oBc"[^>]*>\s*<span[^>]*>([+-]?[^<]+)<\/span>/);
  const percentMatch =
    quoteSection.match(/jsname="vY9t3b"[^>]*>\s*<span[^>]*>([+-]?\d+(?:\.\d+)?)%<\/span>/) ||
    html.match(new RegExp(`<div class="JV7gl">${escapedQuote}</div>[\\s\\S]*?jsname="vY9t3b"[^>]*>\\s*<span[^>]*>([+-]?\\d+(?:\\.\\d+)?)%<\\/span>`));

  const price = toNumber(priceMatch?.[1]);
  const change = toNumber(pointMatch?.[1]);
  const percent = toNumber(percentMatch?.[1]);
  if (price === null) return null;

  return {
    price,
    change: change ?? null,
    changePercent: percent === null ? null : percent / 100,
    quote,
    source: "Google Finance 지연",
    fetchedAt: new Date().toISOString(),
  };
}

function getAlphaSquareCode(symbol) {
  if (!symbol) return null;
  return isDomesticSymbol(symbol) ? getDomesticCode(symbol) : symbol;
}

function parseAlphaSquareQuote(html, symbol) {
  const text = normalizeText(html);
  if (/페이지를 찾을 수 없습니다|Page Not Found/i.test(text)) return null;

  const priceMatch = text.match(/현재가\s+([\d,]+)\s*(?:원)?/);
  const changeMatch = text.match(/변동량\s*([▲▼+\-]?)\s*([\d,.]+)/);
  const percentMatch = text.match(/변동률\s*([+\-]?\d+(?:\.\d+)?)%/);
  const price = toNumber(priceMatch?.[1]);
  if (price === null) return null;

  const direction = changeMatch?.[1] === "▼" ? -1 : 1;
  const rawChange = toNumber(changeMatch?.[2]);
  const percent = toNumber(percentMatch?.[1]);

  return {
    price,
    change: rawChange === null ? null : rawChange * direction,
    changePercent: percent === null ? null : percent / 100,
    quote: getAlphaSquareCode(symbol),
    source: "AlphaSquare 공개 페이지 fallback",
    fetchedAt: new Date().toISOString(),
  };
}

// 타임아웃이 있는 fetch 래퍼
function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Fetch timeout")), timeoutMs)
    ),
  ]);
}

async function fetchAlphaSquareQuote(symbol) {
  const code = getAlphaSquareCode(symbol);
  if (!code) return null;
  const url = `https://alphasquare.co.kr/home/stock-summary?code=${encodeURIComponent(code)}`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    });
    if (!response.ok) return null;
    return parseAlphaSquareQuote(await response.text(), symbol);
  } catch (error) {
    console.warn(`AlphaSquare fetch failed for ${symbol}:`, error.message);
    return null;
  }
}

async function fetchGoogleQuote(quote) {
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(quote)}?hl=en`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
      },
    });
    if (!response.ok) return null;
    return parseGoogleFinance(await response.text(), quote);
  } catch (error) {
    console.warn(`Google Finance fetch failed for ${quote}:`, error.message);
    return null;
  }
}

async function fetchYahooQuote(symbol) {
  const yahooSymbol = getYahooSymbol(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=5d&interval=1d`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const result = payload?.chart?.result?.[0];
    const meta = result?.meta;
    const closes = result?.indicators?.quote?.[0]?.close?.filter(Number.isFinite) || [];
    const price = Number(meta?.regularMarketPrice ?? closes.at(-1));
    if (!Number.isFinite(price)) return null;
    const previousClose = Number(meta?.previousClose ?? meta?.chartPreviousClose ?? closes.at(-2));
    const change = Number.isFinite(previousClose) ? price - previousClose : null;
    const changePercent = Number.isFinite(previousClose) && previousClose !== 0 ? change / previousClose : null;
    return {
      price,
      change,
      changePercent,
      quote: yahooSymbol,
      source: "Yahoo Finance 지연",
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`Yahoo Finance fetch failed for ${symbol}:`, error.message);
    return null;
  }
}

async function fetchNaverQuote(symbol) {
  const code = getDomesticCode(symbol);
  if (!code) return null;
  const url = `https://polling.finance.naver.com/api/realtime/domestic/stock/${encodeURIComponent(code)}`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const row = payload?.datas?.[0];
    const price = Number(row?.closePriceRaw);
    if (!Number.isFinite(price)) return null;
    const change = Number(row?.compareToPreviousClosePriceRaw);
    const percent = Number(row?.fluctuationsRatioRaw);
    return {
      price,
      change: Number.isFinite(change) ? change : null,
      changePercent: Number.isFinite(percent) ? percent / 100 : null,
      quote: code,
      source: "Naver Finance 실시간",
      fetchedAt: row?.localTradedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`Naver Finance fetch failed for ${symbol}:`, error.message);
    return null;
  }
}

async function fetchStooqQuote(symbol) {
  const stooqSymbol = getStooqSymbol(symbol);
  if (!stooqSymbol) return null;
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSymbol)}&f=sd2t2ohlcv&h&e=csv`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Accept: "text/csv",
      },
    });
    if (!response.ok) return null;
    const [, row] = (await response.text()).trim().split(/\r?\n/);
    if (!row) return null;
    const [quote, date, time, open, , , close] = row.split(",");
    const price = Number(close);
    const openPrice = Number(open);
    if (!Number.isFinite(price)) return null;
    const change = Number.isFinite(openPrice) ? price - openPrice : null;
    const changePercent = Number.isFinite(openPrice) && openPrice !== 0 ? change / openPrice : null;
    return {
      price,
      change,
      changePercent,
      quote,
      source: "Stooq 지연",
      fetchedAt: date && time ? new Date(`${date}T${time.replace(/\./g, ":")}Z`).toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`Stooq fetch failed for ${symbol}:`, error.message);
    return null;
  }
}

function sendQuote(response, symbol, payload) {
  const body = { symbol, ...payload };
  quoteCache.set(symbol, { body, cachedAt: Date.now() });
  response.status(200).json(body);
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
  response.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const symbol = url.searchParams.get("symbol")?.trim();

  // 파라미터 검증
  if (!symbol) {
    response.status(400).json({ error: "Missing or invalid symbol parameter" });
    return;
  }

  // 기호 검증 (alphanumeric, 점, 대시만 허용)
  if (!/^[A-Za-z0-9\.\-]+$/.test(symbol)) {
    response.status(400).json({ error: "Invalid symbol format" });
    return;
  }

  // 캐시 확인
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.cachedAt < QUOTE_CACHE_MS) {
    response.status(200).json(cached.body);
    return;
  }

  // 캐시 크기 유지보수
  maintainCacheSize();
  const code = symbol?.replace(/\.(KS|KQ)$/i, "");
  const candidates =
    QUOTE_MAP[symbol] ||
    (symbol?.endsWith(".KS") && code ? [`${code}:KRX`] : symbol?.endsWith(".KQ") && code ? [`${code}:KOSDAQ`, `${code}:KRX`] : []);

  if (isDomesticSymbol(symbol)) {
    try {
      const payload = await fetchNaverQuote(symbol);
      if (payload) {
        sendQuote(response, symbol, payload);
        return;
      }
    } catch {
      // Fall back to Yahoo and Google.
    }
  }

  try {
    const payload = await fetchYahooQuote(symbol);
    if (payload) {
      sendQuote(response, symbol, payload);
      return;
    }
  } catch {
    // Fall back to Google Finance candidates.
  }

  try {
    const payload = await fetchStooqQuote(symbol);
    if (payload) {
      sendQuote(response, symbol, payload);
      return;
    }
  } catch {
    // Fall back to Google Finance candidates.
  }

  for (const quote of candidates) {
    try {
      const payload = await fetchGoogleQuote(quote);
      if (payload) {
        sendQuote(response, symbol, payload);
        return;
      }
    } catch {
      // Try next candidate.
    }
  }

  try {
    const payload = await fetchAlphaSquareQuote(symbol);
    if (payload) {
      sendQuote(response, symbol, payload);
      return;
    }
  } catch {
    // AlphaSquare is a final public-page fallback only.
  }

  response.status(404).json({ error: "Quote not found", symbol });
}
