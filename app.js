const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatStatus = document.querySelector("#chat-status");
const chatSubmit = chatForm?.querySelector("button");
const chatPanel = document.querySelector(".chat-panel");
const chatToggle = document.querySelector(".chat-toggle");
const chatLauncher = document.querySelector(".chat-launcher");

const messages = [];

function setChatOpen(open) {
  if (!chatPanel || !chatToggle || !chatLauncher) return;
  chatPanel.classList.toggle("is-open", open);
  chatPanel.setAttribute("aria-hidden", String(!open));
  chatToggle.setAttribute("aria-expanded", String(open));
  chatLauncher.setAttribute("aria-expanded", String(open));
  chatLauncher.hidden = open;
  if (open && chatInput) requestAnimationFrame(() => chatInput.focus());
}

function localFallback(question) {
  const normalized = question.replace(/\s+/g, " ");
  if (/디메트릭|dimetric|cad|3d|프린터|프린팅/i.test(normalized)) {
    return "Dimetric은 LLM 기반 Text to CAD 프로젝트입니다. 자연어 요청을 Graph Patch로 구조화하고, CAD 컴파일 검증과 스냅샷 흐름을 거친 뒤 모델에 반영하도록 설계했습니다.";
  }
  if (/이레|ireh|ire/i.test(normalized)) {
    return "ireh link에서는 외국인 의료관광 B2B 운영 시스템의 PRD, IA, 화면설계서, Figma 일부 디자인, QA 시트, 개발 매니징을 맡았습니다. 엑셀/칠판/수기 업무를 Admin, 앱, 매출 대시보드 구조로 전환한 경험이 핵심입니다.";
  }
  if (/sippn|시픈|sip/i.test(normalized)) {
    return "sippn은 테이스팃 (Taste-it)에서 검증했던 취향/리뷰 기반 큐레이션 아이디어를 데블록 (Devlock) 내부 신규 프로젝트로 제안해 발전시킨 사례입니다. 사용자군별 화면 구조, 일부 디자인, 개발 매니징, GA4 이벤트 흐름을 담당했습니다.";
  }
  if (/스톡|stock|공시|dart|sec|ai/i.test(normalized)) {
    return "StockStalker는 단독 기획/개발/배포 프로젝트입니다. 배포 후 1주 약 1,000명 방문과 12,000건 종목 조회를 기록했고, 사용자 피드백을 반영해 SEC/DART 공시 데이터와 룰베이스 요약을 추가했습니다.";
  }
  if (/사주|saju/i.test(normalized)) {
    return "사주중독은 AI 사주분석 서비스입니다. 결과 콘텐츠 구조, 운영자 Admin, 환불/모델 상태 정책을 설계했고 초기 매출 약 20만 원을 만들었습니다.";
  }
  if (/인터엑스|fit|적합|강점|요약|왜/i.test(normalized)) {
    return "김기범의 강점은 AI Native 실행력, B2B/Admin 기획 경험, 복잡한 데이터와 운영 프로세스를 제품 구조로 바꾸는 능력입니다. Dimetric의 AI/CAD 검증 흐름, ireh link의 Admin 구조화, StockStalker의 데이터 제품 경험이 인터엑스 Jr. PO와 연결됩니다.";
  }
  return "김기범은 데블록에서 ireh link와 sippn의 기획/PM을 맡았고, 퇴사 후 Dimetric, StockStalker, 사주중독 등을 단독 제작했습니다. 복잡한 업무와 데이터를 Admin, Dashboard, 비교 UX, AI 검증 흐름으로 구조화하는 PM 후보입니다.";
}

function appendMessage(role, text, options = {}) {
  if (!chatLog) return null;
  const item = document.createElement("div");
  item.className = `message ${role}`;
  if (options.html) item.innerHTML = text;
  else item.textContent = text;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
  return item;
}

function setStatus(text) {
  if (chatStatus) chatStatus.textContent = text;
}

async function askPortfolio(question) {
  const trimmed = question.trim();
  if (!trimmed || !chatInput || !chatSubmit) return;

  setChatOpen(true);
  messages.push({ role: "user", content: trimmed });
  appendMessage("user", trimmed);
  chatInput.value = "";

  const pending = appendMessage(
    "assistant",
    '<span class="typing-dots" aria-label="응답 생성 중"><span></span><span></span><span></span></span>',
    { html: true }
  );
  setStatus("응답 중");
  chatSubmit.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "API 요청에 실패했습니다.");

    pending.textContent = data.answer;
    messages.push({ role: "assistant", content: data.answer });
    setStatus(data.mode === "offline" ? "로컬 답변" : "API 연결됨");
  } catch {
    const answer = localFallback(trimmed);
    pending.textContent = answer;
    messages.push({ role: "assistant", content: answer });
    setStatus("브라우저 fallback");
  } finally {
    chatSubmit.disabled = false;
    chatInput.focus();
  }
}

