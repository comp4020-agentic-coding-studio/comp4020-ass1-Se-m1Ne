import skyImageUrl from "./assets/task01-sky-canvas-transparent-v4.png";

interface NavActions {
  next: () => void;
  restart: () => void;
  recheck: () => void;
}
type Render = (container: HTMLElement, nav: NavActions) => void;

function heading(container: HTMLElement, text: string): void {
  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  h1.textContent = text;
  container.appendChild(h1);
}

function paragraph(container: HTMLElement, text: string): void {
  const p = document.createElement("p");
  p.textContent = text;
  container.appendChild(p);
}

const SYSTEM_ACTION_PRIMARY = "system-action system-action-primary";
const SYSTEM_ACTION_SECONDARY = "system-action system-action-secondary";

function actionButton(container: HTMLElement, label: string, onClick: () => void, className?: string): void {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (className) {
    button.className = className;
  }
  button.addEventListener("click", onClick);
  container.appendChild(button);
}

function renderWelcome(container: HTMLElement, nav: NavActions): void {
  const stage = document.createElement("div");
  stage.className = "welcome-stage";
  container.appendChild(stage);

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  h1.className = "term-heading";
  stage.appendChild(h1);

  let finished = false;

  function advance(): void {
    if (finished) {
      return;
    }
    finished = true;
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("click", onClick);
    nav.next();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      return;
    }
    advance();
  }

  function onClick(): void {
    advance();
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", onClick);

  async function idleLoop(): Promise<void> {
    while (!finished) {
      await typeText(h1, "WELCOME", () => finished);
      if (finished) {
        break;
      }
      const cursor = createCursor();
      h1.appendChild(cursor);
      await sleep(10000);
      if (finished) {
        break;
      }
      h1.textContent = "";
      await sleep(600);
      if (finished) {
        break;
      }
    }
  }

  void idleLoop();
}

const BRIEFING_LINES = [
  "Some parts of the following environment may not reflect the world as you know it.",
  "Proceed through each stage using your own judgement.",
  "Instructions for each task will be provided individually.",
];

async function runTypedTerminalSequence(
  h1: HTMLElement,
  headingText: string,
  terminal: HTMLElement,
  lines: string[],
): Promise<void> {
  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      return;
    }
    skipCurrentTyping();
  }

  function onClick(): void {
    skipCurrentTyping();
  }

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", onClick);

  await typeText(h1, headingText);
  await sleep(300);

  for (let i = 0; i < lines.length; i += 1) {
    await typeLine(terminal, lines[i]);
    if (i < lines.length - 1) {
      await sleep(300);
    }
  }
  await sleep(700);

  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("click", onClick);
}

async function runBriefingSequence(
  h1: HTMLElement,
  terminal: HTMLElement,
  container: HTMLElement,
  nav: NavActions,
): Promise<void> {
  await runTypedTerminalSequence(
    h1,
    "BRIEFING",
    terminal,
    BRIEFING_LINES.map((line) => `> ${line}`),
  );

  actionButton(
    container,
    "CONFIRM",
    () => {
      container.classList.remove("term-wide");
      nav.next();
    },
    SYSTEM_ACTION_PRIMARY,
  );
}

function renderBriefing(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runBriefingSequence(h1, terminal, container, nav);
}

function renderTaskPlaceholder(n: number): Render {
  return (container, nav) => {
    heading(container, `Task ${n}`);
    paragraph(container, `Task ${n} Placeholder.`);
    actionButton(container, "CONFIRM", nav.next, SYSTEM_ACTION_PRIMARY);
  };
}

const TASK1_HEADING = "SKY CONFIGURATION";
const TASK1_INSTRUCTION = "Set the colour of the sky.";

const TASK1_WIDTH = 640;
const TASK1_HEIGHT = 360;

const TASK1_PALETTE = [
  "#6F8FA8",
  "#748992",
  "#7E9E99",
  "#817F99",
  "#A7B0B4",
  "#283743",
  "#718B7B",
  "#11171C",
];

