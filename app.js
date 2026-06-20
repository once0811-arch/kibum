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

function apiUnavailableMessage() {
  return "Poppy API 연결에 문제가 있어 지금은 답변을 생성하지 못했습니다. 서버를 다시 시작한 뒤 다시 질문해주세요.";
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
      setStatus(data.mode === "api" ? "Poppy API connected" : "Poppy API unavailable");
    } catch {
      answer = apiUnavailableMessage();
      setStatus("Poppy API unavailable");
    }

    typing.remove();
    appendMessage("assistant", answer || apiUnavailableMessage());
    messages.push({ role: "assistant", content: answer || apiUnavailableMessage() });
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