function setupChat() {
  if (!chatForm || !chatInput) return;

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    askPortfolio(chatInput.value);
  });

  chatInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    chatForm.requestSubmit();
  });

  chatLauncher?.addEventListener("click", () => setChatOpen(true));
  chatToggle?.addEventListener("click", () => setChatOpen(false));

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => askPortfolio(button.dataset.question || ""));
  });

  appendMessage("system", "김기범의 프로젝트, 이력, 인터엑스 적합성에 대해 질문할 수 있습니다.");
  setChatOpen(false);
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function setupHeroNarrative() {
  const hero = document.querySelector(".ib-hero");
  const frame = document.querySelector(".hero-frame");
  if (!hero || !frame) return;

  const current = document.querySelector("[data-hero-current]");
  const bar = document.querySelector("[data-hero-progress]");
  const items = [...document.querySelectorAll(".narrative-item")];

  function updateHero() {
    const rect = hero.getBoundingClientRect();
    const maxScroll = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / maxScroll);
    const narrativeProgress = clamp((progress - 0.16) / 0.78);
    const activeIndex = Math.min(items.length - 1, Math.floor(narrativeProgress * items.length));
    const introOpacity = clamp(1 - progress * 4.2);
    const introY = Math.round(progress * -120);
    const mediaScale = 1.06 + progress * 0.14;

    frame.style.setProperty("--hero-progress", progress.toFixed(4));
    frame.style.setProperty("--intro-opacity", introOpacity.toFixed(4));
    frame.style.setProperty("--intro-y", `${introY}px`);
    frame.style.setProperty("--media-scale", mediaScale.toFixed(4));
    frame.dataset.step = String(Math.max(0, activeIndex));
    frame.classList.toggle("is-scrolling", progress > 0.06);
    frame.classList.toggle("is-narrating", progress > 0.14);

    if (current) current.textContent = String(activeIndex + 1).padStart(2, "0");
    if (bar) bar.style.transform = `scaleX(${narrativeProgress.toFixed(4)})`;
    items.forEach((item, index) => item.classList.toggle("is-active", index === activeIndex));
  }

  updateHero();
  window.addEventListener("scroll", updateHero, { passive: true });
  window.addEventListener("resize", updateHero);
}

function setupTextReveal() {
  document.querySelectorAll("[data-text-reveal]").forEach((element) => {
    if (element.dataset.split === "true") return;
    const words = element.textContent.trim().split(/(\s+)/);
    let index = 0;
    element.innerHTML = words
      .map((part) => {
        if (/^\s+$/.test(part)) return part;
        const word = `<span class="word" style="--word-index:${index}">${part}</span>`;
        index += 1;
        return word;
      })
      .join("");
    element.dataset.split = "true";
  });
}

function setupReveal() {
  const targets = [
    ...document.querySelectorAll(
    "[data-text-reveal], .reveal-clip, .case-media, .case-copy, .featured-evidence, .evidence-grid article, .closing-section"
    ),
  ];

  function revealByViewport() {
    targets.forEach((target) => {
      if (target.classList.contains("is-visible")) return;
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.04 && rect.bottom > window.innerHeight * -0.16) {
        target.classList.add("is-visible");
      }
    });
  }

  if (!("IntersectionObserver" in window) || reduceMotion) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.14 }
  );

  targets.forEach((target) => observer.observe(target));
  revealByViewport();
  window.addEventListener("scroll", revealByViewport, { passive: true });
  window.addEventListener("resize", revealByViewport);
}

function setupMarquee() {
  document.querySelectorAll("[data-marquee] .marquee-track").forEach((track) => {
    if (track.dataset.cloned === "true") return;
    track.innerHTML += track.innerHTML;
    track.dataset.cloned = "true";
  });
}

function setupMetricCarousel() {
  const section = document.querySelector(".metrics-section");
  const stage = document.querySelector(".metric-card-stage");
  const track = document.querySelector("[data-metric-track]");
  if (!section || !stage || !track) return;

  function update() {
    const maxX = Math.max(track.scrollWidth - stage.clientWidth, 0);
    const rect = section.getBoundingClientRect();
    const maxScroll = Math.max(section.offsetHeight - window.innerHeight, 1);
    const startOffset = Math.min(460, maxScroll * 0.34);
    const progress = clamp((-rect.top - startOffset) / Math.max(maxScroll - startOffset, 1));
    track.style.setProperty("--metric-x", `${Math.round(-maxX * progress)}px`);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function setupCounts() {
  const countTargets = document.querySelectorAll("[data-count]");
  countTargets.forEach((target) => {
    target.textContent = Number(target.dataset.count || 0).toLocaleString("ko-KR");
  });
}

setupTextReveal();
setupMarquee();
setupHeroNarrative();
setupReveal();
setupMetricCarousel();
setupCounts();
setupChat();
