const FETCH_TIMEOUT_MS = 8000;

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
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

function formatCompactDate(value) {
  return value.toISOString().slice(0, 10).replace(/-/g, "");
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

function isDomesticSymbol(symbol) {
  return symbol?.endsWith(".KS") || symbol?.endsWith(".KQ");
}

function getDomesticCode(symbol) {
  return symbol?.replace(/\.(KS|KQ)$/i, "");
}

function getAlphaSquareCode(symbol) {
  if (!symbol) return null;
  return isDomesticSymbol(symbol) ? getDomesticCode(symbol) : symbol;
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

function parseAlphaSquareDate(value) {
  const [month, day, year] = value.split("/").map(Number);
  if (!year || !month || !day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseAlphaSquareHistory(html) {
  const text = normalizeText(html);
  if (/페이지를 찾을 수 없습니다|Page Not Found/i.test(text)) return [];
  return [
    ...text.matchAll(
      /(\d{1,2}\/\d{1,2}\/\d{4})\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+)/g,
    ),
  ]
    .map((match) => ({
      date: parseAlphaSquareDate(match[1]),
      open: toNumber(match[2]),
      high: toNumber(match[3]),
      low: toNumber(match[4]),
      close: toNumber(match[5]),
      volume: toNumber(match[6]),
    }))
    .filter((row) => row.date && [row.open, row.high, row.low, row.close, row.volume].every(Number.isFinite));
}

async function fetchAlphaSquareHistory(symbol) {
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
    const rows = parseAlphaSquareHistory(await response.text());
    return rows.length >= 5 ? rows : null;
  } catch (error) {
    console.warn(`AlphaSquare history fetch failed for ${symbol}:`, error.message);
    return null;
  }
}

function parseNaverHistory(text) {
  return [...text.matchAll(/\["(\d{8})",\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/g)].map(
    (match) => ({
      date: `${match[1].slice(0, 4)}-${match[1].slice(4, 6)}-${match[1].slice(6, 8)}`,
      open: Number(match[2]),
      high: Number(match[3]),
      low: Number(match[4]),
      close: Number(match[5]),
      volume: Number(match[6]),
    }),
  );
}

async function fetchNaverHistory(symbol) {
  const code = getDomesticCode(symbol);
  if (!code) return null;
  const end = getKoreaDate();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 120);
  const url = `https://api.finance.naver.com/siseJson.naver?symbol=${encodeURIComponent(code)}&requestType=1&startTime=${formatCompactDate(
    start,
  )}&endTime=${formatCompactDate(end)}&timeframe=day`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    });
    if (!response.ok) return null;
    const rows = parseNaverHistory(await response.text());
    return rows.length >= 5 ? rows : null;
  } catch (error) {
    console.warn(`Naver history fetch failed for ${symbol}:`, error.message);
    return null;
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
  response.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const symbol = url.searchParams.get("symbol")?.trim();

  // 파라미터 검증
  if (!symbol) {
    response.status(400).json({ error: "Missing or invalid symbol" });
    return;
  }

  // 기호 검증 (alphanumeric, 점, 대시만 허용)
  if (!/^[A-Za-z0-9\.\-]+$/.test(symbol)) {
    response.status(400).json({ error: "Invalid symbol format" });
    return;
  }

  try {
    if (isDomesticSymbol(symbol)) {
      const domesticRows = await fetchNaverHistory(symbol);
      if (domesticRows) {
        response.status(200).json({
          symbol,
          prices: domesticRows.map((row) => row.close),
          dates: domesticRows.map((row) => row.date),
          ohlcv: domesticRows,
          source: "Naver Finance 일봉",
          fetchedAt: new Date().toISOString(),
        });
        return;
      }
    }

    const endpoint = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`;
    const yahooResponse = await fetchWithTimeout(endpoint, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Accept: "application/json",
      },
    });
    if (!yahooResponse.ok) throw new Error(`HTTP ${yahooResponse.status}`);

    const payload = await yahooResponse.json();
    const result = payload?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const quote = result?.indicators?.quote?.[0] || {};
    const closes = quote.close || [];
    const rows = timestamps
      .map((timestamp, index) => ({
        date: formatDate(timestamp),
        open: quote.open?.[index],
        high: quote.high?.[index],
        low: quote.low?.[index],
        close: closes[index],
        volume: quote.volume?.[index],
      }))
      .filter((row) => Number.isFinite(row.close));

    if (rows.length < 5) throw new Error("Not enough history");

    response.status(200).json({
      symbol,
      prices: rows.map((row) => row.close),
      dates: rows.map((row) => row.date),
      ohlcv: rows,
      source: "Yahoo Finance 지연",
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    try {
      const alphaRows = await fetchAlphaSquareHistory(symbol);
      if (alphaRows) {
        response.status(200).json({
          symbol,
          prices: alphaRows.map((row) => row.close),
          dates: alphaRows.map((row) => row.date),
          ohlcv: alphaRows,
          source: "AlphaSquare 공개 페이지 fallback",
          fetchedAt: new Date().toISOString(),
        });
        return;
      }
    } catch {
      // Public-page fallback failed.
    }
    response.status(404).json({ error: "History not found", symbol });
  }
}
