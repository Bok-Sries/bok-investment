# 🔍 Naver 세력 추적 데이터 크롤러 - 사용 가이드

## ⚡ **빠른 시작 (5분)**

### **1단계: Node.js 확인**
```bash
node --version  # v14 이상 필요
```

### **2단계: 크롤러 실행**
```bash
# 삼성전자 (005930) 데이터 수집
node naver-smartmoney-crawler.js 005930

# 또는 다른 종목
node naver-smartmoney-crawler.js 000660  # SK하이닉스
```

### **3단계: 데이터 확인**
```bash
# 생성된 파일 확인
cat smartmoney-data.json

# 또는 에디터에서 열기
# smartmoney-data.json
```

### **4단계: 앱에 반영**
```
1. smartmoney-data.json을 앱 폴더에 저장
2. 앱을 새로 고침 (F5)
3. 세력 추적 분석 섹션에서 실제 데이터 표시됨
```

---

## 📊 **생성된 데이터 형식**

```json
{
  "lastUpdate": "2024-06-24T15:30:00.000Z",
  "data": {
    "ticker": "005930",
    "date": "2024-06-24",
    "institution": {
      "buy": 1250000,      // 기관 매수량
      "sell": 980000,      // 기관 매도량
      "net": 270000,       // 순매매
      "buyRate": 0.54,
      "sellRate": 0.46
    },
    "foreign": {
      "buy": 850000,       // 외국인 매수량
      "sell": 720000,      // 외국인 매도량
      "net": 130000,
      "buyRate": 0.53,
      "sellRate": 0.47
    },
    "shortSell": {
      "volume": 45000,     // 공매도 거래량
      "ratio": 0.018       // 거래량 대비 %
    },
    "priceLevel": {
      "high": 85000,       // 고가 영역 거래량
      "mid": 120000,       // 중가 영역
      "low": 55000         // 저가 영역
    },
    "source": "naver-crawler"
  }
}
```

---

## 🛠️ **커스터마이징**

### **정기 업데이트 (Cron/Task Scheduler)**

#### **Linux/Mac:**
```bash
# 매일 15시 30분에 실행
30 15 * * * cd /path/to/app && node naver-smartmoney-crawler.js 005930
```

#### **Windows (Task Scheduler):**
```
작업 이름: Naver SmartMoney Crawler
트리거: 매일 15:30
작업: node C:\path\to\naver-smartmoney-crawler.js 005930
```

### **배치 크롤링 (여러 종목)**

```bash
#!/bin/bash
# batch-crawl.sh

node naver-smartmoney-crawler.js 005930  # 삼성전자
node naver-smartmoney-crawler.js 000660  # SK하이닉스
node naver-smartmoney-crawler.js 035420  # NAVER
node naver-smartmoney-crawler.js 035720  # 카카오

echo "✅ 모든 데이터 수집 완료!"
```

실행:
```bash
chmod +x batch-crawl.sh
./batch-crawl.sh
```

---

## ⚠️ **주의사항**

### **1. Naver 이용 약관**
- 과도한 크롤링은 차단될 수 있음
- 개인 용도만 사용
- 상업적 이용 금지

### **2. 데이터 정확도**
- 실시간 아님 (장중/장후 업데이트)
- 통계 수치 차이 가능성
- 참고만 하고 확인 필수

### **3. HTML 구조 변경**
- Naver 웹사이트 리뉴얼 시 크롤러 수정 필요
- 정규식 패턴 업데이트 필요
- 앱에서 오류 발생 시 체크

---

## 🐛 **트러블슈팅**

### **Q1: "Cannot find module 'https'"**
```bash
# Node.js 재설치
node --version
node naver-smartmoney-crawler.js 005930
```

### **Q2: "Naver 차단됨 (403 Forbidden)"**
```bash
# 잠시 후 재시도 (30분 대기)
sleep 1800
node naver-smartmoney-crawler.js 005930
```

### **Q3: "smartmoney-data.json을 찾을 수 없음"**
```bash
# 파일 위치 확인
ls -la smartmoney-data.json

# 없으면 크롤러 다시 실행
node naver-smartmoney-crawler.js 005930
```

### **Q4: 앱에서 데이터가 안 보임**
1. 개발자 도구 > Console 확인
2. "✅ 수급 데이터 로드" 메시지 확인
3. smartmoney-data.json이 앱 폴더에 있는지 확인
4. 앱 새로 고침 (Ctrl+F5)

---

## 📈 **고급: 실시간 데이터 (Puppeteer)**

더 정확한 크롤링이 필요하면 Puppeteer 사용:

```bash
npm install puppeteer
```

```javascript
// naver-crawler-puppeteer.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://finance.naver.com/item/main.naver?code=005930');
  
  // JavaScript 렌더링 후 데이터 추출
  const data = await page.evaluate(() => {
    // DOM에서 직접 데이터 추출
    const instBuy = document.querySelector('.institution-buy')?.textContent;
    // ...
    return { instBuy, /* ... */ };
  });
  
  console.log(data);
  await browser.close();
})();
```

---

## 💡 **팁**

### **데이터 검증**
```javascript
// app.js에서 검증
if (smartMoneyData.institution.buy > 0) {
  console.log('✅ 유효한 데이터');
} else {
  console.warn('⚠️ 데이터 오류');
}
```

### **다중 종목 관리**
```javascript
// 종목별 데이터 유지
const tickers = ['005930', '000660', '035420'];
tickers.forEach(ticker => {
  const data = smartMoneyStorage.get(ticker);
  // 종목별 분석
});
```

### **자동 새로고침**
```bash
# 매일 08:00, 15:00 업데이트
# Linux Cron:
0 8,15 * * * node /path/to/naver-smartmoney-crawler.js 005930 && killall -HUP node
```

---

## 🚀 **다음 단계**

1. ✅ 크롤러 실행 완료
2. ⏳ smartmoney-data.json 생성 확인
3. ⏳ 앱에서 실제 데이터 표시 확인
4. ⏳ 정기 업데이트 설정 (선택)

---

## 📞 **지원**

크롤러가 작동하지 않으면:
1. 개발자 도구 (F12) Console 확인
2. smartmoney-data.json 파일 확인
3. Node.js 버전 확인 (14+)
4. Naver 웹사이트 접속 가능한지 확인

