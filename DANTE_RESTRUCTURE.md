# 🎯 단테기법 화면구성 재구성 계획

## 📊 **현재 문제점**

| 항목 | 현재 상태 | 문제점 |
|------|---------|--------|
| **기법 표시** | 14개 체크리스트 | 어느 기법이 강한지 불명확 |
| **점수 체계** | 하나의 합계점수만 표시 | 기법별 강점/약점이 드러나지 않음 |
| **신호 흐름** | 분석 중심 | "지금 뭘 해야 하는지" 불명확 |
| **UI 구조** | 선형적 나열 | 계층이 없어서 읽기 어려움 |
| **시각화** | 텍스트만 | 한눈에 파악하기 어려움 |

---

## ✨ **개선된 구조**

### **새로운 화면 구성:**

```
┌─────────────────────────────────────────────────────────────┐
│  📊 단테기법 분석 대시보드                                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 【 5️⃣가지 핵심 기법 신호 강도 】                             │
│                                                               │
│ 🔴 이평 때리기          💪 강함         ▓▓▓▓░░░ 80%        │
│ 🟠 256기법             📊 중간         ▓▓▓░░░░░ 60%        │
│ 🟡 일목균합표          ⭐ 매우강함      ▓▓▓▓▓░░ 90%        │
│ 🟢 농사매매            🟡 약함         ▓░░░░░░ 30%         │
│ 🔵 박스권 돌파         💰 신호있음     ▓▓▓▓░░░ 70%        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ 【 최종 판정 】                                              │
│                                                               │
│ 종합 점수: 76점 (100점)  |  💚 강한 관찰                    │
│ 신호 수준: 4개/5 기법 확인  |  진입 준비 중                 │
│                                                               │
│ 📌 지금 해야 할 것:                                         │
│ ✓ 눌림목 진입 대기 (현재가: 50,000원)                       │
│ ✓ 손절 기준: 49,200원 (지지선 기반)                        │
│ ✓ 목표가: 55,000원 이상                                     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ 【 기법별 상세 분석 】 [▼ 펼치기]                           │
│                                                               │
│ ▶ 1️⃣ 이평 때리기 (112/224/448일선)                        │
│   └─ 점수: 16/16 | 상태: 역배열→정배열 확인 ✓              │
│                                                               │
│ ▶ 2️⃣ 256기법 (밥그릇 패턴)                                │
│   └─ 점수: 0/14 | 상태: 하락폭 부족 (12%) ✗                │
│                                                               │
│ ▶ 3️⃣ 일목균합표 (4가지 지표)                              │
│   └─ 점수: 26/26 | 상태: 후행스팬 돌파 + 골든크로스 ✓✓     │
│                                                               │
│ ▶ 4️⃣ 농사매매 (지지/저항선)                               │
│   └─ 점수: 0/10 | 상태: 저항선까지 거리 멀음 ✗             │
│                                                               │
│ ▶ 5️⃣ 박스권 돌파 (저항선 돌파)                            │
│   └─ 점수: 10/10 | 상태: 저항선 근처 + 거래량 증가 ✓       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **기술 구현 변경**

### **1️⃣ 기법별 점수 시스템 (새로 추가)**

```javascript
const techniques = {
  maLineHit: {
    name: "이평 때리기",
    icon: "🔴",
    checks: [
      "isReverseOrder",      // 과거 역배열
      "isNormalOrder",       // 현재 정배열  
      "latest.close > sma112"  // 현재가 > 112선
    ],
    maxScore: 16,
    signal: "💰 매수신호 | 📊 강세 | 🟡 약세"
  },
  
  bowlPattern: {
    name: "256기법",
    icon: "🟠",
    checks: [
      "verticalDecline >= 0.15",      // 큰 하락
      "horizontalRange <= 4%",        // 좁은 횡보
      "recoveryStrength 4~15%"        // 의미있는 회복
    ],
    maxScore: 14,
    signal: "🎯 최고 매수 | 📊 관찰 | 🟡 대기"
  },
  
  ichimoku: {
    name: "일목균합표",
    icon: "🟡",
    checks: [
      "laggingSpanBreakout",   // 후행스팬 돌파
      "ichimokuGoldenCross",   // 골든크로스
      "priceAboveCloud"        // 구름대 상단
    ],
    maxScore: 26,  // 14 + 12 (후행 + 골든크로스)
    signal: "✓ 매수승인 | 📊 강세 | 🟡 약세"
  },
  
  boxTrading: {
    name: "농사매매",
    icon: "🟢",
    checks: [
      "nearSupport",           // 지지선 근처
      "boxHeightPercent <= 8%"  // 좁은 박스
    ],
    maxScore: 10,
    signal: "🌾 기회 | 📊 관찰 | 🟡 대기"
  },
  
  breakout: {
    name: "박스권 돌파",
    icon: "🔵",
    checks: [
      "latest.close > resistanceLine * 1.003",
      "latest.volumeRatio >= 1.05"
    ],
    maxScore: 10,
    signal: "💰 추격 | 📊 관찰 | 🟡 대기"
  }
};
```

### **2️⃣ 기법별 점수 계산 함수 (새로 추가)**

```javascript
function calculateTechniqueScores(setup) {
  return {
    maLineHit: {
      score: setup.maLineReversal ? 16 : 0,
      maxScore: 16,
      percent: setup.maLineReversal ? 100 : 0,
      status: setup.maLineReversal ? "역배열→정배열 ✓" : "신호 미확인 ✗",
      color: setup.maLineReversal ? "green" : "gray"
    },
    
    bowlPattern: {
      score: setup.isBowlPattern ? 14 : 0,
      maxScore: 14,
      percent: setup.isBowlPattern ? 100 : (setup.verticalDecline > 0.1 ? 50 : 0),
      status: setup.isBowlPattern ? "패턴 감지 ✓" : `하락폭 ${(setup.verticalDecline*100).toFixed(1)}% ✗`,
      color: setup.isBowlPattern ? "green" : "gray"
    },
    
    ichimoku: {
      score: (setup.laggingSpanBreakout ? 14 : 0) + 
             (setup.ichimokuGoldenCross ? 12 : 0),
      maxScore: 26,
      percent: ((setup.laggingSpanBreakout ? 14 : 0) + 
                (setup.ichimokuGoldenCross ? 12 : 0)) / 26 * 100,
      status: setup.laggingSpanBreakout ? "후행스팬 돌파 ✓✓" : "신호 대기 ✗",
      color: setup.laggingSpanBreakout ? "green" : "gray"
    },
    
    boxTrading: {
      score: (setup.nearSupport && setup.boxHeightPercent <= 0.08) ? 10 : 0,
      maxScore: 10,
      percent: setup.nearSupport ? 100 : 0,
      status: setup.nearSupport ? "지지선 근처 ✓" : "거리 멀음 ✗",
      color: setup.nearSupport ? "green" : "gray"
    },
    
    breakout: {
      score: setup.breakoutSignal ? 10 : 0,
      maxScore: 10,
      percent: setup.breakoutSignal ? 100 : 0,
      status: setup.breakoutSignal ? "돌파 신호 ✓" : "미돌파 ✗",
      color: setup.breakoutSignal ? "green" : "gray"
    }
  };
}
```

### **3️⃣ UI 섹션 분류 (새로운 렌더링 구조)**

#### **섹션 1: 기법별 신호 강도 카드**
```html
<div class="techniques-grid">
  <div class="technique-card technique-ma">
    <div class="tech-header">🔴 이평 때리기</div>
    <div class="tech-score">16/16점</div>
    <div class="tech-bar">
      <div class="tech-bar-fill" style="width: 100%"></div>
    </div>
    <div class="tech-status">💪 강함</div>
  </div>
  <!-- 나머지 4개 기법 반복 -->
