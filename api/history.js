import { domestic, number, dateKey, context, request, attempt, rowsValid, alphaHistory } from "../lib/market-data.js";

export function historyWindow(symbol, days, now = Date.now()) {
  const end = dateKey(now, domestic(symbol) ? "Asia/Seoul" : "America/New_York");
  const start = new Date(end + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() - days);
  return { start: start.toISOString().slice(0, 10), end };
}

export function filterHistory(rows, window) {
  return rowsValid(rows || []).filter(row => row.date >= window.start && row.date <= window.end);
}

async function naverHistory(symbol,window,ctx) {
  const { start, end } = window;
  const compact=d=>d.replaceAll("-","");
  if (domestic(symbol)) {
    const text=await request(`https://api.finance.naver.com/siseJson.naver?symbol=${symbol.slice(0,-3)}&requestType=1&startTime=${compact(start)}&endTime=${compact(end)}&timeframe=day`,ctx,"text");
    return rowsValid([...text.matchAll(/\["(\d{8})",\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/g)].map(m=>({
      date:`${m[1].slice(0,4)}-${m[1].slice(4,6)}-${m[1].slice(6,8)}`,
      open:number(m[2]),high:number(m[3]),low:number(m[4]),close:number(m[5]),volume:number(m[6])
    })));
  }
  if (!/^[A-Z]+(?:-[A-Z])?$/.test(symbol)) return null;
  for (const suffix of [".O",".N"]) {
    const rows=await attempt(ctx,"Naver history"+suffix,async()=>{
      const data=await request(`https://api.stock.naver.com/chart/foreign/item/${encodeURIComponent(symbol+suffix)}/day?startDateTime=${compact(start)}&endDateTime=${compact(end)}`,ctx);
      if (!Array.isArray(data)) return null;
      const parsed=rowsValid(data.map(r=>({date:String(r.localDate).replace(/^(\d{4})(\d{2})(\d{2})$/,"$1-$2-$3"),open:number(r.openPrice),high:number(r.highPrice),low:number(r.lowPrice),close:number(r.closePrice),volume:number(r.accumulatedTradingVolume)})));
      return parsed.length>=5 ? parsed : null;
    });
    if (rows) return rows;
  }
  return null;
}
export default async function handler(req,res) {
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Access-Control-Allow-Origin","*");
  const url=new URL(req.url,`http://${req.headers.host || "localhost"}`);
  const symbol=url.searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol || !/^[A-Z0-9.-]{1,30}$/.test(symbol)) return res.status(400).json({error:"Invalid symbol"});
  const range=url.searchParams.get("range") || "3mo";
  const days=({"1y":370,"2y":740,"3y":1110})[range] || 120;
  const window=historyWindow(symbol,days);
  const ctx=context();
  const providers=[
    ["Naver 일봉",()=>naverHistory(symbol,window,ctx)],
    ["AlphaSquare 일봉",()=>alphaHistory(symbol,ctx,days+1)],
    ["Yahoo Finance 일봉",async()=>{
      // Pad UTC boundaries, then filter by each candle's exchange-local date.
      const period1=Date.parse(window.start+"T00:00:00Z")/1000-86400;
      const period2=Date.parse(window.end+"T00:00:00Z")/1000+2*86400;
      const data=await request(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d`,ctx);
      const row=data.chart?.result?.[0];
      const q=row?.indicators?.quote?.[0] || {};
      return rowsValid((row?.timestamp || []).map((t,i)=>({date:dateKey(t*1000,row.meta.exchangeTimezoneName),open:number(q.open?.[i]),high:number(q.high?.[i]),low:number(q.low?.[i]),close:number(q.close?.[i]),volume:number(q.volume?.[i])})));
    }]
  ];
  for (const [source,fetchRows] of providers) {
    const rows=await attempt(ctx,source,async()=>{ const r=filterHistory(await fetchRows(),window); return r.length>=5 ? r : null; });
    if (rows) return res.status(200).json({symbol,prices:rows.map(r=>r.close),dates:rows.map(r=>r.date),ohlcv:rows,source,fetchedAt:new Date().toISOString(),failures:ctx.errors});
  }
  return res.status(503).json({symbol,error:"일봉을 가져오지 못했습니다",code:"HISTORY_UNAVAILABLE",failures:ctx.errors});
}
