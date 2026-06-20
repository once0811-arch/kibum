import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    try {
      const text = readFileSync(join(root, fileName), "utf8");
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const index = trimmed.indexOf("=");
        if (index === -1) continue;
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        if (key && process.env[key] === undefined) process.env[key] = value;
      }
    } catch {
      // Local env files are optional.
    }
  }
}

loadLocalEnv();

const port = Number(process.env.PORT || 8000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

const portfolioContext = `
김기범은 Jr. Product Owner / Service Planner 후보입니다.
핵심 포지셔닝: AI 도구로 직접 제품을 만들고 배포하며, 복잡한 업무와 데이터를 사용자가 판단할 수 있는 Admin/Dashboard와 서비스 구조로 바꾸는 Jr. PO.
AI Native 역량: Codex와 Claude Code를 실행 환경처럼 활용하고, PRD 기반 harness engineering으로 요구사항, 테스트, 화면, 데이터 흐름을 연결한다. Agent Native 문서 작성 능력이 있으며 국문과 문예창작/비평 전공의 문장 감각을 구조화 문서와 지시문에 활용한다. LLM Wiki와 Hermes Agent를 활용하고 Self-Improving Agent처럼 본인의 작업 방식도 계속 개선한다.

데블록: 2025.04-2026.05 서비스 기획자/PM.
ireh link: 2025.05-2026.04 외국인 의료관광 B2B 운영 시스템. 레퍼런스가 거의 없는 러프한 요구사항을 바탕으로 레퍼런스 수집, PRD, IA, 화면설계서, Figma 일부 디자인, QA 시트, 개발 매니징을 담당. 웹/앱/Admin 구조. 예약/매칭, 매출분석, 차트관리, 상품판매, 인센티브 정산, 데이터 대시보드, 웹빌더 기능. Jira, WBS 기반으로 클라이언트 요구사항, 개발 구현 범위, 일정 우선순위를 조율. 엑셀/수기 중심으로 분산되어 있던 예약·정산·매출 흐름을 운영자 중심 Admin 구조로 정리해 업무 표준화와 운영 효율 개선에 기여. 데이터 마이그레이션 과정에서 클라이언트 제공 매출 데이터 오류를 발견.
sippn: 2026.01-2026.04. 대학 창업 프로젝트 테이스팃에서 검증했던 아이디어를 내부 신규 프로젝트로 제안했고 sippn으로 발전. 아이디어 제안, 유저 시나리오 기획, 일부 디자인, 개발 매니징, GA4 이벤트 설정/분석 작업 담당. 매니아층과 라이트 유저의 기대 경험에 맞춰 사용자군별 화면 구조와 서비스 플로우를 분리 설계.

퇴사 후 단독 프로젝트: 2026.04-2026.06.
Dimetric: LLM 기반 Text to CAD, 3D프린터 도안 생성 프로젝트. 단독 기획/개발. 대학/지자체 3D 프린터 운용률이 5% 미만이고 도안 제작(CAD) 허들이 높다는 문제에서 출발. 자연어로 3차원 수치 도안을 생성하고 Three.js 기반 웹 렌더링으로 확인. Python, build123d 등을 CAD engine으로 활용. 최소 두께, 베드 크기, 오버행 같은 3D 프린팅 위험 요소를 확인하고 권장 수치 제공. 편집 시마다 스냅샷을 생성해 실패한 CAD 변경이 원본 프로젝트를 망가뜨리지 않도록 설계. GitHub https://github.com/LAF-labs/dimetric
스톡스토커: 국내/미국 주식 데이터 분석/스코어링 서비스. 100% 단독 기획/개발/배포. 배포 후 1주 동안 약 1,000명 방문, 12,000건 종목 조회. KIS/yfinance, Supabase snapshot cache, 서버 메모리 캐시, partial response, refresh cooldown. 사용자 피드백 기반 SEC/DART 공시 데이터 실시간 제공 및 룰베이스 요약 업데이트. URL https://stock-khaki.vercel.app GitHub https://github.com/LAF-labs/stock
사주중독: AI 사주분석 서비스. 결과 콘텐츠 구조, 12개 섹션 레이어별 사주 분석 프롬프트 엔지니어링, 운영자 Admin, 환불 관리, AI 모델 status 정책. 초기 매출 약 20만 원. URL https://www.sajuhook.com/

대학 창업 프로젝트:
자투리: 2023.01-2024.09. 메인 기획자 겸 PM. 인테리어 폐자재 거래/배송 서비스. 81개 업체 방문 설문, IA/플로우차트/정책문서, Figma 앱 디자인, 외주 개발 커뮤니케이션, Android MVP 배포, 80여 개 업체 PoC, 2023년 4분기 매출 1,057만 원, 거래건수 30.4%p 증가, 배송 서비스 이용률 11.3%p 증가, 에코스타트업 4,628만 원, 청년창업사관학교 6,000만 원.
테이스팃: 2024.01-2025.01. 팀 대표. 수입주류 취향/리뷰 데이터 기반 큐레이션 서비스. 700명 설문, 자영업자 6명 인터뷰, 800명 설문, 20명 심층 인터뷰, 600여 명 MVP 테스트, 구매 의향 82%, 제휴 검토 7개 업체, 확정 3개 업체, 예비창업패키지 서류 합격, 제2회 대한민국 대학 창업대전 한남대 대표팀 참가.
`.trim();

function offlineAnswer(question) {
  const q = question.replace(/\s+/g, " ");
  if (/디메트릭|dimetric|cad|3d|프린터|프린팅/i.test(q)) {
    return "Dimetric은 LLM 기반 Text to CAD 프로젝트입니다. 자연어로 3D 프린팅 도안을 만들고 Three.js로 확인하며, Python/build123d 기반 CAD engine과 출력성 검사, 스냅샷 흐름으로 실패한 CAD 변경이 원본을 망가뜨리지 않도록 설계했습니다.";
  }
  if (/이레|ireh|ire/i.test(q)) {
    return "ireh link에서는 외국인 의료관광 B2B 운영 시스템의 PRD, IA, 화면설계서, Figma 일부 디자인, QA 시트, 개발 매니징을 담당했습니다. 엑셀/수기 중심의 예약·정산·매출 흐름을 웹, 앱, Admin 구조로 전환했고, 마이그레이션 과정에서 매출 데이터 오류도 발견했습니다.";
  }
  if (/sippn|시픈|sip/i.test(q)) {
    return "sippn은 테이스팃에서 검증했던 취향/리뷰 기반 큐레이션 아이디어를 내부 신규 프로젝트로 제안해 발전시킨 사례입니다. 사용자군별 화면 구조, 일부 디자인, 개발 매니징, GA4 이벤트 설정/분석 작업을 담당했습니다.";
  }
  if (/스톡|stock|AI Native|ai/i.test(q)) {
    return "스톡스토커는 100% 단독 기획/개발/배포 프로젝트입니다. 국내/미국 주식 데이터를 수집, 정규화, 캐싱, 스코어링했고 배포 후 1주 동안 약 1,000명 방문과 12,000건 종목 조회를 기록했습니다. 피드백을 반영해 SEC/DART 공시 실시간 제공과 룰베이스 요약도 추가했습니다.";
  }
  if (/사주|saju/i.test(q)) {
    return "사주중독은 AI 사주분석 서비스입니다. 결과 콘텐츠 구조와 운영자 Admin, 환불 관리, AI 모델 status 정책을 설계했고 별도 마케팅 비용 없이 초기 매출 약 20만 원을 만들었습니다. 서비스 주소는 https://www.sajuhook.com/ 입니다.";
  }
  if (/스드맵|sdmap|웨딩/i.test(q)) {
    return "스드맵은 웨딩홀/스드메 정보와 리뷰를 비교하는 서비스입니다. 업체 정보/리뷰 관리 Admin과 사용자 검색/비교 UX를 분리해 설계했습니다. 서비스 주소는 https://www.sdmaps.com/ 입니다.";
  }
  if (/인터엑스|fit|적합|왜/i.test(q)) {
    return "인터엑스 Jr. PO와의 연결점은 AI Native 실행력, B2B/Admin 기획, 복잡한 데이터와 제품 로직 구조화입니다. Dimetric의 AI/CAD 검증 흐름, ireh link의 Admin 구조화, StockStalker의 데이터 제품 경험이 제조 AI Solution PO 역할과 이어집니다.";
  }
  return "김기범은 데블록에서 ireh link와 sippn의 기획/PM을 맡았고, 퇴사 후 Dimetric, StockStalker, 사주중독 등을 단독 제작했습니다. 강점은 AI 도구를 활용한 빠른 실행, B2B/Admin 구조화, 복잡한 데이터와 운영 프로세스의 제품화입니다.";
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function extractText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  const parts = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

async function handleChat(request, response) {
  const { messages = [] } = await readJson(request);
  const lastMessage = messages[messages.length - 1]?.content || "";

  if (!process.env.OPENAI_API_KEY) {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ mode: "offline", answer: offlineAnswer(lastMessage) }));
    return;
  }

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions:
          "너는 김기범의 포트폴리오 안내 챗봇이다. 아래 컨텍스트만 근거로 한국어로 간결하게 답한다. 모르는 내용은 추측하지 말고 확인이 필요하다고 말한다. 프로젝트명은 반드시 Dimetric, ireh link, sippn, StockStalker, SajuHook 표기를 사용하고 아이레 링크, 이레링크, sippen처럼 바꿔 쓰지 않는다.\n\n" +
          portfolioContext,
        input: messages.slice(-8).map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: [{ type: "input_text", text: String(message.content || "") }],
        })),
        temperature: 0.3,
        max_output_tokens: 500,
      }),
    });

    const data = await apiResponse.json();
    if (apiResponse.ok) {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ mode: "api", answer: extractText(data) || offlineAnswer(lastMessage) }));
      return;
    }
  } catch {
    // API 장애, 모델 capacity, 네트워크 실패는 로컬 답변으로 우회한다.
  }

  response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ mode: "offline", answer: offlineAnswer(lastMessage) }));
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://localhost:${port}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalized);

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/chat") {
      await handleChat(request, response);
      return;
    }
    if (request.method === "GET" || request.method === "HEAD") {
      await serveStatic(request, response);
      return;
    }
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method not allowed");
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: error.message || "Server error" }));
  }
});

server.listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}/`);
});
