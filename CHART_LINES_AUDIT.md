# 🔍 차트 수평선 점검 리포트

## 📊 **그려지는 4개의 수평선**

| 순서 | 선 | 라인 | 색상 | 계산식 | 상태 |
|------|-----|------|------|--------|------|
| 1 | 돌파 기준 | `breakoutLine` | 🟢 Green | `Math.max(...closes.slice(-6, -1))` | ✅ |
| 2 | 세력 평단 | `forceAveragePrice` | 🔵 Teal | `(baseCandle.high + low + close) / 3` | ❓ |
| 3 | 매수라인 | `buyLine` | 🔵 Cyan | 복잡한 조건부 로직 | ❓ |
| 4 | 손절 기준 | `riskLine` | 🔴 Red | `Math.min(criteriaLow, criteriaSupport)` | ✅ |

---

## 🔧 **각 선의 현재 구현 분석**

### **1️⃣ 돌파 기준 (breakoutLine) - ✅ 정상**

#### 코드 (라인 2987)
```javascript
const breakoutLine = Math.max(...closes.slice(-6, -1));
```

#### 의미
- 최근 6일(최종일 제외) 중 **최고 종가**
- 저항선을 뚫으면 상승 신호
- 박스권 돌파의 기준점

#### 점검 결과
✅ **정상**: 박스권 상단을 정확히 나타냄

---

### **2️⃣ 세력 평단 (forceAveragePrice) - ⚠️ 검토 필요**

#### 코드 (라인 2550)
```javascript
const baseCandle = [...accumulationCandidates].sort((a, b) => b.forceScore - a.forceScore)[0] || latest;
const forceAveragePrice = (baseCandle.high + baseCandle.low + baseCandle.close) / 3;
```

#### 의미
- 거래량 1.12배 이상의 "기준봉"을 찾음
- 그 봉의 (고가+저가+종가)/3 = 세력 평단
- 세력이 물량을 확보한 평균 가격

#### 문제점 분석
❌ **문제 1**: baseCandle이 "지난 10일 중" 최고 거래량 봉
- 실제 세력 평단: 최근 매집 구간의 모든 봉을 평균해야 함
- 현재: 한 개의 봉만 기준 → 부정확

❌ **문제 2**: (high + low + close) / 3 계산법
- 실제 세력 매집: 주로 "저가 근처"에서 확보
- 개선안: (baseCandle.low + baseCandle.close) / 2 또는 baseCandle.low 자체

#### 점검 결과
⚠️ **개선 필요**: 더 정확한 세력 평단 계산 방식 필요

---

### **3️⃣ 매수라인 (buyLine) - ⚠️ 복잡한 로직**

#### 코드 (라인 2595-2609)
```javascript
const riskLine = Math.min(criteriaLow, criteriaSupport);
const riskDistance = (latest.close - riskLine) / latest.close;
const pullbackBuyLine = Math.max(riskLine, Math.min(latest.close, sma3));

const buyLine =
  latest.close > recentHigh && latest.volumeRatio >= 1.05
    ? Math.max(latest.close * 0.985, pullbackBuyLine)
    : pullbackDepth <= 0.055
      ? pullbackBuyLine
      : Math.min(breakoutBuyLine, latest.close * 1.015);
```

#### 의미
세 가지 상황에 따라 다른 매수라인:
1. **돌파 후 눌림**: `현재가 * 0.985`
2. **정상 눌림 (≤5.5%)**: `3일선 기반`
3. **전고점 돌파 준비**: `전고점 돌파 가격`

#### 문제점 분석
⚠️ **문제**: 단테기법에서 명확한 "매수라인" 정의가 없음
- 단테기법: "눌림목 진입"은 정의했지만 "정확한 가격"은 아님
- 현재: 복합 로직으로 너무 복잡

#### 점검 결과
⚠️ **재검토 필요**: 단테기법의 "눌림목 진입" 정의 명확화 필요

---

### **4️⃣ 손절 기준 (riskLine) - ✅ 개선 완료**

#### 코드 (라인 2593-2607)
```javascript
const criteriaLow = baseCandle.low;           // 기준봉 저가
const criteriaSupport = supportLine;          // 지지선
const isVolumeDryUp = volumeDryUp;            // 거래량 실종 여부
const riskLine = Math.min(criteriaLow, criteriaSupport);
```

#### 의미
- 기준봉저가와 지지선 중 **더 낮은 값** = 손절선
- 거래량 실종 시 별도 경고

#### 점검 결과
✅ **정상**: 단테기법의 손절 원칙을 정확히 구현

---

