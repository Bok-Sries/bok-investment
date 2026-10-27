import { domestic, number, dateKey, iso, changes, context, request, attempt, naverQuote, alphaQuote, stooqQuote } from "../lib/market-data.js";

const cache = new Map();
const pending = new Map();

export async function yahooQuote(symbol, ctx) {
  const data = await request(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`,ctx);
  const row = data.chart?.result?.[0];
  const meta = row?.meta;
  const price = number(meta?.regularMarketPrice);
  const tradedAt = iso(number(meta?.regularMarketTime) * 1000);
  const zone = meta?.exchangeTimezoneName || (domestic(symbol) ? "Asia/Seoul" : "America/New_York");
  const tradingDate = dateKey(tradedAt,zone);
  if (!(price > 0) || !tradingDate) return null;
  const closes = row.indicators?.quote?.[0]?.close || [];
  const previous = (row.timestamp || []).map((t,i)=>({date:dateKey(t*1000,zone),price:number(closes[i])}))
    .filter(r=>r.date < tradingDate && r.price > 0).at(-1)?.price;
  // chartPreviousClose is the start-of-range close, not necessarily yesterday's close.
  return {price,...changes(price,number(meta.previousClose) ?? previous),tradedAt,tradingDate,
    open:number(row.indicators?.quote?.[0]?.open?.at(-1)), high:number(meta.regularMarketDayHigh),
    low:number(meta.regularMarketDayLow), volume:number(meta.regularMarketVolume),
    marketState:"UNKNOWN",priceKind:"regular",currency:meta.currency,source:"Yahoo Finance 지연"};
}

async function load(symbol) {
  const ctx = context();
  let payload;
  if (domestic(symbol)) {
    payload = await attempt(ctx,"Naver",async()=>{
      const data = await request(`https://polling.finance.naver.com/api/realtime/domestic/stock/${symbol.slice(0,-3)}`,ctx);
      const row = data.datas?.find(r=>r.itemCode===symbol.slice(0,-3));
      return row && naverQuote(row,symbol);
    });
  } else if (/^[A-Z]+(?:-[A-Z])?$/.test(symbol)) {
    for (const suffix of [".O",".N"]) {
      payload = await attempt(ctx,"Naver"+suffix,async()=>{
        const id = symbol + suffix;
        const row = await request(`https://api.stock.naver.com/stock/${encodeURIComponent(id)}/basic`,ctx);
        if (row.reutersCode !== id || row.symbolCode !== symbol) return null;
        return naverQuote(row,symbol);
      });
      if (payload) break;
    }
  }
  if (!payload) payload = await attempt(ctx,"AlphaSquare",()=>alphaQuote(symbol,ctx));
  if (!payload) payload = await attempt(ctx,"Yahoo",()=>yahooQuote(symbol,ctx));
  if (!payload) payload = await attempt(ctx,"Stooq",()=>stooqQuote(symbol,ctx));
  if (!payload) return {error:"시세를 가져오지 못했습니다",code:"QUOTE_UNAVAILABLE",symbol,failures:ctx.errors};
  return {symbol,...payload,fetchedAt:new Date().toISOString(),failures:ctx.errors};
}

export default async function handler(req,res) {
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Access-Control-Allow-Origin","*");
  const symbol = new URL(req.url,`http://${req.headers.host || "localhost"}`).searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol || !/^[A-Z0-9.-]{1,30}$/.test(symbol)) return res.status(400).json({error:"Invalid symbol"});
  const cached=cache.get(symbol);
  if (cached && Date.now()-cached.at<25000) return res.status(200).json(cached.body);
  if (!pending.has(symbol)) pending.set(symbol,load(symbol).finally(()=>pending.delete(symbol)));
  const body=await pending.get(symbol);
  if (body.error) return res.status(503).json(body);
  if (cache.size>=100) cache.delete(cache.keys().next().value);
  cache.set(symbol,{body,at:Date.now()});
  return res.status(200).json(body);
}
