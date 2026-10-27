import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { naverQuote, dateKey } from "../lib/market-data.js";

const source=await readFile(new URL("../app.js",import.meta.url),"utf8");
function client() {
  let now=Date.parse("2026-10-27T14:00:00Z");
  class Clock extends Date { static now(){return now;} }
  const c={
    Date:Clock,liveQuotes:{},ohlcvHistory:{},samples:{},priceDates:{},marketDataState:{},
    marketDataRequests:{},historyFetchedAt:{},localFallbackSymbols:new Set(),
    elements:{ticker:{value:"NVDA"}},ensureSymbolData(){},recordDataAccess(){},render(){},
    getLiveQuote(t){return c.liveQuotes[t];},getTickerName(t){return t;},
    getTrackedMarketSymbols(){return ["NVDA","005930.KS"];},
    advance(ms){now+=ms;},setTime(value){now=Date.parse(value);}
  };
  const names=["formatPercent","getQuoteTimingLabel","hasAnalysisHistory","getCurrentPrice","getQuoteChange",
    "applyLiveQuote","getAnalysisRows","getAnalysisPrices","normalizeOhlcvSeries","fetchPriceHistory",
    "fetchSymbolMarketData","refreshTrackedMarketData","quoteIsStale","getDataStatusLabel"];
  vm.createContext(c);
  vm.runInContext(names.map(n=>source.match(new RegExp("(?:async )?function "+n+"\\([^]*?\\n\\}"))[0]).join("\n"),c);
  for(const t of c.getTrackedMarketSymbols()) {
    c.ohlcvHistory[t]=Array.from({length:5},(_,i)=>({date:"2026-10-"+(22+i),open:100,high:110,low:99,close:100,volume:1000}));
    c.samples[t]=[100,100,100,100,100];
    c.priceDates[t]=c.ohlcvHistory[t].map(r=>r.date);
  }
  return c;
}

test("percent formatting preserves small changes without signed zero",()=>{
  const c=client();
  for(const [value,expected] of [[-0.0000926,"-0.01%"],[0.0000926,"+0.01%"],[-0.000001,"-<0.01%"],[0.000001,"+<0.01%"],[0,"0.00%"],[-0,"0.00%"],[null,"-"],[NaN,"-"],[-0.01234,"-1.23%"]]) assert.equal(c.formatPercent(value),expected);
});

test("timing label separates provider updates, history, and unknown latency",()=>{
  const c=client();
  assert.match(c.getQuoteTimingLabel({priceKind:"history"}),/실시간 시세 아님/);
  assert.match(c.getQuoteTimingLabel({source:"AlphaSquare",regularUpdatedAt:"2026-10-27T14:00:00Z"}),/공급자 갱신 시각.*지연 여부 미확인/);
  assert.match(c.getQuoteTimingLabel({source:"Stooq 지연",tradingDate:"2026-10-26"}),/지연 시세/);
});

test("regular and extended quotes stay separate through pre/open/close/next day",()=>{
  for(const symbol of ["NVDA","005930.KS"]) {
    const c=client();
    const apply=(date,state,price,previous,extended=null)=>{
      const q=naverQuote({closePrice:price,compareToPreviousClosePrice:price-previous,localTradedAt:date,
        marketStatus:state,overMarketPriceInfo:extended ? {overPrice:extended,localTradedAt:date,tradingSessionType:"AFTER_MARKET"} : null},symbol);
      c.applyLiveQuote(symbol,{symbol,...q});return q;
    };
    const zone=symbol==="NVDA"?"-04:00":"+09:00";
    apply("2026-10-26T16:00:00"+zone,"CLOSE",100,98,103);
    assert.equal(c.getCurrentPrice(symbol),100);
    assert.equal(c.getAnalysisRows(symbol).length,5);
    apply("2026-10-27T10:00:00"+zone,"OPEN",105,100);
    assert.equal(c.getQuoteChange(symbol),0.05);
    assert.equal(c.getAnalysisRows(symbol).length,6);
    apply("2026-10-27T16:00:00"+zone,"CLOSE",106,100,108);
    assert.equal(c.getAnalysisRows(symbol).at(-1).close,106);
    assert.equal(c.getQuoteChange(symbol),0.06);
    c.ohlcvHistory[symbol]=Array.from(c.getAnalysisRows(symbol));
    // Next day's premarket still carries the previous regular close.
    apply("2026-10-27T16:00:00"+zone,"CLOSE",106,100,110);
    assert.equal(c.getAnalysisRows(symbol).length,6);
    apply("2026-10-28T10:00:00"+zone,"OPEN",109,106);
    assert.equal(c.getAnalysisRows(symbol).length,7);
    assert.equal(c.getAnalysisRows(symbol).at(-2).close,106);
    assert.equal(c.getQuoteChange(symbol),3/106);
  }
});

