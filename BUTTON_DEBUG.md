# 🔍 시작 버튼 작동 확인 가이드

## 단계별 진단

### Step 1: 콘솔 열기
```
F12 또는 우클릭 → 검사 → Console 탭
```

### Step 2: 다음 명령어를 콘솔에 입력하고 실행

#### **2-1. 버튼 요소 확인**
```javascript
document.querySelector("#startMonitoringBtn")
```
**결과:**
- ✅ 버튼 요소가 나타남 → 버튼이 HTML에 있음
- ❌ null 나타남 → 버튼을 찾을 수 없음

---

#### **2-2. Toast 함수 확인**
```javascript
typeof showToast
```
**결과:**
- ✅ "function" 나타남 → 함수가 정의됨
- ❌ "undefined" 나타남 → 함수가 정의되지 않음

---

#### **2-3. 이벤트 리스너 확인**
```javascript
const btn = document.querySelector("#startMonitoringBtn");
console.log(btn._clickListeners || "리스너 확인 불가");
btn.click();  // 수동으로 클릭 시뮬레이션
```
**결과:**
- ✅ Toast 메시지가 나타남 → 이벤트 리스너가 등록됨
- ❌ 아무것도 일어나지 않음 → 이벤트 리스너가 없음

---

#### **2-4. Toast 함수 직접 테스트**
```javascript
showToast("테스트 메시지입니다!", "success")
```
**결과:**
- ✅ 우측 상단에 초록색 메시지 나타남 → Toast 함수 정상
- ❌ 아무것도 나타나지 않음 → Toast 함수 오류

---

#### **2-5. 전체 이벤트 리스너 등록 상태 확인**
```javascript
setupAlertEventListeners()
```
**결과:**
- ✅ 콘솔에 "✅ 시작 버튼 리스너 등록됨" 나타남 → 함수가 실행됨
- ❌ 아무것도 나타나지 않음 → 함수가 호출되지 않음

---

### Step 3: 결과에 따른 조치

| 증상 | 원인 | 해결 방법 |
|------|------|---------|
| "null" 나타남 | 버튼을 찾을 수 없음 | HTML ID 확인 |
| "undefined" 나타남 | showToast 함수 미정의 | JavaScript 재로드 |
| 수동 클릭 시 메시지 나타남 | 이벤트 리스너 미등록 | setupAlertEventListeners() 재실행 |
| Toast 함수 테스트 실패 | Toast 함수 오류 | 코드 확인 필요 |

---

## 빠른 해결: 콘솔에서 직접 실행

**문제 해결을 위해 콘솔에 다음을 붙여넣으세요:**

```javascript
// Toast 함수 재정의
function showToast(message, type = "info", duration = 3000) {
  const container = document.querySelector("#toastContainer");
  if (!container) {
    alert("Toast 컨테이너를 찾을 수 없습니다!");
    return;
  }

  const toast = document.createElement("div");
  const bgColor =
    type === "success" ? "#10b981" :
    type === "error" ? "#ef4444" :
    type === "warning" ? "#f59e0b" :
    "#3b82f6";

  const icon =
    type === "success" ? "✅" :
    type === "error" ? "❌" :
    type === "warning" ? "⚠️" :
    "ℹ️";

  toast.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
    pointer-events: auto;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
  `;

  toast.innerHTML = `<span style="font-size: 1.2em;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, duration);

  toast.addEventListener("click", () => {
    toast.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  });
}

// 이벤트 리스너 재등록
const startBtn = document.querySelector("#startMonitoringBtn");
if (startBtn) {
  startBtn.onclick = function() {
    showToast("✅ 시작 버튼이 클릭되었습니다!", "success");
    console.log("시작 버튼 클릭됨");
  };
  console.log("✅ 시작 버튼에 직접 이벤트 리스너가 등록되었습니다");
} else {
  console.error("❌ 시작 버튼을 찾을 수 없습니다");
}

// 테스트
console.log("테스트: 시작 버튼을 클릭하면 메시지가 나타나야 합니다");
```

**붙여넣은 후:**
1. 시작 버튼 클릭
2. 우측 상단에 메시지 확인

---

## 검증 체크리스트

```
[ ] 1. 콘솔에서 showToast 테스트 성공
[ ] 2. 버튼 요소 찾기 성공 (null 아님)
[ ] 3. 수동 click() 시뮬레이션 성공
[ ] 4. 실제 버튼 클릭 시 메시지 나타남
[ ] 5. Toast 메시지가 3초 후 사라짐
[ ] 6. 메시지 클릭 시 즉시 사라짐
```

모두 체크되면 정상입니다! ✅

