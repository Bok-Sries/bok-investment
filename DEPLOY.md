# BOK 투자 배포 메모

이 서비스는 현재가, 종가, 지수, 종목 검색을 브라우저가 직접 외부 금융 사이트에서 가져오지 않습니다.
브라우저는 같은 도메인의 `/api/quote`, `/api/history`, `/api/google-indices`, `/api/symbol-search`를 호출하고,
이 API가 외부 데이터를 중계합니다.

따라서 HTML/CSS/JS만 정적 호스팅에 업로드하면 가격 아래에 `API 연결 실패 · 같은 도메인 API`가 표시됩니다.

## 권장 배포: Vercel 전체 배포

Vercel처럼 `/api/*.js` 서버리스 함수를 지원하는 플랫폼에 프로젝트 폴더 전체를 배포하세요.
단순 정적 호스팅에 업로드하면 종목 검색은 `assets/symbols.json` fallback 범위 안에서만 동작하고,
현재가, 종가, 지수, 뉴스, 실제 히스토리 차트는 API 연결 실패 상태로 표시됩니다.

필수 포함 파일:

- `index.html`
- `styles.css`
- `app.js`
- `assets/` 폴더 전체
- `api/` 폴더 전체
- `package.json`
- `vercel.json`

배포 후 아래 주소가 JSON으로 열려야 정상입니다.

```text
https://배포도메인/api/quote?symbol=005930.KS
https://배포도메인/api/google-indices
```

현재 프로젝트는 Vercel 구조에 맞춰져 있습니다. `bok-vercel-full.zip`을 Vercel에 배포하면
화면과 API가 같은 도메인에서 함께 동작합니다.

## Netlify 배포는 화면 전용

Netlify에 정적 파일만 업로드하면 화면은 표시되지만 `/api/quote`, `/api/history`,
`/api/google-indices` 같은 서버 API는 실행되지 않습니다.

화면 표시만 필요하면 `bok-netlify-static.zip`을 업로드하세요.
실시간 가격까지 필요하면 Vercel 전체 배포를 사용하거나, API를 별도 Node/Vercel 서버에 배포한 뒤
`index.html`의 아래 값을 채우는 방식으로 연결해야 합니다.

```html
<meta name="api-origin" content="https://api.example.com" />
```

## 프론트와 API를 다른 도메인에 둘 때

`index.html`의 API 주소를 실제 API 서버 주소로 지정하세요.

```html
<meta name="api-origin" content="https://api.example.com" />
```

비워두면 앱은 같은 도메인의 `/api/...`를 사용합니다.