test("exchange date remains correct across US DST and Korean midnight",()=>{
  assert.equal(dateKey("2026-03-09T03:30:00Z"),"2026-03-08");
  assert.equal(dateKey("2026-11-02T04:30:00Z"),"2026-11-01");
  assert.equal(dateKey("2026-10-27T15:01:00Z","Asia/Seoul"),"2026-10-28");
});

test("late AlphaSquare updates cannot roll a regular quote backward",()=>{
  const c=client();
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:110,tradingDate:"2026-10-27",regularUpdatedAt:"2026-10-27T14:01:00Z"});
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:100,tradingDate:"2026-10-27",regularUpdatedAt:"2026-10-27T14:00:00Z"});
  assert.equal(c.getCurrentPrice("NVDA"),110);
});

test("closed weekend remains usable while stale open quotes warn",()=>{
  const c=client();c.setTime("2026-11-01T12:00:00Z");
  c.applyLiveQuote("NVDA",{symbol:"NVDA",price:100,tradingDate:"2026-10-30",marketState:"CLOSE"});
  assert.equal(c.quoteIsStale("NVDA"),false);
  c.liveQuotes.NVDA.marketState="OPEN";
  c.liveQuotes.NVDA.tradedAt="2026-10-30T20:00:00Z";
  assert.equal(c.quoteIsStale("NVDA"),true);
});

test("24 simulated hours: polling, outages, 429s, recovery and request cleanup",async()=>{
  const c=client();let step=0,quotes=0,histories=0;
  c.readMarketPayload=async path=>{
    const symbol=new URL(path,"http://localhost").searchParams.get("symbol");
    if(step>=30 && step<40)throw new Error("HTTP_429");
    if(step>=100 && step<110)throw new Error("UPSTREAM_NETWORK");
    if(path.includes("/history")){histories++;return {symbol,ohlcv:c.ohlcvHistory[symbol],source:"fixture"};}
    quotes++;
    return {symbol,price:100+step/100,previousClose:100,changePercent:step/10000,tradingDate:"2026-10-27",tradedAt:new Date(c.Date.now()).toISOString(),marketState:"OPEN"};
  };
  for(step=0;step<1440;step++) {
    const before=c.liveQuotes.NVDA?.price;
    await c.refreshTrackedMarketData();
    assert.equal(Object.keys(c.marketDataRequests).length,0);
    if((step>=30&&step<40)||(step>=100&&step<110)) {
      assert.equal(c.liveQuotes.NVDA.price,before);
      assert.match(c.getDataStatusLabel("NVDA"),/갱신 실패/);
    } else {
      assert.equal(c.liveQuotes.NVDA.price,100+step/100);
      assert.equal(c.marketDataState.NVDA.quoteError,"");
    }
    if(step===35)assert.equal(c.quoteIsStale("NVDA"),true);
    if(step===40)assert.equal(c.quoteIsStale("NVDA"),false);
    c.advance(60000);
  }
  assert.equal(quotes,2840);
  assert.ok(histories>400 && histories<600);
});

test("overlapping refresh requests are deduplicated",async()=>{
  const c=client();let calls=0,release;
  const gate=new Promise(resolve=>release=resolve);
  c.readMarketPayload=async()=>{calls++;await gate;return {symbol:"NVDA",price:101,tradingDate:"2026-10-27"};};
  const work=Array.from({length:12},()=>c.fetchSymbolMarketData("NVDA",{history:false}));
  release();await Promise.all(work);
  assert.equal(calls,1);assert.equal(Object.keys(c.marketDataRequests).length,0);
});