type Task1Tool = "small-brush" | "large-brush" | "eraser" | "fill";

type RgbaColor = [number, number, number, number];

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function buildSkyMask(img: HTMLImageElement): Uint8Array {
  const offscreen = document.createElement("canvas");
  offscreen.width = TASK1_WIDTH;
  offscreen.height = TASK1_HEIGHT;
  const ctx = offscreen.getContext("2d")!;
  ctx.drawImage(img, 0, 0, TASK1_WIDTH, TASK1_HEIGHT);
  const data = ctx.getImageData(0, 0, TASK1_WIDTH, TASK1_HEIGHT).data;

  const mask = new Uint8Array(TASK1_WIDTH * TASK1_HEIGHT);
  for (let i = 0; i < mask.length; i += 1) {
    mask[i] = data[i * 4 + 3] === 0 ? 1 : 0;
  }
  return mask;
}

function hexToRgba(hex: string): RgbaColor {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
}

function readPixel(data: Uint8ClampedArray, index: number): RgbaColor {
  const o = index * 4;
  return [data[o], data[o + 1], data[o + 2], data[o + 3]];
}

function writePixel(data: Uint8ClampedArray, index: number, color: RgbaColor): void {
  const o = index * 4;
  data[o] = color[0];
  data[o + 1] = color[1];
  data[o + 2] = color[2];
  data[o + 3] = color[3];
}

