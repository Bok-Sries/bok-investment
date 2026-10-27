import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { naverQuote, number, changes, rowsValid, context, alphaQuote, alphaHistory, stooqQuote, request } from "../lib/market-data.js";
import { yahooQuote } from "../api/quote.js";
import quoteHandler from "../api/quote.js";
import historyHandler, { historyWindow, filterHistory } from "../api/history.js";

const nativeFetch=globalThis.fetch;
const json=value=>new Response(JSON.stringify(value),{headers:{"content-type":"application/json"}});
async function mocked(fn, run) { globalThis.fetch=fn; try { await run(); } finally {globalThis.fetch=nativeFetch;} }
function response() { return {headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;}}; }
const candles=[
  [Date.parse("2026-10-20T04:00:00Z"),100,103,99,102,100],
  [Date.parse("2026-10-21T04:00:00Z"),102,104,101,103,110],
  [Date.parse("2026-10-22T04:00:00Z"),103,106,102,105,120],
  [Date.parse("2026-10-23T04:00:00Z"),105,106,99,100,130],
  [Date.parse("2026-10-26T04:00:00Z"),101,106,100,104,140],
];
const stock={id:9633,code:"NVDA",type:"stock",country_code:"US",currency:"USD",timezone:"America/New_York",is_alive:true};
test("number rejects missing data without rejecting zero",()=>{
  assert.equal(number(null),null); assert.equal(number(""),null);
  assert.equal(number(0),0); assert.equal(number("1,234.5"),1234.5);
});
test("Naver falling magnitudes and percentage are negative; extended remains separate",()=>{
  const q=naverQuote({closePrice:"100",compareToPreviousClosePrice:"5",fluctuationsRatio:"4.76",compareToPreviousPrice:{code:"5"},localTradedAt:"2026-10-26T16:00:00-04:00",overMarketPriceInfo:{overPrice:"101",localTradedAt:"2026-10-26T18:00:00-04:00",tradingSessionType:"AFTER_MARKET"}},"NVDA");
  assert.equal(q.change,-5); assert.equal(q.previousClose,105);
  assert.equal(q.changePercent,-5/105); assert.equal(q.price,100);
  assert.equal(q.extended.price,101); assert.equal(q.extended.changePercent,0.01);
  assert.equal(q.tradingDate,"2026-10-26");
});
test("Naver unchanged price is zero percent, missing price is rejected",()=>{
  assert.equal(naverQuote({closePrice:"100",compareToPreviousClosePrice:"0"},"AAPL").changePercent,0);
  assert.equal(naverQuote({closePrice:null},"AAPL"),null);
  assert.equal(changes(100,0).changePercent,null);
});
test("AlphaSquare matches the exact security ID and dates regular close from daily candles",async()=>{
  await mocked(async url=>{
    if(url.includes("/stocks?")) return json({data:[{...stock,id:9,code:"NVDL"},stock]});
    if(url.includes("current-candle")) return json({"9633":{stock_id:9633,code:"NVDA",close:104,prev_close:100,dt:Date.parse("2026-10-27T08:00:00Z"),extended_price:106,trading_session:"pre"}});
    return json({data:candles});
  },async()=>{
    const q=await alphaQuote("NVDA",context());
    assert.equal(q.price,104); assert.equal(q.changePercent,0.04);
    assert.equal(q.extended.price,106); assert.equal(q.tradingDate,"2026-10-26");
    assert.equal(q.tradedAt,null);
    const rows=await alphaHistory("NVDA",context(),740);
    assert.equal(rows.length,5); assert.equal(rows[0].date,"2026-10-20");
  });
});
test("AlphaSquare rejects data belonging to a different internal ID",async()=>{
  await mocked(async()=>json({"9633":{stock_id:5930,code:"DHCNL",close:18}}),async()=>assert.equal(await alphaQuote("NVDA",context()),null));
});
test("Stooq uses previous session close, never today's open",async()=>{
  await mocked(async url=>new Response(url.includes("/q/d/") ?
    "Date,Open,High,Low,Close,Volume\n2026-10-23,90,101,89,100,123\n2026-10-26,120,125,105,110,456" :
    "Symbol,Date,Time,Open,High,Low,Close,Volume\nNVDA.US,2026-10-26,22:00:00,120,125,105,110,456"),
    async()=>{const q=await stooqQuote("NVDA",context());assert.equal(q.change,10);assert.equal(q.changePercent,0.1);});
});
test("Stooq rejects an absent previous close instead of inventing a return",async()=>{
  await mocked(async url=>new Response(url.includes("/q/d/") ? "Date,Close\n2026-10-26,110" : "Symbol,Date,Time,Open,High,Low,Close,Volume\nNVDA.US,2026-10-26,22:00:00,120,125,105,110,456"),
    async()=>assert.equal(await stooqQuote("NVDA",context()),null));
});
test("Yahoo 5d chartPreviousClose does not replace yesterday's close",async()=>{
  await mocked(async()=>json({chart:{result:[{meta:{regularMarketPrice:104,regularMarketTime:Date.parse("2026-10-26T20:00:00Z")/1000,chartPreviousClose:80,exchangeTimezoneName:"America/New_York"},timestamp:candles.map(r=>r[0]/1000),indicators:{quote:[{close:candles.map(r=>r[4])}]}}]}}),
    async()=>{const q=await yahooQuote("NVDA",context());assert.equal(q.previousClose,100);assert.equal(q.changePercent,0.04);});
});
test("normalization rejects null candles and sorts/deduplicates dates",()=>{
  const rows=candles.map(([dt,open,high,low,close,volume])=>({date:new Date(dt).toISOString().slice(0,10),open,high,low,close,volume}));
  assert.equal(rowsValid([{...rows[0],open:null},...rows.reverse(),rows[0]]).length,5);
});
test("provider failure yields 503 with causes; not a fictitious quote",async()=>{
  await mocked(async()=>new Response("limited",{status:429}),async()=>{
    const res=response();await quoteHandler({url:"/api/quote?symbol=FAIL",headers:{}},res);
    assert.equal(res.code,503);assert.equal(res.body.code,"QUOTE_UNAVAILABLE");
    assert.ok(res.body.failures.some(f=>f.code==="HTTP_429"));
    assert.equal(res.headers["Cache-Control"],"no-store");
  });
});
test("NY stock fallback selects .N and caches only successful results",async()=>{
  let calls=0;
  await mocked(async url=>{calls++;return url.includes("IBM.O")?new Response("",{status:404}):json({reutersCode:"IBM.N",symbolCode:"IBM",closePrice:"100",compareToPreviousClosePrice:"-5",localTradedAt:"2026-10-26T16:00:00-04:00"});},async()=>{
    for(let i=0;i<2;i++){const res=response();await quoteHandler({url:"/api/quote?symbol=IBM",headers:{}},res);assert.equal(res.code,200);assert.equal(res.body.change,-5);}
    assert.equal(calls,2);
  });
});
test("history fallback to AlphaSquare honors long range",async()=>{
  let limit="";
  await mocked(async url=>{
    if(url.includes("naver")) return new Response("",{status:429});
    if(url.includes("candles")){limit=new URL(url).searchParams.get("limit");return json({data:candles});}
    return json({data:[stock]});
  },async()=>{const res=response();await historyHandler({url:"/api/history?symbol=NVDA&range=2y",headers:{}},res);assert.equal(res.code,200);assert.equal(limit,"741");assert.equal(res.body.prices.length,res.body.ohlcv.length);});
});
test("fetch timeout aborts the underlying request",async()=>{
  await mocked((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener("abort",()=>reject(Object.assign(new Error("aborted"),{name:"AbortError"})))),async()=>{
    await assert.rejects(request("https://example.test",context(10)),/UPSTREAM_TIMEOUT/);
  });
});
const source=await readFile(new URL("../app.js",import.meta.url),"utf8");
function client() {
  const names=["formatPercent","getQuoteTimingLabel","hasAnalysisHistory","getCurrentPrice","getQuoteChange","applyLiveQuote","getAnalysisPrices","getAnalysisRows","normalizeOhlcvSeries","fetchPriceHistory","fetchSymbolMarketData","refreshTrackedMarketData","quoteIsStale","getDataStatusLabel","getAnalysisVolumes","checkSignalChanges"];
  const code=names.map(name=>source.match(new RegExp("(?:async )?function "+name+"\\([^]*?\\n\\}"))[0]).join("\n");
  const rows=candles.map(([dt,open,high,low,close,volume])=>({date:new Date(dt).toISOString().slice(0,10),open,high,low,close,volume}));
  const c={liveQuotes:{},samples:{NVDA:rows.map(r=>r.close)},ohlcvHistory:{NVDA:rows},priceDates:{NVDA:rows.map(r=>r.date)},sampleDates:[],
    marketDataState:{},marketDataRequests:{},historyFetchedAt:{},localFallbackSymbols:new Set(),Date,Number,Promise,
    ensureSymbolData(){},recordDataAccess(){},getLiveQuote(t){return c.liveQuotes[t];},render(){},getTickerName(t){return t;},
    elements:{ticker:{value:"NVDA"}},getTrackedMarketSymbols(){return ["NVDA"];},};
  vm.createContext(c);vm.runInContext(code,c);return c;
}
test("same-day quote updates only today's candle and does not mutate history",()=>{
  const c=client();const old=JSON.stringify(c.ohlcvHistory);
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:106,tradingDate:"2026-10-26",priceKind:"regular"});
  assert.equal(c.getAnalysisPrices("NVDA").at(-1),106);
  assert.equal(c.getAnalysisPrices("NVDA")[0],102);
  assert.equal(JSON.stringify(c.ohlcvHistory),old);
  assert.equal(c.getAnalysisRows("NVDA").at(-1).high,106);
});
test("new session appends a candle; quote duplicates don't append twice",()=>{
  const c=client();
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:110,tradingDate:"2026-10-27",priceKind:"regular",open:108,high:112,low:107,volume:500});
  for(let i=0;i<2;i++){const rows=c.getAnalysisRows("NVDA");assert.equal(rows.length,6);assert.equal(rows.at(-2).close,104);assert.equal(rows.at(-1).volume,500);}
});
test("older quotes cannot overwrite a newer session",()=>{
  const c=client();c.applyLiveQuote("NVDA",{symbol:"NVDA",price:110,tradingDate:"2026-10-27"});
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:90,tradingDate:"2026-10-23"});
  assert.equal(c.getCurrentPrice("NVDA"),110);
});
test("missing percentage is unknown, not calculated from sample prices",()=>{
  const c=client();c.applyLiveQuote("NVDA",{symbol:"NVDA",price:110,tradingDate:"2026-10-27",changePercent:null});
  assert.equal(c.getQuoteChange("NVDA"),null);
});
test("late history response preserves the newer quote",async()=>{
  const c=client();
  c.readMarketPayload=async()=>({symbol:"NVDA",ohlcv:c.ohlcvHistory.NVDA,source:"Naver 일봉"});
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:110,tradingDate:"2026-10-27",priceKind:"regular"});
  await c.fetchPriceHistory("NVDA");
  assert.equal(c.getAnalysisPrices("NVDA").at(-1),110);
});
test("failed refresh preserves last price and displays a per-symbol error",async()=>{
  const c=client();c.applyLiveQuote("NVDA",{symbol:"NVDA",price:110,tradingDate:"2026-10-27"});
  c.readMarketPayload=async()=>{throw new Error("HTTP_429");};
  await c.fetchSymbolMarketData("NVDA");
  assert.equal(c.getCurrentPrice("NVDA"),110);
  assert.match(c.getDataStatusLabel("NVDA"),/HTTP_429/);
});
test("history refresh is periodic even when candles already exist",async()=>{
  const c=client();let seen;
  c.fetchSymbolMarketData=async(t,opts)=>{seen=opts.history;};
  c.historyFetchedAt.NVDA=Date.now()-6*60000;
  await c.refreshTrackedMarketData();assert.equal(seen,true);
});
test("a fresh fetch cannot make an ancient quote fresh",()=>{
  const c=client();c.liveQuotes.NVDA={tradingDate:"2020-01-01",receivedAt:Date.now()};
  assert.equal(c.quoteIsStale("NVDA"),true);
});

