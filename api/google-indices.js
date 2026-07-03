/*
 * 시장 지수 API — 네이버 금융 기반 (2026-07 소스 점검 후 재작성)
 *  - 국내(KOSPI/KOSDAQ): m.stock.naver.com 지수 API
 *  - 해외(NASDAQ/S&P500/DOW): api.stock.naver.com 해외지수 API
 *  - 기존 Stooq(서비스 중단)·Google Finance 스크레이핑(302 차단) 소스는 제거
 */
const KR_INDICES = {
  KOSPI: "KOSPI",
  KOSDAQ: "KOSDAQ",
};

const WORLD_INDICES = {
  NASDAQ: ".IXIC",
  SP500: ".INX",
  DOW: ".DJI",
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
};

let indicesCache = null;
let indicesCachedAt = 0;
const INDICES_CACHE_MS = 45_000;

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(/[,+%₩$]/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchKrIndex(code) {
  const url = `https://m.stock.naver.com/api/index/${code}/price?pageSize=2&page=1`;
  const response = await fetch(url, {
    headers: { ...HEADERS, Referer: "https://m.stock.naver.com/" },
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

async function fetchWorldIndex(code) {
  const url = `https://api.stock.naver.com/index/${encodeURIComponent(code)}/basic`;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) return null;
  const data = await response.json();
  const value = toNumber(data?.closePrice);
  const change = toNumber(data?.fluctuationsRatio);
  if (value === null || change === null) return null;
  return {
    value,
    change: change / 100,
    quote: code,
    source: "네이버 지연",
    tradedAt: data.localTradedAt,
  };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  response.setHeader("Access-Control-Allow-Origin", "*");

  if (indicesCache && Date.now() - indicesCachedAt < INDICES_CACHE_MS) {
    response.status(200).json(indicesCache);
    return;
  }

  const krEntries = Object.entries(KR_INDICES).map(async ([key, code]) => {
    try {
      return [key, await fetchKrIndex(code)];
    } catch {
      return [key, null];
    }
  });
  const worldEntries = Object.entries(WORLD_INDICES).map(async ([key, code]) => {
    try {
      return [key, await fetchWorldIndex(code)];
    } catch {
      return [key, null];
    }
  });
  const entries = await Promise.all([...krEntries, ...worldEntries]);

  const indices = Object.fromEntries(
    entries
      .filter(([, value]) => value)
      .map(([key, value]) => [key, { ...value, fetchedAt: new Date().toISOString() }]),
  );

  const payload = { indices };
  // 전 소스 실패 시 빈 캐시를 저장하지 않는다 (다음 요청에서 재시도).
  if (Object.keys(indices).length) {
    indicesCache = payload;
    indicesCachedAt = Date.now();
  }
  response.status(200).json(payload);
}