function colorsEqual(a: RgbaColor, b: RgbaColor): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function buildTask1Interface(
  img: HTMLImageElement,
  mask: Uint8Array,
): { frame: HTMLElement; palette: HTMLElement; tools: HTMLElement } {
  const frame = document.createElement("div");
  frame.className = "task1-canvas-frame";

  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = TASK1_WIDTH;
  baseCanvas.height = TASK1_HEIGHT;
  baseCanvas.className = "task1-base-canvas";
  baseCanvas.setAttribute("aria-hidden", "true");
  const baseCtx = baseCanvas.getContext("2d")!;
  baseCtx.drawImage(img, 0, 0, TASK1_WIDTH, TASK1_HEIGHT);

  const paintCanvas = document.createElement("canvas");
  paintCanvas.width = TASK1_WIDTH;
  paintCanvas.height = TASK1_HEIGHT;
  paintCanvas.className = "task1-paint-canvas";
  paintCanvas.setAttribute("role", "img");
  paintCanvas.setAttribute("aria-label", "Editable pixel-art sky. Drawing is limited to the transparent sky area.");
  const paintCtx = paintCanvas.getContext("2d")!;

  frame.append(paintCanvas, baseCanvas);

  let selectedTool: Task1Tool = "small-brush";
  let selectedColor = TASK1_PALETTE[0];
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function toNativeCoords(event: PointerEvent): { x: number; y: number } {
    const rect = paintCanvas.getBoundingClientRect();
    return {
      x: Math.floor(((event.clientX - rect.left) / rect.width) * TASK1_WIDTH),
      y: Math.floor(((event.clientY - rect.top) / rect.height) * TASK1_HEIGHT),
    };
  }

  function stampAt(x: number, y: number, size: number, erase: boolean): void {
    const half = Math.floor(size / 2);
    for (let dy = -half; dy < size - half; dy += 1) {
      const py = y + dy;
      if (py < 0 || py >= TASK1_HEIGHT) {
        continue;
      }
      for (let dx = -half; dx < size - half; dx += 1) {
        const px = x + dx;
        if (px < 0 || px >= TASK1_WIDTH) {
          continue;
        }
        if (mask[py * TASK1_WIDTH + px] !== 1) {
          continue;
        }
        if (erase) {
          paintCtx.clearRect(px, py, 1, 1);
        } else {
          paintCtx.fillStyle = selectedColor;
          paintCtx.fillRect(px, py, 1, 1);
        }
      }
    }
  }

  function strokeTo(x: number, y: number): void {
    const size = selectedTool === "large-brush" ? 6 : 2;
    const erase = selectedTool === "eraser";
    const steps = Math.max(Math.abs(x - lastX), Math.abs(y - lastY), 1);
    for (let s = 0; s <= steps; s += 1) {
      const ix = Math.round(lastX + ((x - lastX) * s) / steps);
      const iy = Math.round(lastY + ((y - lastY) * s) / steps);
      stampAt(ix, iy, size, erase);
    }
    lastX = x;
    lastY = y;
  }

  function floodFill(x: number, y: number): void {
    const startIndex = y * TASK1_WIDTH + x;
    if (mask[startIndex] !== 1) {
      return;
    }

    const imageData = paintCtx.getImageData(0, 0, TASK1_WIDTH, TASK1_HEIGHT);
    const data = imageData.data;
    const targetColor = readPixel(data, startIndex);
    const fillColor = hexToRgba(selectedColor);
    if (colorsEqual(targetColor, fillColor)) {
      return;
    }

    const visited = new Uint8Array(TASK1_WIDTH * TASK1_HEIGHT);
    const stack: number[] = [startIndex];
    visited[startIndex] = 1;

    while (stack.length > 0) {
      const index = stack.pop()!;
      if (mask[index] !== 1 || !colorsEqual(readPixel(data, index), targetColor)) {
        continue;
      }
      writePixel(data, index, fillColor);

      const px = index % TASK1_WIDTH;
      const py = Math.floor(index / TASK1_WIDTH);
      const neighbors = [
        px > 0 ? index - 1 : -1,
        px < TASK1_WIDTH - 1 ? index + 1 : -1,
        py > 0 ? index - TASK1_WIDTH : -1,
        py < TASK1_HEIGHT - 1 ? index + TASK1_WIDTH : -1,
      ];
      for (const neighbor of neighbors) {
        if (neighbor >= 0 && !visited[neighbor]) {
          visited[neighbor] = 1;
          stack.push(neighbor);
        }
      }
    }

    paintCtx.putImageData(imageData, 0, 0);
  }

  paintCanvas.addEventListener("pointerdown", (event) => {
    const { x, y } = toNativeCoords(event);
    if (x < 0 || x >= TASK1_WIDTH || y < 0 || y >= TASK1_HEIGHT) {
      return;
    }
    event.preventDefault();
    if (selectedTool === "fill") {
      floodFill(x, y);
      return;
    }
    paintCanvas.setPointerCapture(event.pointerId);
    drawing = true;
    lastX = x;
    lastY = y;
    strokeTo(x, y);
  });

  paintCanvas.addEventListener("pointermove", (event) => {
    if (!drawing) {
      return;
    }
    event.preventDefault();
    const { x, y } = toNativeCoords(event);
    strokeTo(x, y);
  });

  function stopDrawing(event: PointerEvent): void {
    if (!drawing) {
      return;
    }
    drawing = false;
    if (paintCanvas.hasPointerCapture(event.pointerId)) {
      paintCanvas.releasePointerCapture(event.pointerId);
    }
  }

  paintCanvas.addEventListener("pointerup", stopDrawing);
  paintCanvas.addEventListener("pointercancel", stopDrawing);

  const palette = document.createElement("div");
  palette.className = "task1-palette";
  const swatchButtons: HTMLButtonElement[] = [];

  function selectColor(color: string): void {
    selectedColor = color;
    for (const swatch of swatchButtons) {
      swatch.setAttribute("aria-pressed", String(swatch.dataset.color === color));
    }
  }

  for (const color of TASK1_PALETTE) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "task1-swatch";
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.setAttribute("aria-label", `Colour ${color}`);
    swatch.setAttribute("aria-pressed", String(color === selectedColor));
    swatch.addEventListener("click", () => selectColor(color));
    swatchButtons.push(swatch);
    palette.appendChild(swatch);
  }

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "task1-color-input";
  colorInput.value = selectedColor;
  colorInput.setAttribute("aria-label", "Custom colour");
  colorInput.addEventListener("input", () => selectColor(colorInput.value));
  palette.appendChild(colorInput);

  const tools = document.createElement("div");
  tools.className = "task1-tools";
  const toolButtons: HTMLButtonElement[] = [];

  const TOOL_DEFS: { tool: Task1Tool; label: string }[] = [
    { tool: "small-brush", label: "SMALL BRUSH" },
    { tool: "large-brush", label: "LARGE BRUSH" },
    { tool: "eraser", label: "ERASER" },
    { tool: "fill", label: "FILL" },
  ];

  function selectTool(tool: Task1Tool): void {
    selectedTool = tool;
    for (const button of toolButtons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.tool === tool),
      );
    }
  }

  for (const def of TOOL_DEFS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = def.label;
    button.dataset.tool = def.tool;
    button.setAttribute("aria-label", def.label);
    button.setAttribute("aria-pressed", String(def.tool === selectedTool));
    button.addEventListener("click", () => selectTool(def.tool));
    toolButtons.push(button);
    tools.appendChild(button);
  }

  return { frame, palette, tools };
}

