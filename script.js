const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(".nav-links a");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

const getTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

const updateThemeControl = () => {
  const theme = getTheme();

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  if (themeToggleText) {
    themeToggleText.textContent = theme === "dark" ? "Dark" : "Light";
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", theme === "dark" ? "#081220" : "#73000a");
  }
};

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;

    try {
      localStorage.setItem("mithun-portfolio-theme", nextTheme);
    } catch (error) {
      // Theme still changes for this page even if storage is unavailable.
    }

    updateThemeControl();
    window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
  });
}

updateThemeControl();

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("open");
      document.body.classList.remove("nav-open");
    });
  });
}

const sections = Array.from(document.querySelectorAll("main section[id]"));

if ("IntersectionObserver" in window && sections.length > 0) {
  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navAnchors.forEach((anchor) => {
          const isActive = anchor.getAttribute("href") === `#${entry.target.id}`;
          anchor.classList.toggle("active", isActive);
        });
      });
    },
    {
      rootMargin: "-42% 0px -50% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => activeSectionObserver.observe(section));
}

const backgroundCanvas = document.querySelector("#it-bg");

if (backgroundCanvas) {
  const context = backgroundCanvas.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  const mouse = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.45 + window.scrollY,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.45 + window.scrollY,
    active: false,
    seen: false,
  };

  let colors = {
    navy: "17, 43, 70",
    teal: "15, 118, 110",
    garnet: "115, 0, 10",
    slate: "51, 65, 85",
    white: "255, 255, 255",
  };

  const cssRgb = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

  const refreshCanvasColors = () => {
    colors = {
      navy: cssRgb("--canvas-navy-rgb", "17, 43, 70"),
      teal: cssRgb("--canvas-teal-rgb", "15, 118, 110"),
      garnet: cssRgb("--canvas-garnet-rgb", "115, 0, 10"),
      slate: cssRgb("--canvas-slate-rgb", "51, 65, 85"),
      white: cssRgb("--canvas-white-rgb", "255, 255, 255"),
    };
  };

  refreshCanvasColors();

  const labels = [
    "SYS",
    "DB",
    "CLOUD",
    "AUTH",
    "API",
    "LOG",
    "PATCH",
    "TLS",
    "VM",
    "SQL",
    "SIEM",
    "HELP",
  ];

  const elementTypes = ["server", "database", "cloud", "terminal", "shield", "analytics", "router"];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let elements = [];
  let animationFrame = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const isDarkCanvas = () => getTheme() === "dark";
  const accentForElement = (element) => {
    const palette = [colors.teal, colors.garnet, colors.navy, colors.teal, colors.garnet, colors.navy, colors.teal];
    const index = Math.max(0, elementTypes.indexOf(element.type));
    return palette[index % palette.length];
  };

  const roundedRect = (x, y, w, h, radius) => {
    const r = Math.min(radius, w * 0.5, h * 0.5);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  };

  const setCanvasSize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight
    );
    backgroundCanvas.width = Math.floor(width * dpr);
    backgroundCanvas.height = Math.floor(height * dpr);
    backgroundCanvas.style.width = `${width}px`;
    backgroundCanvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const createElements = () => {
    const count = width < 680 ? Math.min(86, Math.max(44, Math.floor(height / 78))) : Math.min(190, Math.max(90, Math.floor((width * height) / 25000)));
    const columns = width < 760 ? 4 : Math.max(7, Math.ceil(Math.sqrt(count * (width / Math.max(height, 1))) * 1.85));
    const rows = Math.ceil(count / columns);
    const cellW = width / columns;
    const cellH = height / rows;

    elements = Array.from({ length: count }, (_, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const w = clamp(cellW * (0.28 + Math.random() * 0.12), 54, 98);
      const h = clamp(cellH * (0.18 + Math.random() * 0.1), 48, 66);
      const baseX = cellW * (col + 0.5) + (Math.random() - 0.5) * cellW * 0.52;
      const baseY = cellH * (row + 0.5) + (Math.random() - 0.5) * cellH * 0.52;

      return {
        type: elementTypes[index % elementTypes.length],
        label: labels[index % labels.length],
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        w,
        h,
        phase: Math.random() * Math.PI * 2,
        speed: 0.76 + Math.random() * 0.92,
        alpha: 0.34 + Math.random() * 0.18,
      };
    });
  };

  const resizeBackground = () => {
    setCanvasSize();
    createElements();
    drawBackground(performance.now());
  };

  const drawGrid = () => {
    const spacing = width < 680 ? 56 : 78;
    context.save();
    context.strokeStyle = `rgba(${colors.slate}, 0.035)`;
    context.lineWidth = 1;

    for (let x = spacing * 0.5; x < width; x += spacing) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    for (let y = spacing * 0.5; y < height; y += spacing) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    context.restore();
  };

  const drawCursorField = () => {
    if (!mouse.active || !mouse.seen || !finePointer.matches) {
      return;
    }

    const gradient = context.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
    gradient.addColorStop(0, `rgba(${colors.teal}, ${isDarkCanvas() ? 0.2 : 0.14})`);
    gradient.addColorStop(0.42, `rgba(${colors.garnet}, ${isDarkCanvas() ? 0.12 : 0.07})`);
    gradient.addColorStop(1, `rgba(${colors.teal}, 0)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(mouse.x, mouse.y, 260, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = `rgba(${isDarkCanvas() ? colors.teal : colors.navy}, ${isDarkCanvas() ? 0.24 : 0.16})`;
    context.lineWidth = 1;
    context.setLineDash([7, 9]);
    context.strokeRect(mouse.x - 58, mouse.y - 38, 116, 76);
    context.setLineDash([]);
  };

  const drawPanelShell = (element, highlight) => {
    const glow = highlight * 0.16;
    const accent = accentForElement(element);
    const alternate = element.type === "shield" || element.type === "terminal" ? colors.garnet : colors.teal;
    const left = element.x - element.w * 0.5;
    const top = element.y - element.h * 0.5;
    context.save();
    context.shadowColor = `rgba(${highlight > 0.35 ? alternate : accent}, ${0.1 + glow})`;
    context.shadowBlur = 12 + highlight * 22;
    context.fillStyle = isDarkCanvas()
      ? `rgba(${accent}, ${0.12 + highlight * 0.22})`
      : `rgba(${accent}, ${0.075 + highlight * 0.16})`;
    context.strokeStyle = isDarkCanvas()
      ? `rgba(${highlight > 0.3 ? colors.garnet : accent}, ${0.34 + highlight * 0.34})`
      : `rgba(${highlight > 0.3 ? colors.garnet : accent}, ${0.24 + highlight * 0.3})`;
    context.lineWidth = 1;
    roundedRect(left, top, element.w, element.h, 8);
    context.fill();
    context.stroke();
    context.fillStyle = `rgba(${alternate}, ${isDarkCanvas() ? 0.2 + highlight * 0.16 : 0.16 + highlight * 0.18})`;
    roundedRect(left + 8, top + 7, Math.min(30, element.w * 0.36), 3, 2);
    context.fill();
    context.restore();
  };

  const drawLabel = (element, highlight) => {
    context.save();
    context.font = "700 8.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    context.fillStyle = `rgba(${highlight > 0.35 ? colors.garnet : accentForElement(element)}, ${isDarkCanvas() ? 0.42 + highlight * 0.34 : 0.48 + highlight * 0.34})`;
    context.fillText(element.label, element.x - element.w * 0.5 + 8, element.y - element.h * 0.5 + 15);
    context.restore();
  };

  const drawServer = (element, elapsed, highlight) => {
    drawPanelShell(element, highlight);
    const left = element.x - element.w * 0.5 + 12;
    const top = element.y - element.h * 0.5 + 24;
    const rowH = Math.max(8, (element.h - 36) / 3);

    for (let i = 0; i < 3; i += 1) {
      const y = top + i * rowH;
      context.fillStyle = `rgba(${colors.navy}, ${0.07 + highlight * 0.08})`;
      roundedRect(left, y, element.w - 24, rowH - 4, 4);
      context.fill();
      context.fillStyle = `rgba(${i === Math.floor((elapsed + element.phase) % 3) ? colors.teal : colors.slate}, ${0.34 + highlight * 0.28})`;
      context.beginPath();
      context.arc(left + 10, y + rowH * 0.5 - 2, 2.4, 0, Math.PI * 2);
      context.fill();
      context.fillRect(left + 22, y + rowH * 0.5 - 3, element.w * (0.24 + i * 0.08), 2);
    }

    drawLabel(element, highlight);
  };

  const drawDatabase = (element, elapsed, highlight) => {
    drawPanelShell(element, highlight);
    const cx = element.x;
    const top = element.y - element.h * 0.28;
    const bodyH = element.h * 0.5;
    const rx = element.w * 0.24;
    const ry = element.h * 0.1;

    context.strokeStyle = `rgba(${colors.teal}, ${0.26 + highlight * 0.34})`;
    context.fillStyle = `rgba(${colors.teal}, ${0.06 + highlight * 0.08})`;
    context.lineWidth = 1.3;
    context.beginPath();
    context.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(cx - rx, top);
    context.lineTo(cx - rx, top + bodyH);
    context.ellipse(cx, top + bodyH, rx, ry, 0, Math.PI, 0, true);
    context.lineTo(cx + rx, top);
    context.stroke();

    for (let i = 1; i <= 2; i += 1) {
      context.beginPath();
      context.ellipse(cx, top + bodyH * (i / 3), rx, ry, 0, 0, Math.PI);
      context.strokeStyle = `rgba(${colors.slate}, ${0.12 + highlight * 0.12})`;
      context.stroke();
    }

    const scanY = top + ((elapsed * 14 + element.phase * 8) % Math.max(bodyH, 1));
    context.strokeStyle = `rgba(${colors.garnet}, ${0.16 + highlight * 0.3})`;
    context.beginPath();
    context.ellipse(cx, scanY, rx * 0.92, ry * 0.62, 0, 0, Math.PI);
    context.stroke();
    drawLabel(element, highlight);
  };

  const drawCloud = (element, elapsed, highlight) => {
    drawPanelShell(element, highlight);
    const cx = element.x;
    const cy = element.y + 3;
    const scale = Math.min(element.w / 120, element.h / 74);

    context.strokeStyle = `rgba(${colors.navy}, ${0.24 + highlight * 0.34})`;
    context.fillStyle = isDarkCanvas()
      ? `rgba(${colors.teal}, ${0.12 + highlight * 0.2})`
      : `rgba(${colors.teal}, ${0.12 + highlight * 0.18})`;
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(cx - 24 * scale, cy + 3 * scale, 17 * scale, Math.PI * 0.75, Math.PI * 1.85);
    context.arc(cx - 2 * scale, cy - 8 * scale, 22 * scale, Math.PI * 1.05, Math.PI * 1.9);
    context.arc(cx + 24 * scale, cy + 2 * scale, 17 * scale, Math.PI * 1.18, Math.PI * 2.25);
    context.lineTo(cx + 35 * scale, cy + 18 * scale);
    context.lineTo(cx - 36 * scale, cy + 18 * scale);
    context.closePath();
    context.fill();
    context.stroke();

    for (let i = 0; i < 3; i += 1) {
      const x = cx - 26 * scale + i * 26 * scale;
      const y = cy + 29 * scale + Math.sin(elapsed * 2 + element.phase + i) * 2;
      context.fillStyle = `rgba(${i === 1 ? colors.garnet : colors.teal}, ${0.22 + highlight * 0.34})`;
      context.fillRect(x, y, 16 * scale, 2);
    }

    drawLabel(element, highlight);
  };

  const drawTerminal = (element, elapsed, highlight) => {
    drawPanelShell(element, highlight);
    const left = element.x - element.w * 0.5 + 12;
    const top = element.y - element.h * 0.5 + 25;
    const innerW = element.w - 24;
    const innerH = element.h - 34;

    context.fillStyle = `rgba(${colors.navy}, ${0.08 + highlight * 0.08})`;
    roundedRect(left, top, innerW, innerH, 5);
    context.fill();

    const rows = 3;
    for (let i = 0; i < rows; i += 1) {
      const y = top + 12 + i * 11;
      const length = innerW * (0.34 + ((i + 1) * 0.13));
      context.fillStyle = `rgba(${i === 0 ? colors.garnet : colors.teal}, ${0.2 + highlight * 0.3})`;
      context.fillRect(left + 11, y, length, 2);
    }

    const cursorX = left + 14 + ((elapsed * 22 + element.phase * 10) % Math.max(innerW - 30, 1));
    context.fillStyle = `rgba(${colors.garnet}, ${0.34 + highlight * 0.42})`;
    context.fillRect(cursorX, top + innerH - 12, 9, 2);
    drawLabel(element, highlight);
  };

  const drawShield = (element, elapsed, highlight) => {
    drawPanelShell(element, highlight);
    const cx = element.x;
    const cy = element.y + 6;
    const size = Math.min(element.w, element.h) * 0.42;

    context.strokeStyle = `rgba(${colors.garnet}, ${0.24 + highlight * 0.44})`;
    context.fillStyle = `rgba(${colors.garnet}, ${0.05 + highlight * 0.08})`;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(cx, cy - size);
    context.quadraticCurveTo(cx + size * 0.75, cy - size * 0.66, cx + size * 0.62, cy + size * 0.08);
    context.quadraticCurveTo(cx + size * 0.48, cy + size * 0.68, cx, cy + size);
    context.quadraticCurveTo(cx - size * 0.48, cy + size * 0.68, cx - size * 0.62, cy + size * 0.08);
    context.quadraticCurveTo(cx - size * 0.75, cy - size * 0.66, cx, cy - size);
    context.closePath();
    context.fill();
    context.stroke();

    context.strokeStyle = `rgba(${colors.teal}, ${0.28 + highlight * 0.36})`;
    context.beginPath();
    context.moveTo(cx - size * 0.28, cy + size * 0.02);
    context.lineTo(cx - size * 0.06, cy + size * 0.24);
    context.lineTo(cx + size * 0.33, cy - size * 0.24);
    context.stroke();

    const sweep = (elapsed * 1.8 + element.phase) % 1;
    context.strokeStyle = `rgba(${colors.teal}, ${0.12 + highlight * 0.3})`;
    context.beginPath();
    context.moveTo(cx - size * 0.58 + sweep * size * 1.16, cy - size * 0.72);
    context.lineTo(cx - size * 0.58 + sweep * size * 1.16, cy + size * 0.72);
    context.stroke();
    drawLabel(element, highlight);
  };

  const drawAnalytics = (element, elapsed, highlight) => {
    drawPanelShell(element, highlight);
    const left = element.x - element.w * 0.5 + 16;
    const bottom = element.y + element.h * 0.28;
    const barW = Math.max(6, element.w * 0.08);

    for (let i = 0; i < 5; i += 1) {
      const wave = Math.sin(elapsed * 1.5 + element.phase + i * 0.8);
      const h = element.h * (0.18 + i * 0.045 + wave * 0.035);
      context.fillStyle = `rgba(${i % 2 ? colors.teal : colors.navy}, ${0.18 + highlight * 0.26})`;
      roundedRect(left + i * barW * 1.8, bottom - h, barW, h, 3);
      context.fill();
    }

    context.strokeStyle = `rgba(${colors.garnet}, ${0.22 + highlight * 0.34})`;
    context.lineWidth = 1.4;
    context.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const x = left + i * barW * 1.8 + barW * 0.5;
      const y = bottom - element.h * (0.22 + Math.sin(elapsed + element.phase + i) * 0.04 + i * 0.035);
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
    drawLabel(element, highlight);
  };

  const drawRouter = (element, elapsed, highlight) => {
    drawPanelShell(element, highlight);
    const left = element.x - element.w * 0.28;
    const top = element.y - element.h * 0.02;
    const w = element.w * 0.56;
    const h = element.h * 0.24;

    context.fillStyle = `rgba(${colors.navy}, ${0.08 + highlight * 0.08})`;
    context.strokeStyle = `rgba(${colors.navy}, ${0.2 + highlight * 0.24})`;
    roundedRect(left, top, w, h, 5);
    context.fill();
    context.stroke();

    for (let i = 0; i < 4; i += 1) {
      const active = Math.sin(elapsed * 3 + element.phase + i) > 0;
      context.fillStyle = `rgba(${active ? colors.teal : colors.slate}, ${0.24 + highlight * 0.28})`;
      context.beginPath();
      context.arc(left + 12 + i * 13, top + h * 0.5, 2.4, 0, Math.PI * 2);
      context.fill();
    }

    context.strokeStyle = `rgba(${colors.teal}, ${0.14 + highlight * 0.28})`;
    context.beginPath();
    context.moveTo(element.x - 24, top);
    context.quadraticCurveTo(element.x - 34, top - 16, element.x - 48, top - 19);
    context.moveTo(element.x + 24, top);
    context.quadraticCurveTo(element.x + 34, top - 16, element.x + 48, top - 19);
    context.stroke();
    drawLabel(element, highlight);
  };

  const drawElement = (element, elapsed) => {
    const dx = element.x - mouse.x;
    const dy = element.y - mouse.y;
    const distance = Math.hypot(dx, dy);
    const highlight = mouse.active && mouse.seen && finePointer.matches ? clamp(1 - distance / 230, 0, 1) : 0;
    const lift = highlight * -11;

    context.save();
    element.x += 0;
    element.y += lift;

    if (element.type === "server") {
      drawServer(element, elapsed, highlight);
    } else if (element.type === "database") {
      drawDatabase(element, elapsed, highlight);
    } else if (element.type === "cloud") {
      drawCloud(element, elapsed, highlight);
    } else if (element.type === "terminal") {
      drawTerminal(element, elapsed, highlight);
    } else if (element.type === "shield") {
      drawShield(element, elapsed, highlight);
    } else if (element.type === "analytics") {
      drawAnalytics(element, elapsed, highlight);
    } else {
      drawRouter(element, elapsed, highlight);
    }

    element.y -= lift;
    context.restore();
  };

  const drawFloatingStatus = (elapsed) => {
    context.save();
    context.font = "700 8.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

    const count = Math.min(92, Math.max(34, Math.floor(height / 86)));

    for (let i = 0; i < count; i += 1) {
      const x = ((i * 173 + elapsed * 38) % (width + 180)) - 90;
      const y = 42 + ((i * 157) % Math.max(height - 84, 1));
      const text = labels[(i + Math.floor(elapsed)) % labels.length];
      context.fillStyle = `rgba(${i % 3 === 0 ? colors.garnet : i % 3 === 1 ? colors.teal : colors.navy}, ${isDarkCanvas() ? 0.13 : 0.08})`;
      context.fillText(text, x, y);
    }

    context.restore();
  };

  const drawTelemetryStream = (elapsed) => {
    context.save();
    context.lineWidth = 1;

    const lanes = Math.min(34, Math.max(14, Math.floor(height / 210)));

    for (let lane = 0; lane < lanes; lane += 1) {
      const y = 92 + lane * (height / Math.max(lanes, 1));
      const direction = lane % 2 === 0 ? 1 : -1;
      const offset = (elapsed * (56 + lane * 4) * direction + lane * 141) % (width + 240);
      const x = direction > 0 ? offset - 120 : width - offset + 120;
      const alpha = 0.045 + (lane % 3) * 0.018;

      context.strokeStyle = `rgba(${lane % 3 === 0 ? colors.garnet : colors.teal}, ${alpha})`;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + direction * 78, y);
      context.lineTo(x + direction * 98, y + 12);
      context.lineTo(x + direction * 158, y + 12);
      context.stroke();

      context.fillStyle = `rgba(${lane % 3 === 0 ? colors.garnet : colors.teal}, ${alpha + 0.05})`;
      context.fillRect(x + direction * 158 - 3, y + 9, 6, 6);
    }

    context.restore();
  };

  const drawBackground = (timestamp) => {
    const elapsed = timestamp * 0.001;
    const motionElapsed = elapsed * 1.35;
    context.clearRect(0, 0, width, height);

    mouse.x += (mouse.targetX - mouse.x) * 0.28;
    mouse.y += (mouse.targetY - mouse.y) * 0.28;

    drawGrid();
    drawFloatingStatus(motionElapsed);
    drawTelemetryStream(motionElapsed);

    elements.forEach((element) => {
      if (!reducedMotion.matches) {
        element.x = element.baseX + Math.cos(motionElapsed * element.speed + element.phase) * 10;
        element.y = element.baseY + Math.sin(motionElapsed * element.speed * 0.9 + element.phase) * 9;
      } else {
        element.x = element.baseX;
        element.y = element.baseY;
      }

      drawElement(element, motionElapsed);
    });

    drawCursorField();

    if (!reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(drawBackground);
    }
  };

  window.addEventListener("pointermove", (event) => {
    mouse.targetX = event.clientX;
    mouse.targetY = event.clientY + window.scrollY;
    mouse.active = true;
    mouse.seen = true;
  });

  window.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  window.addEventListener("blur", () => {
    mouse.active = false;
  });

  window.addEventListener("scroll", () => {
    if (mouse.active) {
      mouse.targetY = clamp(mouse.targetY, window.scrollY, window.scrollY + window.innerHeight);
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeBackground();

    if (!reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(drawBackground);
    }
  });

  window.addEventListener("portfolio-theme-change", () => {
    refreshCanvasColors();
    drawBackground(performance.now());
  });

  reducedMotion.addEventListener("change", () => {
    window.cancelAnimationFrame(animationFrame);
    resizeBackground();

    if (!reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(drawBackground);
    }
  });

  resizeBackground();

  if (!reducedMotion.matches) {
    animationFrame = window.requestAnimationFrame(drawBackground);
  }
}
