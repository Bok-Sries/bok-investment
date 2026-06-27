import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, posix } from "node:path";
import googleIndices from "./api/google-indices.js";
import history from "./api/history.js";
import quote from "./api/quote.js";
import symbolSearch from "./api/symbol-search.js";
import news from "./api/news.js";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const allowedStaticFiles = new Set(["/index.html", "/app.js", "/styles.css", "/smartmoney-data.json"]);
const allowedStaticPrefixes = ["/assets/"];

function isAllowedStaticPath(pathname) {
  return allowedStaticFiles.has(pathname) || allowedStaticPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsHeaders,
  });
  res.end(JSON.stringify(payload));
}

// 팩토리 함수: API 응답 객체 생성 (DRY 원칙)
function createApiResponse() {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      // Do nothing - handled by server
      this.payload = payload;
    },
  };
}

const apiHandlers = {
  "/api/google-indices": googleIndices,
  "/api/quote": quote,
  "/api/history": history,
  "/api/symbol-search": symbolSearch,
  "/api/news": news,
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    // CORS 헤더 설정
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // API 핸들러 라우팅
    const handler = apiHandlers[url.pathname];
    if (handler) {
      const apiResponse = createApiResponse();
      await handler(req, apiResponse);

      // API 응답 전송
      if (apiResponse.payload !== undefined) {
        res.writeHead(apiResponse.statusCode || 200, {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders,
          ...apiResponse.headers,
        });
        res.end(JSON.stringify(apiResponse.payload));
      }
      return;
    }

    // 정적 파일 서빙 (경로 순회 공격 방지)
    let pathname = posix.normalize(decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    if (!pathname.startsWith("/")) pathname = `/${pathname}`;
    if (!isAllowedStaticPath(pathname)) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    // 정규화된 allowlist 경로만 파일 시스템에서 읽습니다.
    const filePath = normalize(join(root, pathname));

    // 절대 경로 검증 및 root 디렉토리 벗어남 확인
    const resolvedRoot = normalize(root);
    if (!filePath.startsWith(resolvedRoot + "/") && filePath !== resolvedRoot) {
      sendJson(res, 403, { error: "Forbidden" });
      return;
    }

    const content = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      ...corsHeaders,
    });
    res.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    if (error.code === "EACCES") {
      sendJson(res, 403, { error: "Access denied" });
      return;
    }
    console.error("Server error:", error.message);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`BOK 투자 server running at http://localhost:${port}`);
});