function renderTask1(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runTask1Sequence(h1, terminal, container, nav);
}

async function runTask1Sequence(
  h1: HTMLElement,
  terminal: HTMLElement,
  container: HTMLElement,
  nav: NavActions,
): Promise<void> {
  await sleep(0);

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      return;
    }
    skipCurrentTyping();
  }
  function onClick(): void {
    skipCurrentTyping();
  }
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", onClick);

  await typeText(h1, TASK1_HEADING);
  await sleep(300);
  await typeLine(terminal, TASK1_INSTRUCTION);
  await sleep(400);

  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("click", onClick);

  if (!terminal.isConnected) {
    return;
  }

  const img = await loadImage(skyImageUrl);

  if (!terminal.isConnected) {
    return;
  }

  if (img === null) {
    await typeLine(terminal, "Sky asset unavailable.");
    if (!terminal.isConnected) {
      return;
    }
    actionButton(container, "CONFIRM", nav.next, SYSTEM_ACTION_PRIMARY);
    return;
  }

  const mask = buildSkyMask(img);
  const { frame, palette, tools } = buildTask1Interface(img, mask);

  const workspace = document.createElement("div");
  workspace.className = "task1-workspace";
  container.appendChild(workspace);

  frame.classList.add("task1-reveal-in");
  workspace.appendChild(frame);
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  const controls = document.createElement("div");
  controls.className = "task1-controls";
  workspace.appendChild(controls);

  palette.classList.add("task1-reveal-in");
  controls.appendChild(palette);
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  tools.classList.add("task1-reveal-in");
  controls.appendChild(tools);
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.textContent = "CONFIRM";
  nextButton.className = `task1-reveal-in ${SYSTEM_ACTION_PRIMARY}`;
  nextButton.addEventListener("click", nav.next);
  container.appendChild(nextButton);
}

const CHOICE_LINES = [
  "> The environment has been aligned.",
  "",
  "> No inconsistencies were detected.",
  "",
  "> Do you confirm this reality?",
];

async function runChoiceSequence(
  h1: HTMLElement,
  terminal: HTMLElement,
  container: HTMLElement,
  nav: NavActions,
): Promise<void> {
  await sleep(0);
  await runTypedTerminalSequence(h1, "REALITY CONFIRMATION", terminal, CHOICE_LINES);

  actionButton(
    container,
    "CONFIRM REALITY",
    () => {
      container.classList.remove("term-wide");
      nav.next();
    },
    SYSTEM_ACTION_PRIMARY,
  );
  actionButton(
    container,
    "RECHECK ENVIRONMENT",
    () => {
      container.classList.remove("term-wide");
      nav.recheck();
    },
    SYSTEM_ACTION_SECONDARY,
  );
}

