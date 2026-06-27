/**
 * 🔍 Naver 코스닥 기업 크롤러
 * 코스닥 상장 기업 리스트 및 실시간 차트 데이터 수집
 */

const https = require("https");
const fs = require("fs");

// 🆕 코스닥 기업 리스트 크롤링 (상위 100개)
function crawlKosdaqCompanies() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "finance.naver.com",
      path: "/api/siseList.naver?sosok=1&page=1", // kosdaq
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          // Naver 응답 파싱 (JSON)
          const companies = [];
          const lines = data.split("\n");

          lines.forEach((line) => {
            try {
              if (line.includes("itemcode")) {
                const match = line.match(/itemcode=(\d+)/);
                if (match) {
                  const ticker = match[1];
                  // 상세 정보는 별도로 가져옴
                  companies.push({
                    ticker,
                    name: "Loading...",
                    price: 0,
                    change: 0,
                    changePercent: 0,
                    volume: 0,
                    marketCap: 0,
                  });
                }
              }
            } catch (e) {
              // 라인 파싱 실패
            }
          });

          resolve(companies.slice(0, 100)); // 상위 100개
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// 🆕 개별 기업 상세 정보 가져오기
function getCompanyDetails(ticker) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "finance.naver.com",
      path: `/item/main.naver?code=${ticker}`,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          // HTML 파싱
          const nameMatch = data.match(
            /<h2[^>]*class="txt_mark"[^>]*>([^<]+)<\/h2>/
          );
          const priceMatch = data.match(/no_today">([0-9,]+)</);
          const changeMatch = data.match(
            /blind">([+-][0-9,]+)<\/span>.*?blind">([0-9.]+)%/s
          );

          resolve({
            ticker,
            name: nameMatch ? nameMatch[1].trim() : "Unknown",
            price: parseInt(
              (priceMatch ? priceMatch[1] : "0").replace(/,/g, "")
            ),
            change: changeMatch ? parseInt(changeMatch[1].replace(/,/g, "")) : 0,
            changePercent: changeMatch ? parseFloat(changeMatch[2]) : 0,
            lastUpdate: new Date().toISOString(),
          });
        } catch (error) {
          resolve({
            ticker,
            name: "Error",
            price: 0,
            change: 0,
            changePercent: 0,
            lastUpdate: new Date().toISOString(),
          });
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// 🆕 차트 데이터 (60일) 가져오기
function getChartData(ticker) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "finance.naver.com",
      path: `/api/chart/get.naver?symbol=${ticker}&requestType=0&count=60`,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          // 차트 데이터 추출 (시가, 고가, 저가, 종가, 거래량)
          resolve(parsed.data || []);
        } catch (error) {
          resolve([]); // 파싱 실패 시 빈 배열
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// 🆕 전체 스캔 함수
async function scanKosdaqForDanteSignals() {
  console.log("🔍 코스닥 기업 스캔 시작...");

  try {
    // 1. 코스닥 기업 리스트 가져오기
    const companies = await crawlKosdaqCompanies();
    console.log(`📊 코스닥 기업 ${companies.length}개 발견`);

    const results = [];

    // 2. 각 기업의 상세 정보 및 차트 데이터 가져오기
    for (let i = 0; i < Math.min(companies.length, 20); i++) {
      // 테스트용 20개만
      const ticker = companies[i].ticker;

      try {
        const details = await getCompanyDetails(ticker);
        const chartData = await getChartData(ticker);

        results.push({
          ticker,
          name: details.name,
          price: details.price,
          changePercent: details.changePercent,
          chartData,
          scannedAt: new Date().toISOString(),
        });

        console.log(`✅ ${details.name} (${ticker})`);
      } catch (error) {
        console.warn(`⚠️ ${ticker} 스캔 실패:`, error.message);
      }

      // 요청 간격 (과도한 크롤링 방지)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 3. 결과 저장
    const outputFile = "kosdaq-scan-results.json";
    fs.writeFileSync(
      outputFile,
      JSON.stringify(
        {
          scanDate: new Date().toISOString(),
          totalScanned: results.length,
          companies: results,
        },
        null,
        2
      )
    );

    console.log(`\n✅ 스캔 완료! 결과: ${outputFile}`);
    return results;
  } catch (error) {
    console.error("❌ 스캔 오류:", error);
    return [];
  }
}

// 🆕 사용 방법
if (require.main === module) {
  scanKosdaqForDanteSignals().then((results) => {
    console.log("\n📈 스캔 결과:");
    results.forEach((company) => {
      console.log(
        `  ${company.name} (${company.ticker}): ${company.price}원 (${company.changePercent}%)`
      );
    });
  });
}

module.exports = {
  crawlKosdaqCompanies,
  getCompanyDetails,
  getChartData,
  scanKosdaqForDanteSignals,
};
