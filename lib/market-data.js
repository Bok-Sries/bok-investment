export const HEADERS = { "User-Agent": "Mozilla/5.0", Accept: "application/json", Referer: "https://alphasquare.co.kr/", Origin: "https://alphasquare.co.kr" };
export const domestic = symbol => /\.(KS|KQ)$/.test(symbol);
export function number(value) {
  if (value == null || String(value).trim() === "") return null;
  const n = Number(String(value).replace(/[,+$%]/g, "").replace(/−/g, "-"));
  return Number.isFinite(n) ? n : null;
}
export function dateKey(value, zone = "America/New_York") {
  if (!value) return null;
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function iso(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}
export function changes(price, previousClose) {
  const valid = previousClose > 0;
  return { previousClose: valid ? previousClose : null, change: valid ? price - previousClose : null, changePercent: valid ? (price - previousClose) / previousClose : null };
}
export function signed(value, direction) {
  const n = number(value);
  if (n === null) return null;
  if (["4", "5", "FALLING", "LOWER_LIMIT"].includes(String(direction))) return -Math.abs(n);
  if (["1", "2", "RISING", "UPPER_LIMIT"].includes(String(direction))) return Math.abs(n);
  return n;
}
export function context(timeout = 14000) {
  return { deadline: Date.now() + timeout, errors: [] };
}
export async function request(url, ctx, type = "json") {
  const remaining = ctx.deadline - Date.now();
  if (remaining <= 0) throw new Error("UPSTREAM_TIMEOUT");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(3000, remaining));
  try {
    const headers = new URL(url).hostname === "api.alphasquare.co.kr" ? HEADERS :
      { "User-Agent": "Mozilla/5.0", Accept: "application/json,text/plain,*/*", Referer: "https://m.stock.naver.com/" };
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    return await response[type]();
  } catch (error) {
    throw new Error(error.name === "AbortError" ? "UPSTREAM_TIMEOUT" : error.message === "fetch failed" ? "UPSTREAM_NETWORK" : error.message);
  } finally { clearTimeout(timer); }
}
export async function attempt(ctx, provider, task) {
  try {
    const value = await task();
    if (!value) throw new Error("INVALID_DATA");
    return value;
  } catch (error) {
    ctx.errors.push({ provider, code: /^HTTP_\d+$|^UPSTREAM_(TIMEOUT|NETWORK)$/.test(error.message) ? error.message : "INVALID_DATA" });
    return null;
  }
}
export function rowsValid(rows) {
  return [...new Map(rows.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date || "") &&
    [r.open,r.high,r.low,r.close].every(v => Number.isFinite(v) && v > 0) &&
    r.high >= Math.max(r.open,r.close,r.low) && r.low <= Math.min(r.open,r.close) &&
    Number.isFinite(r.volume) && r.volume >= 0).map(r => [r.date,r])).values()].sort((a,b) => a.date.localeCompare(b.date));
}
export function naverQuote(row, symbol) {
  const price = number(row.closePriceRaw ?? row.closePrice);
  if (!(price > 0)) return null;
  const direction = row.compareToPreviousPrice?.code ?? row.compareToPreviousPrice?.name;
  const change = signed(row.compareToPreviousClosePriceRaw ?? row.compareToPreviousClosePrice, direction);
  const percent = signed(row.fluctuationsRatioRaw ?? row.fluctuationsRatio, direction);
  const tradedAt = iso(row.localTradedAt);
  const over = row.overMarketPriceInfo;
  const extendedPrice = number(over?.overPriceRaw ?? over?.overPrice);
  return {
    price, ...changes(price, change === null ? null : price - change),
    open: number(row.openPriceRaw ?? row.openPrice), high: number(row.highPriceRaw ?? row.highPrice),
    low: number(row.lowPriceRaw ?? row.lowPrice), volume: number(row.accumulatedTradingVolumeRaw ?? row.accumulatedTradingVolume),
    // The supplied percentage is rounded by Naver; the price difference gives the precise ratio.
    changePercent: change === null ? (percent === null ? null : percent / 100) : changes(price, price - change).changePercent,
    tradedAt, tradingDate: dateKey(tradedAt, domestic(symbol) ? "Asia/Seoul" : "America/New_York"),
    marketState: row.marketStatus || "UNKNOWN", priceKind: "regular",
    currency: row.currencyType?.code || (domestic(symbol) ? "KRW" : "USD"),
    extended: extendedPrice > 0 ? { price: extendedPrice, tradedAt: iso(over.localTradedAt), session: over.tradingSessionType, ...changes(extendedPrice, price) } : null,
    source: domestic(symbol) ? "Naver Finance 정규장" : "Naver 해외 정규장",
  };
}
const alphaIds = new Map();
export async function alphaStock(symbol, ctx) {
  const cached = alphaIds.get(symbol);
  if (cached && Date.now() - cached.at < 86400000) return cached.row;
  const code = symbol.replace(/\.(KS|KQ)$/, "");
  const data = await request(`https://api.alphasquare.co.kr/data/v2/stock/stocks?keyword=${encodeURIComponent(code)}`,ctx);
  const matches = (data.data || []).filter(r => r.code === code && r.type === "stock" && r.is_alive !== false &&
    (domestic(symbol) ? r.market === (symbol.endsWith(".KQ") ? "kosdaq" : "kospi") : r.country_code === "US" && r.currency === "USD"));
  if (matches.length !== 1 || !Number.isInteger(matches[0].id)) throw new Error("INVALID_SYMBOL");
  if (alphaIds.size >= 500) alphaIds.delete(alphaIds.keys().next().value);
  alphaIds.set(symbol,{row:matches[0],at:Date.now()});
  return matches[0];
}
export async function alphaQuote(symbol, ctx) {
  const stock = await alphaStock(symbol,ctx);
  const data = await request(`https://api.alphasquare.co.kr/data/v3/prices/current-candle?stock-id=${stock.id}`,ctx);
  const row = data[stock.id];
  if (row?.code !== stock.code || row.stock_id !== stock.id) return null;
  const price = number(row.close);
  if (!(price > 0)) return null;
  // dt can refer to an extended session, so never use it to date the regular close.
  const candles = await alphaHistory(symbol,ctx,10);
  const last = candles.at(-1);
  if (!last || Math.abs(last.close-price) > Math.max(0.01,price*0.0001)) return null;
  return {
    price, ...changes(price,number(row.prev_close)), tradingDate:last.date, tradedAt:null,
    open: number(row.open), high: number(row.high), low: number(row.low), volume: number(row.volume),
    providerUpdatedAt:iso(row.dt),
    regularUpdatedAt:row.trading_session === "regular" ? iso(row.dt) : null,
    priceKind:"regular", currency:stock.currency,
    marketState:row.trading_session === "regular" ? "OPEN" : "CLOSE",
    extended: number(row.extended_price) > 0 && row.trading_session !== "regular" ?
      {price:number(row.extended_price),tradedAt:iso(row.dt),session:row.trading_session,...changes(number(row.extended_price),price)} : null,
    source:"AlphaSquare 정규장 (지연 여부 미확인)"
  };
}
export async function alphaHistory(symbol,ctx,days=120) {
  const stock = await alphaStock(symbol,ctx);
  const data = await request(`https://api.alphasquare.co.kr/data/v3/prices/candles/${stock.id}?freq=day&limit=${Math.min(days,1200)}&include_current_candle=true`,ctx);
  return rowsValid((data.data || []).map(([dt,open,high,low,close,volume]) => ({
    date:dateKey(dt,stock.timezone || (domestic(symbol) ? "Asia/Seoul":"America/New_York")),
    open:number(open),high:number(high),low:number(low),close:number(close),volume:number(volume)
  })));
}
export function parseStooqCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const keys = lines.shift().split(",").map(k=>k.trim().toLowerCase());
  return lines.map(line => Object.fromEntries(line.split(",").map((v,i)=>[keys[i],v.trim()])));
}
export async function stooqQuote(symbol,ctx) {
  if (domestic(symbol) || !/^[A-Z]+(?:-[A-Z])?$/.test(symbol)) return null;
  const id = symbol.toLowerCase() + ".us";
  const text = await request(`https://stooq.com/q/l/?s=${id}&f=sd2t2ohlcv&h&e=csv`,ctx,"text");
  const row = parseStooqCsv(text)[0];
  const price = number(row?.close);
  if (!(price > 0) || row?.symbol?.toUpperCase() !== id.toUpperCase() || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return null;
  const end = row.date.replaceAll("-","");
  const start = new Date(row.date);
  start.setUTCDate(start.getUTCDate()-20);
  const history = await request(`https://stooq.com/q/d/l/?s=${id}&i=d&d1=${start.toISOString().slice(0,10).replaceAll("-","")}&d2=${end}`,ctx,"text");
  const previous = parseStooqCsv(history).filter(r=>r.date < row.date && number(r.close)>0).sort((a,b)=>a.date.localeCompare(b.date)).at(-1);
  if (!previous) return null;
  return { price,...changes(price,number(previous.close)),tradingDate:row.date,tradedAt:null,priceKind:"regular",marketState:"UNKNOWN",source:"Stooq 지연",currency:"USD" };
}