function renderChoice(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runChoiceSequence(h1, terminal, container, nav);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Enter") {
        document.removeEventListener("keydown", onKeyDown);
        resolve();
      }
    }
    document.addEventListener("keydown", onKeyDown);
  });
}

function waitForEscape(): Promise<void> {
  return new Promise((resolve) => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        document.removeEventListener("keydown", onKeyDown);
        resolve();
      }
    }
    document.addEventListener("keydown", onKeyDown);
  });
}

const TYPE_CHAR_MS = 80;

let activeTypeSkip: (() => void) | null = null;

function skipCurrentTyping(): void {
  activeTypeSkip?.();
}

function typeText(el: HTMLElement, text: string, isCancelled?: () => boolean): Promise<void> {
  if (text.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let done = false;

    function finish(): void {
      if (done) {
        return;
      }
      done = true;
      el.textContent = text;
      if (activeTypeSkip === finish) {
        activeTypeSkip = null;
      }
      resolve();
    }

    activeTypeSkip = finish;

    let i = 0;
    function typeNext(): void {
      if (done) {
        return;
      }
      if (isCancelled?.()) {
        done = true;
        if (activeTypeSkip === finish) {
          activeTypeSkip = null;
        }
        resolve();
        return;
      }
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        setTimeout(typeNext, TYPE_CHAR_MS);
      } else {
        finish();
      }
    }
    setTimeout(typeNext, TYPE_CHAR_MS);
  });
}

function typeLine(terminal: HTMLElement, text: string): Promise<HTMLElement> {
  const line = document.createElement("div");
  line.className = "term-line";
  terminal.appendChild(line);
  return typeText(line, text).then(() => line);
}

function createCursor(): HTMLElement {
  const cursor = document.createElement("span");
  cursor.className = "term-cursor";
  cursor.textContent = "▏";
  return cursor;
}

function terminalProgress(
  host: HTMLElement,
  label: string,
): { track: HTMLElement; fill: HTMLElement; readout: HTMLElement } {
  const row = document.createElement("div");
  row.className = "term-progress-row";

  const track = document.createElement("div");
  track.className = "term-progress-track";
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "100");
  track.setAttribute("aria-valuenow", "0");
  track.setAttribute("aria-label", label);

  const fill = document.createElement("div");
  fill.className = "term-progress-fill";
  track.appendChild(fill);
  row.appendChild(track);

  const readout = document.createElement("span");
  readout.className = "term-progress-readout";
  readout.textContent = "0%";
  row.appendChild(readout);

  host.appendChild(row);
  return { track, fill, readout };
}