## 📋 **수평선 계산 근거 검증**

### **돌파 기준 (breakoutLine)**

| 항목 | 단테기법 | 현재 구현 | 일치도 |
|------|---------|---------|--------|
| **정의** | 최근 저항선 = 박스권 상단 | 최근 6일 최고 종가 | ✅ 일치 |
| **신호** | 이 가격 뚫리면 상승 신호 | O | ✅ 맞음 |
| **사용처** | 박스권 돌파 진입 기준 | O | ✅ 맞음 |

### **세력 평단 (forceAveragePrice)**

| 항목 | 단테기법 | 현재 구현 | 일치도 |
|------|---------|---------|--------|
| **정의** | 세력의 평균 확보가 | (고+저+종)/3 한 봉만 | ⚠️ 부정확 |
| **신호** | 세력 평단 근처에서 분할 매수 | O | ✅ 맞음 |
| **정확성** | 정밀한 계산 필요 | 단순화됨 | ⚠️ 개선 필요 |

### **매수라인 (buyLine)**

| 항목 | 단테기법 | 현재 구현 | 일치도 |
|------|---------|---------|--------|
| **정의** | 눌림목 진입점 | 조건부 3가지 계산 | ⚠️ 명확하지 않음 |
| **신호** | 눌림목 = 최적 진입 | O | ✅ 기본 맞음 |
| **정확성** | 눌림목이라는 개념 자체가 모호 | 명확한 정의 필요 | ⚠️ 재검토 필요 |

### **손절 기준 (riskLine)**

| 항목 | 단테기법 | 현재 구현 | 일치도 |
|------|---------|---------|--------|
| **정의** | 기준봉저가 & 지지선 | 둘 중 낮은 값 | ✅ 일치 |
| **신호** | 하나라도 이탈하면 손절 | O | ✅ 맞음 |
| **정확성** | 명확한 규칙 | 명확히 구현 | ✅ 정상 |

---

## 🎯 **문제점 요약**

### **즉시 개선 필요:**

#### ❌ **세력 평단 계산법 재검토**
```javascript
// 현재 (부정확)
const forceAveragePrice = (baseCandle.high + baseCandle.low + baseCandle.close) / 3;

// 개선안 1: 저가와 종가의 평균
const forceAveragePrice = (baseCandle.low + baseCandle.close) / 2;

// 개선안 2: 저가 자체 (가장 정확)
const forceAveragePrice = baseCandle.low;
```

**이유**: 
- 세력이 물량을 "저가"에서 확보
- 고가는 매물대 테스트일 가능성 높음
- (고+저+종)/3은 평균일 뿐 의미 없음

#### ⚠️ **매수라인 정의 명확화**
```javascript
// 현재: 복잡한 조건부 로직
// 문제: 단테기법에서 "매수라인"의 정확한 정의가 없음

// 개선안: 눌림목의 정의를 명확히 하기
// 눌림목 = "고점 대비 3~5.5% 내려온 지점"
const pullbackThreshold = 0.035; // 3.5% 눌림
const pullbackBuyLine = recentHigh * (1 - pullbackThreshold);
```

---

## 📊 **현재 상태 평가**

| 선 | 정확도 | 신뢰도 | 개선 필요 |
|-----|-------|--------|---------|
| 🟢 돌파 기준 | ⭐⭐⭐⭐⭐ | 매우 높음 | ✅ 불필요 |
| 🔵 세력 평단 | ⭐⭐⭐ | 중간 | ❌ 필요 |
| 🔵 매수라인 | ⭐⭐⭐⭐ | 높음 | ⚠️ 검토 |
| 🔴 손절 기준 | ⭐⭐⭐⭐⭐ | 매우 높음 | ✅ 불필요 |

---

## 🚀 **개선 우선순위**

| 순위 | 항목 | 영향도 | 난이도 | 권장도 |
|------|------|--------|--------|--------|
| **1** | 세력 평단 계산 개선 | 높음 | 낮음 | ⭐⭐⭐ |
| **2** | 매수라인 정의 명확화 | 중간 | 중간 | ⭐⭐ |
| **3** | 돌파 기준 유지 | - | - | ✅ 현상유지 |
| **4** | 손절 기준 유지 | - | - | ✅ 현상유지 |

---

## 📝 **체크리스트**

- ❌ 세력 평단: (고+저+종)/3 → (저+종)/2 또는 저가 변경
- ⚠️ 매수라인: 단테기법에서 명확한 정의 확인 필요
- ✅ 돌파 기준: 정상 작동 중
- ✅ 손절 기준: 최근 개선 완료

