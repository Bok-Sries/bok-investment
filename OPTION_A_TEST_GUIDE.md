# 🔍 Option A: Naver 실제 데이터 통합 - 테스트 가이드

## ✅ **준비 완료 항목**

1. ✅ `smartmoney-data.json` - 샘플 데이터 파일 (삼성전자)
2. ✅ `smartMoneyStorage.loadFromFile()` - 자동 데이터 로드
3. ✅ `naver-smartmoney-crawler.js` - Naver 크롤링 스크립트
4. ✅ `NAVER_CRAWLER_GUIDE.md` - 크롤러 사용 설명서

---

## 🚀 **3단계 테스트 방법**

### **Step 1️⃣: 현재 상태 확인 (2분)**

현재 상태:
- ✅ 샘플 데이터로 테스트 가능
- ✅ 데모 데이터 자동 생성도 가능
- ✅ 두 데이터 병렬 사용 가능

**테스트 방법:**
```
1. 앱을 열기
2. 개발자 도구 (F12) → Console 확인
3. 다음 메시지 중 하나 확인:
   
   ✅ "Naver 수급 데이터 로드 성공: 005930"
   💡 "smartmoney-data.json을 찾을 수 없습니다..."
```

---

### **Step 2️⃣: 삼성전자로 분석 확인 (3분)**

**앱에서 확인:**
1. 종목 입력 → `005930` (삼성전자)
2. 메뉴 선택 → "세력 추적 분석"
3. 다음 데이터가 표시되는지 확인:

```
기관·외국인 수급 신호
├─ 기관 순매매: 강한 매수 (점수 85점)
├─ 외국인 순매매: 약한 매수 (점수 55점)
├─ 공매도 잔량: 보통 (1.87%)
└─ 종합 신호: 🟡 약한 매수 (점수 69)

세력 평단 분석
├─ 세력 평단가: 76,400원
├─ 현재가 괴리도: +5.2%
└─ 신호: 고가권 매도 우위
```

**데이터 출처 확인:**
```javascript
// Console에서 실행:
smartMoneyStorage.get('005930')
// 결과: 
// {
//   ticker: "005930",
//   date: "2024-06-24",
//   institution: { buy: 1850000, sell: 1420000, ... }
//   source: "naver-crawler"
// }
```

---

### **Step 3️⃣: 실제 Naver 데이터 추가 (5-10분)**

**Option A-1: Node.js 사용 (권장)**

```bash
# 1. Node.js 확인
node --version  # v14 이상 필요

# 2. 크롤러 실행
node naver-smartmoney-crawler.js 005930

# 3. 파일 생성 확인
ls -la smartmoney-data.json

# 4. 앱 새로 고침 (F5)
```

결과:
```
✅ 수급 데이터 로드: 2024-06-24T15:30:00.000Z
📊 기관/외국인/공매도 데이터 표시됨
```

**Option A-2: 샘플 데이터 활용 (지금 상태)**

```
1. 현재 smartmoney-data.json 사용
2. 종목별 데이터는 자동 생성
3. 추후 실제 데이터로 교체
```

---

## 📊 **데이터 비교: 데모 vs 실제**

### **데모 데이터 (자동 생성)**
```javascript
generateSmartMoneyData(prices, volume)
→ 가격 + 거래량 기반 추론
→ 패턴 인식 기반
→ 빠르고 모든 종목에 적용 가능
```

**특징:**
- ✅ 실시간 생성 가능
- ❌ 실제 기관/외국인 거래량 아님
- ❌ 정확도 제한적

### **실제 데이터 (Naver 크롤링)**
```javascript
smartMoneyData from smartmoney-data.json
→ Naver 금융에서 수집
→ 실제 기관/외국인/공매도 거래량
→ 더 정확한 분석
```

**특징:**
- ✅ 실제 거래량 기반
- ✅ 신뢰도 높음
- ❌ 수동 업데이트 필요
- ❌ 반복 크롤링 차단 위험

---

## 🔄 **자동 업데이트 설정 (선택)**

### **Windows Task Scheduler**
```
작업 이름: Naver SmartMoney Crawler
트리거: 매일 15:30 (장 마감 후)
작업: node C:\path\to\naver-smartmoney-crawler.js 005930
```

### **Linux/Mac Cron**
```bash
30 15 * * * cd ~/주식프로젝트 && node naver-smartmoney-crawler.js 005930
```

---

## 📈 **테스트 결과 확인**

### **체크리스트:**

```
[ ] 1. 앱 실행 시 Console에서 데이터 로드 메시지 확인
[ ] 2. 세력 추적 분석에서 기관/외국인 신호 표시됨
[ ] 3. 세력 평단가 계산 표시됨
[ ] 4. 모델 분석에서 세력 점수 포함됨
[ ] 5. 최종 신호에 세력 모델 반영됨
[ ] 6. 크롤러 실행해서 새 데이터 생성됨
[ ] 7. 앱 새로 고침 후 새 데이터 로드됨
```

---

## 🐛 **문제 해결**

### **Q1: "데이터 로드 메시지가 안 보임"**
```
→ F12 Console 확인
→ 에러 메시지 있는지 확인
→ smartmoney-data.json이 앱 폴더에 있는지 확인
```

### **Q2: "종목별 다른 데이터 로드하려면?"**
```
Option A-1: 크롤러로 각 종목 생성
node naver-smartmoney-crawler.js 000660  # SK하이닉스
node naver-smartmoney-crawler.js 035420  # NAVER

Option A-2: 여러 파일 관리
smartmoney-005930.json (삼성전자)
smartmoney-000660.json (SK하이닉스)
smartmoney-035420.json (NAVER)

→ app.js에서 종목별로 로드하도록 수정 필요
```

### **Q3: "Naver 차단됨 (403 에러)"**
```
→ 30분-1시간 대기
→ User-Agent 변경 (이미 적용됨)
→ Puppeteer 사용 (더 강력)
```

---

## 🎯 **다음 진행**

### **현재 (지금):**
✅ 샘플 데이터로 UI/신호 확인

### **Step 1 (5분):**
⏳ Node.js로 크롤러 실행 (선택)
→ `node naver-smartmoney-crawler.js 005930`

### **Step 2 (5분):**
⏳ 앱에서 실제 데이터 확인
→ F5 새로 고침
→ 세력 추적 분석 메뉴 확인

### **Step 3 (10분):**
⏳ 백테스트 (Option B)
→ 과거 데이터로 신호 검증

---

## 📝 **간단한 흐름도**

```
[앱 시작]
   ↓
[smartMoneyStorage.loadFromFile()]
   ↓
[smartmoney-data.json 로드 시도]
   ↓
┌─────┴─────┐
│           │
[성공]     [실패]
│           │
[실제데이터] [데모데이터]
│           │
└─────┬─────┘
   ↓
[종목 입력]
   ↓
[세력 모델 적용]
   ↓
[신호 생성]
   ↓
[표시]
```

---

## 💡 **현재 상태 요약**

```
준비 완료: 100%
┌──────────────────────────────┐
├─ 샘플 데이터: ✅ 준비됨
├─ 자동 로드: ✅ 구현됨
├─ 크롤러: ✅ 제공됨
├─ 가이드: ✅ 작성됨
└─ 테스트: ⏳ 사용자 실행
```

**지금 바로 테스트할 수 있습니다!** 🚀