function animateTerminalProgress(
  track: HTMLElement,
  fill: HTMLElement,
  readout: HTMLElement,
  targetPercent: number,
  durationMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    function tick(now: number): void {
      const t = Math.min((now - start) / durationMs, 1);
      const value = t * targetPercent;
      const rounded = Math.round(value);
      fill.style.width = `${value}%`;
      track.setAttribute("aria-valuenow", String(rounded));
      readout.textContent = `${rounded}%`;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}

const STUCK_PRECISION_LABELS = ["42%", "42.0%", "42.00%", "42.000%", "42.000000%"];

async function escalateStuckPrecision(readout: HTMLElement): Promise<void> {
  for (const label of STUCK_PRECISION_LABELS) {
    readout.textContent = label;
    await sleep(500);
  }
}

async function runTerminalStep(terminal: HTMLElement, message: string, durationMs: number): Promise<void> {
  await typeLine(terminal, `> ${message}`);
  const { track, fill, readout } = terminalProgress(terminal, message);
  await animateTerminalProgress(track, fill, readout, 100, durationMs);
}

function createSystemWindow(
  layer: HTMLElement,
  title: string,
  offsetYPx: number,
  maxWidth: string,
  offsetXPx = 0,
): { root: HTMLElement; body: HTMLElement } {
  const root = document.createElement("div");
  root.className = "sys-window";
  root.style.top = `calc(50vh + ${offsetYPx}px)`;
  root.style.left = `calc(50% + ${offsetXPx}px)`;
  root.style.maxWidth = maxWidth;

  const titleBar = document.createElement("div");
  titleBar.className = "sys-window-title";
  titleBar.textContent = title;

  const body = document.createElement("div");
  body.className = "sys-window-body";

  root.append(titleBar, body);
  layer.appendChild(root);
  return { root, body };
}

async function runAlignmentSequence(terminal: HTMLElement, windowsLayer: HTMLElement, nav: NavActions): Promise<void> {
  await typeLine(terminal, "REALITY ALIGNMENT");
  await sleep(300);
  await runTerminalStep(terminal, "Checking reality consistency...", 1650);
  await sleep(300);
  await runTerminalStep(terminal, "Aligning environment...", 1650);
  await sleep(300);
  await runTerminalStep(terminal, "Restoring stable state...", 1650);
  await sleep(400);
  await typeLine(terminal, "Reality Alignment Complete.");
  await typeLine(terminal, "Current environment verified.");
  await sleep(800);

  await typeLine(terminal, "");
  await typeLine(terminal, "> Initiating external reality verification...");
  await sleep(600);
  await typeLine(terminal, "> Checking external reality...");
  const check = terminalProgress(terminal, "Checking external reality");
  await animateTerminalProgress(check.track, check.fill, check.readout, 42, 2000);
  await escalateStuckPrecision(check.readout);
  await sleep(600);

  await typeLine(terminal, "External verification unavailable.");
  await typeLine(terminal, "Manual continuation required.");
  const prompt = await typeLine(terminal, "Press ENTER to continue.");
  prompt.classList.add("term-prompt");
  await waitForEnter();

  const verifyWindow = createSystemWindow(windowsLayer, "EXTERNAL REALITY VERIFICATION", -95, "420px", -18);
  paragraph(verifyWindow.body, "Checking...");
  const verify = terminalProgress(verifyWindow.body, "External reality verification");
  await animateTerminalProgress(verify.track, verify.fill, verify.readout, 42, 2000);
  await escalateStuckPrecision(verify.readout);
  await sleep(600);

  const errorWindow = createSystemWindow(windowsLayer, "ERROR", 0, "320px", 18);
  paragraph(errorWindow.body, "Verification failed.");
  await sleep(1500);

  const statusWindow = createSystemWindow(windowsLayer, "SYSTEM STATUS", 95, "380px");
  paragraph(statusWindow.body, "External reality status:");
  paragraph(statusWindow.body, "unknown.");

  await sleep(700);

  const debugRef = document.createElement("div");
  debugRef.className = "debug-reference";
  windowsLayer.appendChild(debugRef);

  await typeLine(debugRef, "reference:");
  await typeLine(debugRef, "Brain in a Vat");
  await typeLine(debugRef, "ESC → return to reality?");

  await waitForEscape();
  nav.restart();
}

function renderReflection(container: HTMLElement, nav: NavActions): void {
  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  const windowsLayer = document.createElement("div");
  windowsLayer.className = "sys-windows-layer";
  windowsLayer.setAttribute("aria-live", "polite");
  container.appendChild(windowsLayer);

  void runAlignmentSequence(terminal, windowsLayer, nav);
}

const FIRST_TASK_INDEX = 2;

const SEQUENCE: Render[] = [
  renderWelcome,
  renderBriefing,
  renderTask1,
  ...Array.from({ length: 19 }, (_, i) => renderTaskPlaceholder(i + 2)),
  renderChoice,
  renderReflection,
];

let currentIndex = 0;
const container = document.querySelector<HTMLElement>("#screen")!;

function show(index: number): void {
  currentIndex = index;
  container.replaceChildren();
  container.classList.remove("term-wide");
  SEQUENCE[currentIndex](container, {
    next: () => show(currentIndex + 1),
    restart: () => show(0),
    recheck: () => show(FIRST_TASK_INDEX),
  });
  container.querySelector("h1")?.focus();
}

show(0);