test("quote-only state never uses seeded history for analysis or alerts",()=>{
  const c=client();
  delete c.ohlcvHistory.NVDA;
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:216,tradingDate:"2026-10-26"});
  assert.equal(c.getCurrentPrice("NVDA"),216);
  assert.equal(c.getAnalysisRows("NVDA").length,0);
  assert.equal(c.hasAnalysisHistory("NVDA"),false);
  assert.match(c.getDataStatusLabel("NVDA"),/분석 보류/);
  assert.doesNotThrow(()=>c.checkSignalChanges("NVDA"));
  delete c.liveQuotes.NVDA;
  assert.equal(c.getCurrentPrice("NVDA"),null);
});

test("open regular provider updates are fresh without claiming a trade timestamp",()=>{
  const c=client(), now=Date.now();
  c.liveQuotes.NVDA={receivedAt:now,tradingDate:new Date(now).toISOString().slice(0,10),marketState:"OPEN",tradedAt:null,regularUpdatedAt:new Date(now).toISOString()};
  assert.equal(c.quoteIsStale("NVDA"),false);
  c.liveQuotes.NVDA.regularUpdatedAt=new Date(now-21*60000).toISOString();
  assert.equal(c.quoteIsStale("NVDA"),true);
  c.liveQuotes.NVDA.regularUpdatedAt="invalid";
  assert.equal(c.quoteIsStale("NVDA"),true);
  c.liveQuotes.NVDA.regularUpdatedAt=null;
  c.liveQuotes.NVDA.providerUpdatedAt=new Date(now).toISOString();
  assert.equal(c.quoteIsStale("NVDA"),true);
});

