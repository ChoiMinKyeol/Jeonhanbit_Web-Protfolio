(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const main = $("main");
  const sections = $$(".snap-section");
  const indicatorBtns = $$(".indicator-btn");

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  indicatorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.target;
      scrollToSection(id);
    });
  });

  function setActiveIndicator(id) {
    indicatorBtns.forEach((b) => b.classList.toggle("active", b.dataset.target === id));
    document.body.dataset.section = id;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.getAttribute("id");
      if (id) setActiveIndicator(id);
    },
    { root: main, threshold: [0.45, 0.6, 0.75] }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));

  const revealEls = $$(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
      });
    },
    { root: main, threshold: 0.25 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  const parallaxEls = $$("[data-parallax-speed]");
  let rafId = null;

  function onScrollParallax() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const y = main ? main.scrollTop : window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = Number(el.dataset.parallaxSpeed || 0.15);
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    });
  }

  if (main) main.addEventListener("scroll", onScrollParallax, { passive: true });

  const skillTabs = $$("#skill .skills-tab");
  const skillIcons = $$("#skill .skill-icon");

  function applySkillFilter(group) {
    skillTabs.forEach((t) => t.classList.toggle("is-active", t.dataset.skill === group));
    skillIcons.forEach((icon) => {
      const g = icon.dataset.skillGroup;
      const match = g === group;
      icon.classList.toggle("is-dimmed", !match);
      icon.classList.toggle("is-active", match);
    });
  }

  if (skillTabs.length && skillIcons.length) {
    applySkillFilter(skillTabs[0].dataset.skill);
    skillTabs.forEach((tab) => {
      tab.addEventListener("click", () => applySkillFilter(tab.dataset.skill));
    });
  }

  const careerTrack = $(".career-track");
  const careerCards = $$(".career-card");
  const prevBtn = $(".career-nav.prev");
  const nextBtn = $(".career-nav.next");
  const dots = $$(".career-dot");

  let trackInner = $(".career-track-inner");
  if (careerTrack && !trackInner) {
    trackInner = document.createElement("div");
    trackInner.className = "career-track-inner";
    careerCards.forEach((c) => trackInner.appendChild(c));
    careerTrack.appendChild(trackInner);
  }

  let careerIndex = 0;

  function updateCareerUI() {
    if (!trackInner) return;
    trackInner.style.transform = `translateX(${-careerIndex * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === careerIndex));
  }

  function goCareer(idx) {
    const max = Math.max(0, careerCards.length - 1);
    careerIndex = Math.min(max, Math.max(0, idx));
    updateCareerUI();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => goCareer(careerIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goCareer(careerIndex + 1));
  dots.forEach((d) => d.addEventListener("click", () => goCareer(Number(d.dataset.index || 0))));

  updateCareerUI();

  function syncCareerCardHeight() {
    const cards = $$(".career-slider .card");
    if (!cards.length) return;

    if (window.innerWidth <= 768) {
      cards.forEach((card) => card.style.removeProperty("--career-card-height"));
      return;
    }

    const baseCard = cards[1]; 
    if (!baseCard) return;

    cards.forEach((card) => card.style.removeProperty("--career-card-height"));

    requestAnimationFrame(() => {
      const h = baseCard.offsetHeight;
      cards.forEach((card) => card.style.setProperty("--career-card-height", `${h}px`));
    });
  }

  window.addEventListener("load", syncCareerCardHeight);
  window.addEventListener("resize", syncCareerCardHeight);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => syncCareerCardHeight()).catch(() => {});
  }

  const wheel = $("#awardWheel");
  const wheelItems = wheel ? $$(".wheel-item", wheel) : [];
  const awardImg = $("#awardImage");

  function setAwardActive(index) {
    if (!wheelItems.length) return;

    const max = wheelItems.length - 1;
    const i = Math.min(max, Math.max(0, index));

    wheelItems.forEach((item, idx) => {
      item.classList.remove("active", "up1", "up2", "down1", "down2");
      const diff = idx - i;
      if (diff === 0) item.classList.add("active");
      else if (diff === -1) item.classList.add("up1");
      else if (diff === -2) item.classList.add("up2");
      else if (diff === 1) item.classList.add("down1");
      else if (diff === 2) item.classList.add("down2");
      else item.style.opacity = "0";
    });

    wheelItems.forEach((item) => {
      if (item.classList.contains("active")) item.style.opacity = "";
      else if (item.classList.contains("up1") || item.classList.contains("down1")) item.style.opacity = "";
      else if (item.classList.contains("up2") || item.classList.contains("down2")) item.style.opacity = "";
      else item.style.opacity = "0";
    });

    if (awardImg) {
      const num = String(i + 1).padStart(2, "0");
      awardImg.src = `images/award${num}.png`;
      awardImg.alt = wheelItems[i]?.textContent?.trim() || "Award";
    }

    wheelItems.forEach((item) => {
      if (item.classList.contains("active")) item.style.transform = "translateY(0) scale(1)";
      else if (item.classList.contains("up1")) item.style.transform = "translateY(-40px) scale(0.92)";
      else if (item.classList.contains("up2")) item.style.transform = "translateY(-80px) scale(0.86)";
      else if (item.classList.contains("down1")) item.style.transform = "translateY(40px) scale(0.92)";
      else if (item.classList.contains("down2")) item.style.transform = "translateY(80px) scale(0.86)";
      else item.style.transform = "translateY(0) scale(0.8)";
    });

    awardIndex = i;
  }

  let awardIndex = 0;
  setAwardActive(0);

  if (wheel) {
    wheel.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? 1 : -1;
        setAwardActive(awardIndex + dir);
      },
      { passive: false }
    );
  }

  let dragging = false;
  let startY = 0;
  let acc = 0;
  const STEP = 24;

  function onDown(e) {
    dragging = true;
    startY = e.clientY;
    acc = 0;
    wheel?.setPointerCapture?.(e.pointerId);
  }

  function onMove(e) {
    if (!dragging) return;
    const dy = e.clientY - startY;
    startY = e.clientY;
    acc += dy;

    while (acc >= STEP) {
      acc -= STEP;
      setAwardActive(awardIndex - 1);
    }
    while (acc <= -STEP) {
      acc += STEP;
      setAwardActive(awardIndex + 1);
    }
  }

  function onUp() {
    dragging = false;
  }

  if (wheel) {
    wheel.addEventListener("pointerdown", onDown);
    wheel.addEventListener("pointermove", onMove);
    wheel.addEventListener("pointerup", onUp);
    wheel.addEventListener("pointercancel", onUp);
    wheelItems.forEach((item, idx) => {
      item.addEventListener("click", () => setAwardActive(idx));
    });
  }

  window.addEventListener("load", () => {
    const rects = sections.map((s) => ({ s, r: s.getBoundingClientRect() }));
    const topMost = rects.sort((a, b) => Math.abs(a.r.top) - Math.abs(b.r.top))[0];
    if (topMost?.s?.id) setActiveIndicator(topMost.s.id);
    syncCareerCardHeight();
  });
})();