</div>
```

#### **섹션 2: 최종 판정 & 행동 가이드**
```html
<div class="verdict-section">
  <div class="score-display">
    <span class="final-score">76</span>
    <span class="max-score">/100</span>
  </div>
  <div class="signal-badge">💚 강한 관찰</div>
  <div class="action-guide">
    <h4>📌 지금 해야 할 것:</h4>
    <ul>
      <li>✓ 눌림목 진입 대기</li>
      <li>✓ 손절 기준: 49,200원</li>
      <li>✓ 목표가: 55,000원 이상</li>
    </ul>
  </div>
</div>
```

#### **섹션 3: 기법별 상세 분석 (접을 수 있음)**
```html
<div class="detailed-techniques">
  <details>
    <summary>▶ 1️⃣ 이평 때리기 (112/224/448일선)</summary>
    <div class="technique-details">
      <div class="detail-score">점수: 16/16</div>
      <div class="detail-status">상태: 역배열→정배열 ✓</div>
      <div class="detail-info">
        <p>112일선: 50,000원</p>
        <p>224일선: 49,500원</p>
        <p>448일선: 49,000원</p>
        <p>이평선 괴리도: 1.2%</p>
      </div>
    </div>
  </details>
  <!-- 나머지 4개 기법 반복 -->
</div>
```

---

## 🎨 **CSS 개선 (새로운 스타일)**

```css
.techniques-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 20px 0;
}

.technique-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  background: linear-gradient(135deg, rgba(0,0,0,0.05), transparent);
}

.technique-card.active {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76,175,80,0.1), transparent);
}

.tech-header {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.tech-score {
  font-size: 11px;
  color: #666;
  margin-bottom: 6px;
}

.tech-bar {
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.tech-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  border-radius: 3px;
}

.tech-status {
  font-size: 12px;
  font-weight: 600;
  color: #4CAF50;
}

.verdict-section {
  background: #f5f5f5;
  border-left: 4px solid #2196F3;
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
}

.score-display {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.signal-badge {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 12px;
}

.action-guide {
  margin-top: 12px;
}

.action-guide h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.action-guide ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.action-guide li {
  font-size: 12px;
  padding: 4px 0;
  color: #333;
}
```

---

## 📋 **변경 요약**

| 구성요소 | 이전 | 개선 후 |
|---------|------|--------|
| **기법 표시** | 14개 섞인 체크리스트 | **5가지 명확한 카드** |
| **점수 체계** | 단일 합계점수 | **기법별 개별 점수** |
| **신호 표시** | 텍스트 나열 | **시각적 진행바** |
| **행동 가이드** | 없음 | **명확한 액션 리스트** |
| **상세 정보** | 펼쳐진 상태 | **접을 수 있는 구조** |
| **한눈에 파악** | 어려움 | **매우 쉬움** |

---

## 🚀 **구현 우선순위**

1. ✅ **기법별 점수 계산 함수** (app.js에서 getDanteSetup 개선)
2. ✅ **HTML 구조 개선** (5개 카드 + 최종 판정 + 상세 분석)
3. ✅ **CSS 스타일 추가** (그리드, 카드, 진행바, 배지)
4. ✅ **차트 개선** (기법별 색상 코드)
5. ✅ **반응형 레이아웃** (모바일 최적화)

---

## 💡 **사용자 경험 개선**

### 이전: "분석 도구"
```
긴 체크리스트 읽기 → 점수 계산 → 판단
시간 소요: 2~3분
결론: 불명확
```

### 개선 후: "의사결정 도구"
```
5개 카드 한눈에 보기 → 최종 판정 즉시 확인 → 명확한 행동
시간 소요: 10초
결론: 명확함
```