test("AlphaSquare only qualifies regular session updates for freshness",async()=>{
  for(const session of ["regular","pre","post"]) {
    await mocked(async url=>url.includes("current-candle")
      ? json({"9633":{stock_id:9633,code:"NVDA",close:104,prev_close:100,dt:candles.at(-1)[0],trading_session:session}})
      : url.includes("/stocks?") ? json({data:[stock]}) : json({data:candles}),
    async()=>{
      const q=await alphaQuote("NVDA",context());
      assert.equal(q.tradedAt,null);
      assert.equal(q.regularUpdatedAt,session==="regular" ? new Date(candles.at(-1)[0]).toISOString() : null);
    });
  }
});

test("history window uses market dates and inclusive bounds across leap day and DST",()=>{
  const now=Date.parse("2024-03-11T02:00:00Z");
  const us=historyWindow("NVDA",11,now),kr=historyWindow("005930.KS",11,now);
  assert.deepEqual(us,{start:"2024-02-28",end:"2024-03-10"});
  assert.deepEqual(kr,{start:"2024-02-29",end:"2024-03-11"});
  const rows=["2024-02-27","2024-02-28","2024-02-29","2024-03-10","2024-03-11"].map(date=>({date,open:100,high:101,low:99,close:100,volume:10}));
  assert.deepEqual(filterHistory(rows,us).map(r=>r.date),["2024-02-28","2024-02-29","2024-03-10"]);
});

