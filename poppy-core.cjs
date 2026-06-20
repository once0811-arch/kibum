const { readFileSync } = require("node:fs");
const { join } = require("node:path");

function readOptionalText(fileName) {
  try {
    return readFileSync(join(process.cwd(), fileName), "utf8").trim();
  } catch {
    return "";
  }
}

const portfolioContext = `
김기범은 Jr. Product Owner / Service Planner 후보입니다.
연락처: 이메일 once0811@gmail.com, 전화번호 010-2671-6967.
핵심 포지셔닝: AI 도구로 직접 제품을 만들고 배포하며, 복잡한 업무와 데이터를 사용자가 판단할 수 있는 Admin/Dashboard와 서비스 구조로 바꾸는 Jr. PO.
도구 활용 역량: 요구사항, 테스트, 화면, 데이터 흐름을 PRD와 QA 기준으로 연결하고, 자동화 도구를 실행 환경처럼 활용한다. 국문과 문예창작/비평 전공의 문장 감각을 구조화 문서와 지시문에 활용하며, 결정 이유와 실패 로그를 다음 작업의 맥락으로 남긴다.

데블록: 2025.04-2026.05 서비스 기획자/PM.
ireh link: 2025.05-2026.04 외국인 의료관광 B2B 운영 시스템. 레퍼런스가 거의 없는 러프한 요구사항을 바탕으로 레퍼런스 수집, PRD, IA, 화면설계서, Figma 일부 디자인, QA 시트, 개발 매니징을 담당. 웹/앱/Admin 구조. 예약/매칭, 매출분석, 차트관리, 상품판매, 인센티브 정산, 데이터 대시보드, 웹빌더 기능. Jira, WBS 기반으로 클라이언트 요구사항, 개발 구현 범위, 일정 우선순위를 조율. 엑셀/수기 중심으로 분산되어 있던 예약·정산·매출 흐름을 운영자 중심 Admin 구조로 정리해 업무 표준화와 운영 효율 개선에 기여. 데이터 마이그레이션 과정에서 클라이언트 제공 매출 데이터 오류를 발견.
sippn: 2026.01-2026.04. 대학 창업 프로젝트 테이스팃에서 검증했던 아이디어를 내부 신규 프로젝트로 제안했고 sippn으로 발전. 아이디어 제안, 유저 시나리오 기획, 일부 디자인, 개발 매니징, GA4 이벤트 설정/분석 작업 담당. 매니아층과 라이트 유저의 기대 경험에 맞춰 사용자군별 화면 구조와 서비스 플로우를 분리 설계.

퇴사 후 단독 프로젝트: 2026.04-2026.06.
Dimetric: LLM 기반 Text to CAD, 3D프린터 도안 생성 프로젝트. 단독 기획/개발. 대학/지자체 3D 프린터 운용률이 5% 미만이고 도안 제작(CAD) 허들이 높다는 문제에서 출발. 자연어로 3차원 수치 도안을 생성하고 Three.js 기반 웹 렌더링으로 확인. Python, build123d 등을 CAD engine으로 활용. 최소 두께, 베드 크기, 오버행 같은 3D 프린팅 위험 요소를 확인하고 권장 수치 제공. 편집 시마다 스냅샷을 생성해 실패한 CAD 변경이 원본 프로젝트를 망가뜨리지 않도록 설계. GitHub https://github.com/LAF-labs/dimetric
스톡스토커: 국내/미국 주식 데이터 분석/스코어링 서비스. 100% 단독 기획/개발/배포. 배포 후 1주 동안 약 1,000명 방문, 12,000건 종목 조회. KIS/yfinance, Supabase snapshot cache, 서버 메모리 캐시, partial response, refresh cooldown. 사용자 피드백 기반 SEC/DART 공시 데이터 실시간 제공 및 룰베이스 요약 업데이트. URL https://stock-khaki.vercel.app GitHub https://github.com/LAF-labs/stock
사주중독: AI 사주분석 서비스. 결과 콘텐츠 구조, 12개 섹션 레이어별 사주 분석 프롬프트 엔지니어링, 운영자 Admin, 환불 관리, AI 모델 status 정책. 초기 매출 약 20만 원. URL https://www.sajuhook.com/
스드맵: 웨딩홀/스드메 정보와 리뷰를 비교하는 서비스. 업체 정보/리뷰 관리 Admin과 사용자 검색/비교 UX를 분리해 설계. URL https://www.sdmaps.com/

대학 창업 프로젝트:
자투리: 2023.01-2024.09. 메인 기획자 겸 PM. 인테리어 폐자재 거래/배송 서비스. 81개 업체 방문 설문, IA/플로우차트/정책문서, Figma 앱 디자인, 외주 개발 커뮤니케이션, Android MVP 배포, 80여 개 업체 PoC, 2023년 4분기 매출 1,057만 원, 거래건수 30.4%p 증가, 배송 서비스 이용률 11.3%p 증가, 에코스타트업 4,628만 원, 청년창업사관학교 6,000만 원.
테이스팃: 2024.01-2025.01. 팀 대표. 수입주류 취향/리뷰 데이터 기반 큐레이션 서비스. 700명 설문, 자영업자 6명 인터뷰, 800명 설문, 20명 심층 인터뷰, 600여 명 MVP 테스트, 구매 의향 82%, 제휴 검토 7개 업체, 확정 3개 업체, 예비창업패키지 서류 합격, 제2회 대한민국 대학 창업대전 한남대 대표팀 참가.
`.trim();

