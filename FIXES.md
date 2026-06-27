# 🔧 코드 개선 및 버그 수정 보고서

## 📋 발견 및 수정된 문제점

### 1️⃣ **server.js - 코드 중복 & 보안 취약점**

#### 문제:
- ❌ API 응답 객체를 5번 반복 생성 (DRY 위반)
- ❌ 경로 순회 공격(Path Traversal) 가능: `decodeURIComponent` 후 `normalize` 체크 불완전
- ❌ CORS 헤더 여러 번 설정 (비효율)

#### 수정:
✅ `createApiResponse()` 팩토리 함수로 중복 제거
✅ 라우팅 객체(`apiHandlers`) 활용으로 코드 간결화
✅ 경로 검증 강화:
```javascript
// normalize → 절대 경로 검증 순서 변경
const filePath = normalize(join(root, pathname));
const resolvedRoot = normalize(root);
if (!filePath.startsWith(resolvedRoot + "/") && filePath !== resolvedRoot) {
  // 거부
}
```
✅ CORS 헤더 한 곳에서 관리
✅ 권한 오류(`EACCES`) 처리 추가

---

### 2️⃣ **api/quote.js - 타임아웃 & 캐시 관리 & 검증**

#### 문제:
- ❌ `fetch`에 타임아웃 없음 → 외부 API 응답 없으면 무한 대기
- ❌ `quoteCache` 무한 증가 → 메모리 누수 (LRU/TTL 없음)
- ❌ `symbol` 파라미터 검증 없음
- ❌ 에러를 묵음처리 (로깅 없음)

#### 수정:
✅ 타임아웃 래퍼 함수 추가 (7초 제한):
```javascript
function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
  ]);
}
```

✅ 캐시 크기 제한 (`QUOTE_CACHE_MAX_SIZE = 100`)
```javascript
function maintainCacheSize() {
  if (quoteCache.size > QUOTE_CACHE_MAX_SIZE) {
    const firstKey = quoteCache.keys().next().value;
    if (firstKey) quoteCache.delete(firstKey); // FIFO 방식 제거
  }
}
```

✅ 파라미터 검증:
```javascript
// 비어있음 확인, trim 적용
if (!symbol) { /* error */ }
// 형식 검증 (alphanumeric, 점, 대시만)
if (!/^[A-Za-z0-9\.\-]+$/.test(symbol)) { /* error */ }
```

✅ 모든 fetch에 try-catch 및 로깅 추가:
```javascript
try {
  const response = await fetchWithTimeout(url, {...});
  // ...
} catch (error) {
  console.warn(`Fetch failed for ${symbol}:`, error.message);
  return null;
}
```

---

### 3️⃣ **api/history.js - 동일한 개선**

#### 수정:
✅ `fetchWithTimeout` 추가 (8초 제한)
✅ 모든 fetch 함수에 try-catch 및 로깅
✅ `symbol` 파라미터 검증 추가
✅ 에러 로깅 개선

---

### 4️⃣ **app.js - 메모리 누수 방지**

#### 문제:
- ❌ `liveQuotes`, `stockNews`, `ohlcvHistory`, `priceDates` 등 글로벌 객체가 무한 증가
- ❌ 프런트엔드는 메모리 정리 로직 없음
- ❌ 오래된 데이터가 삭제되지 않음

#### 수정:
✅ 메모리 제한 및 자동 정리 메커니즘:
```javascript
const MEMORY_LIMITS = {
  liveQuotes: 50,     // 최대 50개 종목
  stockNews: 50,
  ohlcvHistory: 50,
  priceDates: 50,
};
const OBJECT_LAST_ACCESS = new Map(); // 접근 시간 추적
```

✅ 30초마다 자동 정리:
```javascript
setInterval(() => {
  cleanupMemoryCaches();
}, 30000);
```

✅ 정리 로직:
- 워치리스트/현재 선택 종목은 보호
- 한계 초과 시 접근 시간 가장 오래된 항목부터 20% 삭제
- 보호되지 않은 항목만 정리

✅ 데이터 접근 시 시간 기록:
```javascript
function getLiveQuote(ticker) {
  if (ticker) recordDataAccess(ticker);
  return liveQuotes[ticker] || null;
}
```

---

## 📊 개선 효과

| 항목 | 이전 | 이후 |
|------|------|------|
| **API 응답 객체 코드** | 155줄 (중복) | 30줄 (팩토리) |
| **Fetch 타임아웃** | ❌ 없음 | ✅ 7-8초 |
| **캐시 한계** | ❌ 무제한 | ✅ 100-50개 항목 |
| **메모리 정리** | ❌ 없음 | ✅ 30초마다 자동 |
| **경로 순회 공격** | ⚠️ 취약 | ✅ 강화됨 |
| **에러 처리** | ❌ 묵음 | ✅ 로깅 포함 |

---

## 🎯 주요 개선 사항 정리

1. **보안**: 경로 순회 공격 방지, 파라미터 검증
2. **안정성**: 타임아웃 추가로 무한 대기 방지
3. **성능**: 메모리 캐시 자동 정리로 메모리 누수 해결
4. **유지보수**: 코드 중복 제거, 일관된 에러 처리
5. **디버깅**: 에러 로깅 추가로 문제 추적 용이

---

## ⚠️ 추가 권장사항

1. **데이터베이스 도입**: 현재 메모리 기반 저장소 → Redis/Mongo 검토
2. **요청 중복 방지**: 동일 ticker에 대해 여러 요청이 발생할 수 있음 → 요청 큐잉 메커니즘
3. **API 속도 제한**: 외부 API 호출 빈도 제어 필요
4. **모니터링**: 메모리 사용량, 캐시 히트율 추적