test("all history providers return the same inclusive dates for every supported range",async()=>{
  for (const [range,days] of [["3mo",120],["1y",370],["2y",740],["3y",1110]]) {
    const window=historyWindow("NVDA",days);
    const shift=(date,n)=>new Date(Date.parse(date+"T12:00:00Z")+n*86400000).toISOString().slice(0,10);
    const dates=[shift(window.start,-1),window.start,shift(window.start,1),shift(window.start,2),shift(window.end,-1),window.end,shift(window.end,1)];
    const expected=dates.slice(1,-1);
    for (const provider of ["naver","alpha","yahoo"]) {
      await mocked(async url=>{
        if(url.includes("naver")) return provider==="naver" ? json(dates.map(date=>({localDate:date.replaceAll("-",""),openPrice:100,highPrice:102,lowPrice:99,closePrice:101,accumulatedTradingVolume:1000}))) : new Response("",{status:429});
        if(url.includes("/stocks?")) return json({data:[stock]});
        if(url.includes("/candles/")) return provider==="alpha" ? json({data:dates.map(date=>[Date.parse(date+"T16:00:00Z"),100,102,99,101,1000])}) : new Response("",{status:429});
        const query=new URL(url).searchParams;
        assert.ok(query.has("period1"));assert.ok(query.has("period2"));assert.equal(query.has("range"),false);
        return json({chart:{result:[{meta:{exchangeTimezoneName:"America/New_York"},timestamp:dates.map(date=>Date.parse(date+"T16:00:00Z")/1000),indicators:{quote:[{open:dates.map(()=>100),high:dates.map(()=>102),low:dates.map(()=>99),close:dates.map(()=>101),volume:dates.map(()=>1000)}]}}]}});
      },async()=>{
        const res=response();await historyHandler({url:"/api/history?symbol=NVDA&range="+range,headers:{}},res);
        assert.equal(res.code,200);assert.deepEqual(res.body.dates,expected,provider+" "+range);
      });
    }
  }
});

