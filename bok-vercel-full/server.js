import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
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

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === "/api/google-indices") {
      const apiResponse = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          res.writeHead(this.statusCode || 200, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...this.headers,
          });
          res.end(JSON.stringify(payload));
        },
      };
      await googleIndices(req, apiResponse);
      return;
    }

    if (url.pathname === "/api/quote") {
      const apiResponse = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          res.writeHead(this.statusCode || 200, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...this.headers,
          });
          res.end(JSON.stringify(payload));
        },
      };
      await quote(req, apiResponse);
      return;
    }

    if (url.pathname === "/api/history") {
      const apiResponse = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          res.writeHead(this.statusCode || 200, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...this.headers,
          });
          res.end(JSON.stringify(payload));
        },
      };
      await history(req, apiResponse);
      return;
    }

    if (url.pathname === "/api/symbol-search") {
      const apiResponse = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          res.writeHead(this.statusCode || 200, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...this.headers,
          });
          res.end(JSON.stringify(payload));
        },
      };
      await symbolSearch(req, apiResponse);
      return;
    }

    if (url.pathname === "/api/news") {
      const apiResponse = {
        headers: {},
        setHeader(name, value) {
          this.headers[name] = value;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          res.writeHead(this.statusCode || 200, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            ...this.headers,
          });
          res.end(JSON.stringify(payload));
        },
      };
      await news(req, apiResponse);
      return;
    }

    const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root)) {
      sendJson(res, 403, { error: "Forbidden" });
      return;
    }

    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    res.end(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(port, () => {
  console.log(`BOK 투자 server running at http://localhost:${port}`);
});
