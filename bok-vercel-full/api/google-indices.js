const QUOTES = {
  KOSPI: ["KOSPI:KRX"],
  KOSDAQ: ["KQ11:KOSDAQ", "KOSDAQ:KOSDAQ", "KQ11:KRX"],
  NASDAQ: [".IXIC:INDEXNASDAQ"],
  SP500: [".INX:INDEXSP"],
  DOW: [".DJI:INDEXDJX"],
};

const NAVER_INDICES = {
  KOSPI: "KOSPI",
  KOSDAQ: "KOSDAQ",
};

const STOOQ_INDICES = {
  NASDAQ: "^ndx",
  SP500: "^spx",
  DOW: "^dji",
};

let indicesCache = null;
let indicesCachedAt = 0;
const INDICES_CACHE_MS = 45_000;

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
  const percentMatch =
    quoteSection.match(/jsname="vY9t3b"[^>]*>\s*<span[^>]*>([+-]?\d+(?:\.\d+)?)%<\/span>/) ||
    html.match(new RegExp(`<div class="JV7gl">${escapedQuote}</div>[\\s\\S]*?jsname="vY9t3b"[^>]*>\\s*<span[^>]*>([+-]?\\d+(?:\\.\\d+)?)%<\\/span>`));

  const price = toNumber(priceMatch?.[1]);
  const percent = toNumber(percentMatch?.[1]);
  if (price === null || percent === null) return null;

  return {
    value: price,
    change: percent / 100,
    quote,
  };
}

async function fetchQuote(quote) {
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(quote)}?hl=en`;
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
    },
  });
  if (!response.ok) return null;
  return parseGoogleFinance(await response.text(), quote);
}

async function fetchIndex(candidates) {
  for (const quote of candidates) {
    try {
      const parsed = await fetchQuote(quote);
      if (parsed) return parsed;
    } catch {
      // Try next candidate.
    }
  }
  return null;
}

async function fetchNaverIndex(code) {
  const url = `https://m.stock.naver.com/api/index/${code}/price?pageSize=2&page=1`;
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      Referer: "https://m.stock.naver.com/",
      Accept: "application/json,text/plain,*/*",
    },
  });
  if (!response.ok) return null;
  const rows = await response.json();
  const latest = rows?.[0];
  if (!latest) return null;
  const value = toNumber(latest.closePrice);
  const change = toNumber(latest.fluctuationsRatio);
  if (value === null || change === null) return null;
  return {
    value,
    change: change / 100,
    quote: code,
    source: "네이버 지연",
    tradedAt: latest.localTradedAt,
  };
}

async function fetchStooqIndex(symbol) {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlcv&h&e=csv`;
  const response = await fetch(url, {
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
  const openValue = toNumber(open);
  const closeValue = toNumber(close);
  if (openValue === null || closeValue === null) return null;
  return {
    value: closeValue,
    change: openValue ? (closeValue - openValue) / openValue : 0,
    quote,
    source: date && time ? "Stooq 지연" : "Stooq 종가",
    tradedAt: date && time ? `${date} ${time}` : date,
  };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  response.setHeader("Access-Control-Allow-Origin", "*");

  if (indicesCache && Date.now() - indicesCachedAt < INDICES_CACHE_MS) {
    response.status(200).json(indicesCache);
    return;
  }

  const naverEntries = await Promise.all(
    Object.entries(NAVER_INDICES).map(async ([key, code]) => {
      try {
        return [key, await fetchNaverIndex(code)];
      } catch {
        return [key, null];
      }
    }),
  );

  const stooqEntries = await Promise.all(
    Object.entries(STOOQ_INDICES).map(async ([key, symbol]) => {
      try {
        return [key, await fetchStooqIndex(symbol)];
      } catch {
        return [key, null];
      }
    }),
  );

  const naverMap = new Map(naverEntries);
  const stooqMap = new Map(stooqEntries);
  let mergedEntries = Object.keys(QUOTES).map((key) => [key, naverMap.get(key) || stooqMap.get(key) || null]);
  const missingKeys = mergedEntries.filter(([, value]) => !value).map(([key]) => key);

  if (missingKeys.length) {
    const googleEntries = await Promise.all(missingKeys.map(async (key) => [key, await fetchIndex(QUOTES[key])]));
    const googleMap = new Map(googleEntries);
    mergedEntries = mergedEntries.map(([key, value]) => [key, value || googleMap.get(key)]);
  }

  const indices = Object.fromEntries(
    mergedEntries
      .filter(([, value]) => value)
      .map(([key, value]) => [
        key,
        {
          ...value,
          source: value.source || "Google Finance 지연",
          fetchedAt: new Date().toISOString(),
        },
      ]),
  );

  indicesCache = { indices };
  indicesCachedAt = Date.now();
  response.status(200).json(indicesCache);
}
