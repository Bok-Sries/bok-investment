/*
 * 펀더멘털 지표 API (국내 전용 — 네이버 integration)
 * GET /api/fundamental?symbol=005930.KS
 * 반환: per, eps, pbr, bps, dividendYield(%), foreignRate(%), marketValue, high52, low52
 * 해외 종목은 네이버가 펀더멘털을 제공하지 않아 supported:false 반환.
 */
const FETCH_TIMEOUT_MS = 7000;

function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
  ]);
}

function isDomesticSymbol(symbol) {
  return symbol?.endsWith(".KS") || symbol?.endsWith(".KQ");
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(/[,%배원조억\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");
  response.setHeader("Access-Control-Allow-Origin", "*");

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const symbol = url.searchParams.get("symbol")?.trim() || "";
  if (!symbol || !/^[A-Za-z0-9.\-]+$/.test(symbol)) {
    response.status(400).json({ error: "Invalid symbol" });
    return;
  }
  if (!isDomesticSymbol(symbol)) {
    response.status(200).json({ symbol, supported: false, reason: "해외 종목은 펀더멘털 미제공(네이버)" });
    return;
  }

  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    response.status(200).json(cached.body);
    return;
  }

  const code = symbol.replace(/\.(KS|KQ)$/i, "");
  try {
    const apiUrl = `https://m.stock.naver.com/api/stock/${encodeURIComponent(code)}/integration`;
    const res = await fetchWithTimeout(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Referer: "https://m.stock.naver.com/",
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const infos = {};
    (data?.totalInfos || []).forEach((item) => {
      if (item?.code) infos[item.code] = item.value;
    });
    const body = {
      symbol,
      supported: true,
      name: data?.stockName || null,
      per: toNumber(infos.per),
      eps: toNumber(infos.eps),
      pbr: toNumber(infos.pbr),
      bps: toNumber(infos.bps),
      dividendYield: toNumber(infos.dividendRate ?? infos.dividendYieldRatio),
      foreignRate: toNumber(infos.foreignRate),
      marketValueText: infos.marketValue || null,
      high52: toNumber(infos.highPriceOf52Weeks),
      low52: toNumber(infos.lowPriceOf52Weeks),
      fetchedAt: new Date().toISOString(),
    };
    cache.set(symbol, { at: Date.now(), body });
    response.status(200).json(body);
  } catch (error) {
    response.status(200).json({ symbol, supported: true, error: "펀더멘털 조회 실패", detail: error.message });
  }
}