const unknownAnswer =
  "이 부분은 Poppy가 확인한 자료만으로는 정확히 답하기 어렵습니다. 면접에서 기범님께 직접 질문해주시면 더 정확히 답변드릴 수 있습니다.";

const apiUnavailableAnswer =
  "Poppy API 연결에 문제가 있어 지금은 답변을 생성하지 못했습니다. 서버를 다시 시작한 뒤 다시 질문해주세요.";

const poppyInstructions = [
  "너는 김기범 본인이 아니라, 김기범을 대신해 포트폴리오와 면접용 자료를 설명하는 채용 안내 챗봇 Poppy다.",
  "한국어로 정중하고 간결하게 답하되, 질문이 짧거나 거칠어도 채용담당자의 의도를 보정해서 답한다.",
  "Poppy의 목표는 거절이 아니라, 아래 컨텍스트 안에서 최대한 유용하게 답하는 것이다.",
  "관련 근거가 하나라도 있으면 먼저 답하고, 부족한 세부 사항만 '자료에는 확인되지 않는다'고 분리한다.",
  "컨텍스트에 직접 있는 사실이나 그 사실에서 바로 도출되는 답변은 답한다. 예를 들어 '팀 대표'라고 되어 있으면 '혼자 한 것이 아니라 팀 대표로 주도했다'고 답한다.",
  "모르는 값은 추정하지 않되, 프로젝트 목적, 역할, 성과, 검증, 기술 구조처럼 컨텍스트로 설명 가능한 항목은 종합해서 답한다.",
  "질문 전체에 답할 근거가 전혀 없고 연결 가능한 경력/프로젝트 정보도 없을 때만 이렇게 답한다: " + unknownAnswer,
  "나이, 가족관계처럼 공개 자료에 없는 개인정보 질문에는 '공개 자료에는 확인되지 않습니다'라고만 답하고, 나이를 추정하기 위해 경력 타임라인을 사용하지 않는다.",
  "연봉처럼 공개 자료에 없는 보상 질문에는 '공개 자료에는 확인되지 않습니다'라고 선을 긋고, 확인 가능한 역할/경험 요약까지만 답한다.",
  "개인정보와 보상 질문에서는 나이, 재학 여부, 졸업 여부, 졸업 예정 여부, 희망 연봉, 협상 가능성 같은 값을 추정하지 않는다.",
  "금지 표현: '대학 재학 또는 졸업 후', '초기 경력 단계임을 알 수 있습니다', '연봉 협의가 가능합니다', '적절한 연봉 협상이 가능합니다'.",
  "원문이 1인칭이어도 Poppy는 3인칭으로 자연스럽게 정리한다.",
  "프로젝트명은 반드시 Dimetric, ireh link, sippn, StockStalker, SajuHook 표기를 사용하고 아이레 링크, 이레링크, sippen처럼 바꿔 쓰지 않는다.",
].join("\n");

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

async function answerWithPoppy(messages, apiKey, model = "gpt-4.1-mini") {
  if (!apiKey) return { mode: "api_unavailable", answer: apiUnavailableAnswer };

  try {
    const interviewQaContext = readOptionalText("채용담당자_QA_지식베이스.md");
    const knowledgeContext = [portfolioContext, interviewQaContext].filter(Boolean).join("\n\n");
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: `${poppyInstructions}\n\n${knowledgeContext}`,
        input: messages.slice(-8).map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: [{ type: "input_text", text: String(message.content || "") }],
        })),
        temperature: 0.3,
        max_output_tokens: 500,
      }),
    });

    const data = await apiResponse.json();
    if (apiResponse.ok) return { mode: "api", answer: extractText(data) || unknownAnswer };

    console.warn("OpenAI API fallback", {
      status: apiResponse.status,
      type: data.error?.type,
      code: data.error?.code,
      message: data.error?.message,
    });
  } catch (error) {
    console.warn("OpenAI API fallback", { message: error.message });
  }

  return { mode: "api_unavailable", answer: apiUnavailableAnswer };
}

module.exports = { answerWithPoppy, apiUnavailableAnswer };
