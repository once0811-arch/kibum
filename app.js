const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
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
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  targets.forEach((target) => observer.observe(target));
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const format = (value, decimals) =>
    Number(value).toLocaleString("ko-KR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const animate = (element) => {
    if (element.dataset.counted === "true") return;
    element.dataset.counted = "true";

    const end = Number(element.dataset.count || 0);
    const decimals = Number(element.dataset.decimals || 0);
    const suffix = element.dataset.suffix || "";

    if (prefersReducedMotion) {
      element.textContent = `${format(end, decimals)}${suffix}`;
      return;
    }

    const duration = 1300;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = clamp((now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = end * eased;
      element.textContent = `${format(current, decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.25 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const screens = [...hero.querySelectorAll("[data-hero-screen]")];
  const indexItems = [...hero.querySelectorAll("[data-hero-index-item]")];
  const indexCurrent = hero.querySelector("[data-hero-index]");
  const sceneProgress = hero.querySelector("[data-hero-scene-progress]");
  const jumpButtons = hero.querySelectorAll("[data-hero-jump]");
  let currentScene = -1;
  let ticking = false;

  const setScene = (scene) => {
    if (scene === currentScene) return;
    currentScene = scene;
    hero.dataset.scene = String(scene);
    if (indexCurrent) indexCurrent.textContent = String(scene + 1).padStart(2, "0");

    screens.forEach((screen, index) => {
      screen.classList.toggle("is-active", index === scene);
      screen.classList.toggle("is-before", index < scene);
      screen.classList.toggle("is-after", index > scene);
    });

    indexItems.forEach((item, index) => item.classList.toggle("is-active", index === scene));
  };

  const update = () => {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const scrollable = Math.max(hero.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / scrollable);
    const sceneFloat = Math.min(progress * 3, 2.999);
    const scene = Math.min(2, Math.floor(sceneFloat));
    setScene(scene);

    hero.style.setProperty("--hero-progress", progress.toFixed(4));
    if (sceneProgress) sceneProgress.style.transform = `scaleX(${progress})`;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  jumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const scene = Number(button.dataset.heroJump || 0);
      const top = window.scrollY + hero.getBoundingClientRect().top;
      const scrollable = Math.max(hero.offsetHeight - window.innerHeight, 1);
      window.scrollTo({ top: top + scrollable * (scene / 3 + 0.04), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  if (!prefersReducedMotion && window.matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      hero.style.setProperty("--pointer-x", x.toFixed(3));
      hero.style.setProperty("--pointer-y", y.toFixed(3));
    });
  }

  setScene(0);
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function setupSystem() {
  const section = document.querySelector("[data-system]");
  if (!section) return;

  const steps = [...section.querySelectorAll("[data-system-step]")];
  const nodes = [...section.querySelectorAll("[data-system-node]")];
  const jumpTargets = [...section.querySelectorAll("[data-system-jump], [data-system-node]")];
  let active = -1;
  let ticking = false;

  const setActive = (index) => {
    if (index === active || index < 0) return;
    active = index;
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    nodes.forEach((node, i) => node.classList.toggle("is-active", i === index));
    jumpTargets.forEach((target, i) => {
      const targetIndex = Number(target.dataset.systemJump ?? target.dataset.systemNode ?? i);
      target.classList.toggle("is-active", targetIndex === index);
    });
  };

  const update = () => {
    ticking = false;
    const sectionRect = section.getBoundingClientRect();
    const entered = Math.max(-sectionRect.top, 0);
    section.classList.toggle("is-deep", entered > window.innerHeight * 0.34);

    const targetY = window.innerHeight * 0.5;
    let bestIndex = 0;
    let bestDistance = Infinity;

    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - targetY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    setActive(bestIndex);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  jumpTargets.forEach((target, index) => {
    target.addEventListener("click", () => {
      const targetIndex = Number(target.dataset.systemJump ?? target.dataset.systemNode ?? index);
      const stepIndex = Number.isFinite(targetIndex) ? targetIndex : index;
      const step = steps[stepIndex];
      if (!step) return;
      const rect = step.getBoundingClientRect();
      const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight * 0.5;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  setActive(0);
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function setupHeaderAndProgress() {
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-scroll-progress]");
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  let lastY = window.scrollY;
  let ticking = false;

  const lightSelectors = ".proof-section, .work-intro, .project--ireh, .project--stock, .evidence-section";

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progress) progress.style.transform = `scaleX(${clamp(y / max)})`;

    if (header) {
      const pointX = Math.min(window.innerWidth / 2, window.innerWidth - 1);
      const pointY = Math.min(118, window.innerHeight - 1);
      const underHeader = document.elementFromPoint(pointX, pointY);
      header.classList.toggle("is-light", Boolean(underHeader?.closest(lightSelectors)));

      const movingDown = y > lastY + 8;
      const movingUp = y < lastY - 8;
      if (movingDown && y > 320 && !document.body.classList.contains("is-chat-open")) header.classList.add("is-hidden");
      if (movingUp || y < 180) header.classList.remove("is-hidden");
      lastY = y;
    }

    let activeId = "";
    const targetY = window.innerHeight * 0.35;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom >= targetY) activeId = section.dataset.section || "";
    });

    const isWorkProject = document.elementFromPoint(window.innerWidth / 2, Math.min(targetY, window.innerHeight - 1))?.closest("[data-project]");
    if (isWorkProject) activeId = "work";

    navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.nav === activeId));
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function setupPointerEffects() {
  if (prefersReducedMotion || !window.matchMedia("(pointer:fine)").matches) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${(-y * 3.2).toFixed(2)}deg) rotateY(${(x * 4.2).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll("[data-parallax-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1400px) rotateX(${(-y * 1.5).toFixed(2)}deg) rotateY(${(x * 2).toFixed(2)}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      button.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function localFallback(question) {
  const q = question.replace(/\s+/g, " ").trim();

  if (/디메트릭|dimetric|cad|3d|프린터|프린팅/i.test(q)) {
    return "Dimetric은 자연어 요청을 수정 가능한 파라메트릭 수치로 해석해 CAD에 반영하는 단독 기획·개발 프로젝트입니다. 많은 학생과 예비창업자가 3D 프린터를 더 쉽게 쓸 수 있도록, Graph Patch → CAD Compile → Snapshot 검증을 거치게 해 실패한 변경이 원본을 망가뜨리지 않도록 설계했습니다.";
  }

  if (/이레|ireh|어드민|admin|운영/i.test(q)) {
    return "Ireh Link에서는 의료관광 외국인, 통역사, 병원, 관리자가 각각 다른 표면에서 움직이는 복잡한 운영을 웹·앱·Admin 구조로 엮었습니다. PRD, IA, 화면설계서, 일부 Figma 디자인, QA, 개발 매니징을 담당했고 월 매출 8억 규모 업체에 납품됐습니다.";
  }

  if (/스톡|stock|주식|데이터/i.test(q)) {
    return "StockStalker는 국내·미국 주식 데이터를 수집·캐싱·스코어링해 비교 가능한 판단 화면으로 만든 단독 제품입니다. 출시 첫 주 약 1,000명이 방문해 12,000건의 종목 조회를 만들었고, 사용자 피드백을 반영해 SEC·DART 공시와 룰베이스 요약을 추가했습니다.";
  }

  if (/sippn|시픈|테이스팃|taste/i.test(q)) {
    return "sippn은 대학 창업 프로젝트 테이스팃에서 검증한 취향·리뷰 기반 큐레이션 아이디어를 회사 내부 신규 프로젝트로 제안해 발전시킨 사례입니다. 테이스팃에서는 700~800명 설문, 20명 심층 인터뷰, 600여 명 MVP 테스트, 구매 의향 82%, 제휴 검토 7곳·확정 3곳을 직접 검증했습니다.";
  }

  if (/자투리|zaturi|jaturi|창업|매출|poc/i.test(q)) {
    return "자투리에서는 81개 업체 방문 설문, Android MVP 배포, 80여 개 업체 PoC를 진행했습니다. 2023년 4분기 매출 1,057만 원, 거래 건수 30.4%p 증가, 배송 서비스 이용률 11.3%p 증가를 기록했고 정부지원 1억 628만 원을 확보했습니다.";
  }

  if (/인터엑스|interx|적합|fit|왜/i.test(q)) {
    return "INTERX 역할과 연결되는 핵심은 세 가지입니다. Dimetric에서 모델 응답의 검증·복구 흐름을 설계한 경험, ireh link에서 수기 운영을 Admin과 Dashboard로 전환한 경험, StockStalker에서 분산 데이터를 사용자의 판단 화면으로 만든 경험입니다. 제조 도메인은 새로 배우되, 배운 내용을 요구사항·데이터 흐름·QA 기준으로 빠르게 고정할 수 있습니다.";
  }

  if (/수치|성과|숫자|요약/i.test(q)) {
    return "대표 수치는 StockStalker 출시 첫 주 1,000명 방문·12,000건 조회, 자투리 2023년 4분기 매출 1,057만 원·거래 건수 30.4%p 증가, 테이스팃 700~800명 설문·20명 인터뷰·600여 명 MVP 테스트·구매 의향 82%입니다.";
  }

  if (/에이아이|ai|자동화|도구/i.test(q)) {
    return "김기범은 OpenAI Codex, Claude Code, Obsidian, LLM Wiki, Hermes Agent, OpenClaw를 하나의 작업 루프로 엮어 씁니다. 요구와 근거는 Obsidian·LLM Wiki에 남기고, Codex·Claude Code로 구현과 검토를 돌린 뒤, OpenClaw·Hermes로 반복 작업을 쪼갭니다.";
  }

  return "이 부분은 Poppy가 확인한 자료만으로는 정확히 답하기 어렵습니다. 면접에서 기범님께 직접 질문해주시면 더 정확히 답변드릴 수 있습니다.";
}

function setupChat() {
  const panel = document.querySelector("#portfolio-chat");
  const log = document.querySelector("#chat-log");
  const form = document.querySelector("#chat-form");
  const input = document.querySelector("#chat-input");
  const status = document.querySelector("#chat-status");
  const openButtons = document.querySelectorAll("[data-open-chat]");
  const closeButtons = document.querySelectorAll("[data-close-chat]");
  const suggestionButtons = document.querySelectorAll("[data-question]");
  const submitButton = form?.querySelector("button[type='submit']");
  const messages = [];
  let lastOpener = null;
  let busy = false;

  if (!panel || !log || !form || !input) return;

  const setStatus = (text) => {
    if (status) status.textContent = text;
  };

  const appendMessage = (role, text, options = {}) => {
    const message = document.createElement("div");
    message.className = `chat-message chat-message--${role}`;

    if (options.typing) {
      message.classList.add("is-typing");
      message.innerHTML = "<i></i><i></i><i></i>";
    } else {
      message.textContent = text;
    }

    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
    return message;
  };

  const open = (opener) => {
    lastOpener = opener || document.activeElement;
    document.body.classList.add("is-chat-open");
    panel.setAttribute("aria-hidden", "false");
    openButtons.forEach((button) => button.setAttribute("aria-expanded", "true"));

    if (!log.children.length) {
      appendMessage("assistant", "안녕하세요, Poppy입니다. 기범님의 프로젝트, 역할, 수치, INTERX 적합성을 공개 가능한 자료 안에서 답변드릴게요.");
    }

    window.setTimeout(() => input.focus(), 260);
  };

  const close = () => {
    document.body.classList.remove("is-chat-open");
    panel.setAttribute("aria-hidden", "true");
    openButtons.forEach((button) => button.setAttribute("aria-expanded", "false"));
    if (lastOpener instanceof HTMLElement) lastOpener.focus();
  };

  const ask = async (question) => {
    const clean = question.trim();
    if (!clean || busy) return;

    busy = true;
    input.value = "";
    input.style.height = "auto";
    appendMessage("user", clean);
    messages.push({ role: "user", content: clean });
    const typing = appendMessage("assistant", "", { typing: true });
    if (submitButton) submitButton.disabled = true;
    setStatus("답변 구성 중");

    let answer = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.slice(-8) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      answer = String(data.answer || "").trim();
      setStatus(data.mode === "api" ? "Poppy API connected" : "Poppy ready");
    } catch {
      answer = localFallback(clean);
      setStatus("Poppy ready");
    }

    typing.remove();
    appendMessage("assistant", answer || localFallback(clean));
    messages.push({ role: "assistant", content: answer || localFallback(clean) });
    busy = false;
    if (submitButton) submitButton.disabled = false;
    input.focus();
  };

  openButtons.forEach((button) => button.addEventListener("click", () => open(button)));
  closeButtons.forEach((button) => button.addEventListener("click", close));
  suggestionButtons.forEach((button) => button.addEventListener("click", () => ask(button.dataset.question || button.textContent || "")));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask(input.value);
    }
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("is-chat-open")) close();
  });
}

setupReveal();
setupCounters();
setupHero();
setupSystem();
setupHeaderAndProgress();
setupPointerEffects();
setupChat();
