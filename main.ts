import skyImageUrl from "./assets/task01-sky-canvas-transparent-v4.png";
import task2BackgroundUrl from "./assets/task02-light-placement-background-v1.png";
import task2StarUrl from "./assets/task02-star.png";
import task2MoonUrl from "./assets/task02-moon.png";
import task2SunUrl from "./assets/task02-sun.png";
import task3BackgroundUrl from "./assets/task03-rainfall-background-v1.png";
import task3StormCloudUrl from "./assets/task03-storm-cloud.png";
import task3WhiteCloudUrl from "./assets/task03-white-cloud.png";

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
  terminal.className = "align-terminal briefing-terminal";
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

const TASK2_HEADING = "LIGHT SOURCE CONFIGURATION";
const TASK2_INSTRUCTION = "Place light sources.";

const TASK2_WIDTH = 640;
const TASK2_HEIGHT = 360;

type Task2SourceType = "star" | "moon" | "sun";

const TASK2_SOURCE_DEFS: { type: Task2SourceType; label: string }[] = [
  { type: "star", label: "STAR" },
  { type: "moon", label: "MOON" },
  { type: "sun", label: "SUN" },
];

interface Task2PlacedObject {
  type: Task2SourceType;
  x: number;
  y: number;
  width: number;
  height: number;
  el: HTMLImageElement;
}

interface Task2DragTracker {
  current: (() => void) | null;
}

function task2ToNativeCoords(clientX: number, clientY: number, rect: DOMRect): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * TASK2_WIDTH,
    y: ((clientY - rect.top) / rect.height) * TASK2_HEIGHT,
  };
}

function task2IsInsideRect(clientX: number, clientY: number, rect: DOMRect): boolean {
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function clampRange(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function watchTask2Detachment(node: HTMLElement, onDetached: () => void): void {
  const observer = new MutationObserver(() => {
    if (!node.isConnected) {
      observer.disconnect();
      onDetached();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function buildTask2Interface(
  background: HTMLImageElement,
  sprites: Record<Task2SourceType, HTMLImageElement>,
  dragTracker: Task2DragTracker,
): { frame: HTMLElement; controls: HTMLElement } {
  const frame = document.createElement("div");
  frame.className = "task2-frame";

  const backgroundImg = document.createElement("img");
  backgroundImg.src = background.src;
  backgroundImg.alt = "";
  backgroundImg.setAttribute("aria-hidden", "true");
  backgroundImg.className = "task2-background";
  frame.appendChild(backgroundImg);

  const scene = document.createElement("div");
  scene.className = "task2-scene";
  scene.setAttribute("role", "group");
  scene.setAttribute("aria-label", "Sky placement area. Drag stars, moons and suns into this area.");
  frame.appendChild(scene);

  function applyPosition(obj: Task2PlacedObject): void {
    const leftPercent = ((obj.x - obj.width / 2) / TASK2_WIDTH) * 100;
    const topPercent = ((obj.y - obj.height / 2) / TASK2_HEIGHT) * 100;
    obj.el.style.left = `${leftPercent}%`;
    obj.el.style.top = `${topPercent}%`;
  }

  function wireDraggableObject(obj: Task2PlacedObject): void {
    obj.el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      obj.el.setPointerCapture(event.pointerId);
      const startX = obj.x;
      const startY = obj.y;
      const pointerId = event.pointerId;

      function onMove(moveEvent: PointerEvent): void {
        const rect = scene.getBoundingClientRect();
        const { x, y } = task2ToNativeCoords(moveEvent.clientX, moveEvent.clientY, rect);
        obj.x = x;
        obj.y = y;
        applyPosition(obj);
      }

      function finish(clientX: number, clientY: number, cancelled: boolean): void {
        obj.el.removeEventListener("pointermove", onMove);
        obj.el.removeEventListener("pointerup", onUp);
        obj.el.removeEventListener("pointercancel", onCancel);
        if (obj.el.hasPointerCapture(pointerId)) {
          obj.el.releasePointerCapture(pointerId);
        }
        dragTracker.current = null;
        const rect = scene.getBoundingClientRect();
        if (!cancelled && task2IsInsideRect(clientX, clientY, rect)) {
          obj.x = clampRange(obj.x, obj.width / 2, TASK2_WIDTH - obj.width / 2);
          obj.y = clampRange(obj.y, obj.height / 2, TASK2_HEIGHT - obj.height / 2);
        } else {
          obj.x = startX;
          obj.y = startY;
        }
        applyPosition(obj);
      }

      function onUp(upEvent: PointerEvent): void {
        finish(upEvent.clientX, upEvent.clientY, false);
      }

      function onCancel(): void {
        finish(0, 0, true);
      }

      dragTracker.current = onCancel;
      obj.el.addEventListener("pointermove", onMove);
      obj.el.addEventListener("pointerup", onUp);
      obj.el.addEventListener("pointercancel", onCancel);
    });
  }

  function createPlacedObject(type: Task2SourceType, x: number, y: number): void {
    const sprite = sprites[type];
    const width = sprite.naturalWidth;
    const height = sprite.naturalHeight;

    const el = document.createElement("img");
    el.src = sprite.src;
    el.alt = "";
    el.setAttribute("aria-hidden", "true");
    el.className = "task2-placed";
    el.style.width = `${(width / TASK2_WIDTH) * 100}%`;

    const obj: Task2PlacedObject = {
      type,
      x: clampRange(x, width / 2, TASK2_WIDTH - width / 2),
      y: clampRange(y, height / 2, TASK2_HEIGHT - height / 2),
      width,
      height,
      el,
    };
    applyPosition(obj);
    scene.appendChild(el);
    wireDraggableObject(obj);
  }

  const controls = document.createElement("div");
  controls.className = "task2-controls";

  for (const def of TASK2_SOURCE_DEFS) {
    const sprite = sprites[def.type];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "task2-source";
    button.setAttribute("aria-label", `Place ${def.type}`);

    const image = document.createElement("img");
    image.src = sprite.src;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.className = "task2-source-image";
    button.appendChild(image);

    const label = document.createElement("span");
    label.className = "task2-source-label";
    label.textContent = def.label;
    button.appendChild(label);

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      button.classList.add("task2-source-active");
      const pointerId = event.pointerId;

      const ghost = document.createElement("img");
      ghost.src = sprite.src;
      ghost.alt = "";
      ghost.className = "task2-drag-ghost";
      const startRect = scene.getBoundingClientRect();
      ghost.style.width = `${(sprite.naturalWidth / TASK2_WIDTH) * startRect.width}px`;
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
      document.body.appendChild(ghost);

      function onMove(moveEvent: PointerEvent): void {
        ghost.style.left = `${moveEvent.clientX}px`;
        ghost.style.top = `${moveEvent.clientY}px`;
      }

      function cleanup(): void {
        if (button.hasPointerCapture(pointerId)) {
          button.releasePointerCapture(pointerId);
        }
        button.removeEventListener("pointermove", onMove);
        button.removeEventListener("pointerup", onUp);
        button.removeEventListener("pointercancel", onCancel);
        button.classList.remove("task2-source-active");
        dragTracker.current = null;
        ghost.remove();
      }

      function onUp(upEvent: PointerEvent): void {
        const rect = scene.getBoundingClientRect();
        if (task2IsInsideRect(upEvent.clientX, upEvent.clientY, rect)) {
          const { x, y } = task2ToNativeCoords(upEvent.clientX, upEvent.clientY, rect);
          createPlacedObject(def.type, x, y);
        }
        cleanup();
      }

      function onCancel(): void {
        cleanup();
      }

      dragTracker.current = onCancel;
      button.addEventListener("pointermove", onMove);
      button.addEventListener("pointerup", onUp);
      button.addEventListener("pointercancel", onCancel);
    });

    controls.appendChild(button);
  }

  return { frame, controls };
}

function renderTask2(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runTask2Sequence(h1, terminal, container, nav);
}

async function runTask2Sequence(
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

  await typeText(h1, TASK2_HEADING);
  await sleep(300);
  await typeLine(terminal, TASK2_INSTRUCTION);
  await sleep(400);

  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("click", onClick);

  if (!terminal.isConnected) {
    return;
  }

  const [background, star, moon, sun] = await Promise.all([
    loadImage(task2BackgroundUrl),
    loadImage(task2StarUrl),
    loadImage(task2MoonUrl),
    loadImage(task2SunUrl),
  ]);

  if (!terminal.isConnected) {
    return;
  }

  if (background === null || star === null || moon === null || sun === null) {
    await typeLine(terminal, "Scene assets unavailable.");
    if (!terminal.isConnected) {
      return;
    }
    actionButton(container, "CONFIRM", nav.next, SYSTEM_ACTION_PRIMARY);
    return;
  }

  const dragTracker: Task2DragTracker = { current: null };
  const { frame, controls } = buildTask2Interface(background, { star, moon, sun }, dragTracker);

  const workspace = document.createElement("div");
  workspace.className = "task2-workspace";
  container.appendChild(workspace);

  watchTask2Detachment(workspace, () => {
    dragTracker.current?.();
    dragTracker.current = null;
  });

  frame.classList.add("task1-reveal-in");
  workspace.appendChild(frame);
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  controls.classList.add("task1-reveal-in");
  workspace.appendChild(controls);
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

const TASK3_HEADING = "WEATHER CONFIGURATION";
const TASK3_INSTRUCTION = "Configure cloud type and position.";

const TASK3_WIDTH = 640;
const TASK3_HEIGHT = 360;

type Task3SourceType = "storm-cloud" | "white-cloud";

const TASK3_SOURCE_DEFS: { type: Task3SourceType; label: string }[] = [
  { type: "storm-cloud", label: "STORM CLOUD" },
  { type: "white-cloud", label: "WHITE CLOUD" },
];

interface Task3PlacedObject {
  type: Task3SourceType;
  x: number;
  y: number;
  width: number;
  height: number;
  el: HTMLImageElement;
}

interface Task3DragTracker {
  current: (() => void) | null;
}

function task3ToNativeCoords(clientX: number, clientY: number, rect: DOMRect): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * TASK3_WIDTH,
    y: ((clientY - rect.top) / rect.height) * TASK3_HEIGHT,
  };
}

function task3IsInsideRect(clientX: number, clientY: number, rect: DOMRect): boolean {
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function watchTask3Detachment(node: HTMLElement, onDetached: () => void): void {
  const observer = new MutationObserver(() => {
    if (!node.isConnected) {
      observer.disconnect();
      onDetached();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function buildTask3Interface(
  background: HTMLImageElement,
  sprites: Record<Task3SourceType, HTMLImageElement>,
  dragTracker: Task3DragTracker,
): { frame: HTMLElement; controls: HTMLElement } {
  const frame = document.createElement("div");
  frame.className = "task3-frame";

  const backgroundImg = document.createElement("img");
  backgroundImg.src = background.src;
  backgroundImg.alt = "";
  backgroundImg.setAttribute("aria-hidden", "true");
  backgroundImg.className = "task3-background";
  frame.appendChild(backgroundImg);

  const scene = document.createElement("div");
  scene.className = "task3-scene";
  scene.setAttribute("role", "group");
  scene.setAttribute("aria-label", "Weather placement area. Drag storm clouds and white clouds into this area.");
  frame.appendChild(scene);

  function applyPosition(obj: Task3PlacedObject): void {
    const leftPercent = ((obj.x - obj.width / 2) / TASK3_WIDTH) * 100;
    const topPercent = ((obj.y - obj.height / 2) / TASK3_HEIGHT) * 100;
    obj.el.style.left = `${leftPercent}%`;
    obj.el.style.top = `${topPercent}%`;
  }

  function wireDraggableObject(obj: Task3PlacedObject): void {
    obj.el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      obj.el.setPointerCapture(event.pointerId);
      const startX = obj.x;
      const startY = obj.y;
      const pointerId = event.pointerId;

      function onMove(moveEvent: PointerEvent): void {
        const rect = scene.getBoundingClientRect();
        const { x, y } = task3ToNativeCoords(moveEvent.clientX, moveEvent.clientY, rect);
        obj.x = x;
        obj.y = y;
        applyPosition(obj);
      }

      function finish(clientX: number, clientY: number, cancelled: boolean): void {
        obj.el.removeEventListener("pointermove", onMove);
        obj.el.removeEventListener("pointerup", onUp);
        obj.el.removeEventListener("pointercancel", onCancel);
        if (obj.el.hasPointerCapture(pointerId)) {
          obj.el.releasePointerCapture(pointerId);
        }
        dragTracker.current = null;
        const rect = scene.getBoundingClientRect();
        if (!cancelled && task3IsInsideRect(clientX, clientY, rect)) {
          obj.x = clampRange(obj.x, obj.width / 2, TASK3_WIDTH - obj.width / 2);
          obj.y = clampRange(obj.y, obj.height / 2, TASK3_HEIGHT - obj.height / 2);
        } else {
          obj.x = startX;
          obj.y = startY;
        }
        applyPosition(obj);
      }

      function onUp(upEvent: PointerEvent): void {
        finish(upEvent.clientX, upEvent.clientY, false);
      }

      function onCancel(): void {
        finish(0, 0, true);
      }

      dragTracker.current = onCancel;
      obj.el.addEventListener("pointermove", onMove);
      obj.el.addEventListener("pointerup", onUp);
      obj.el.addEventListener("pointercancel", onCancel);
    });
  }

  function createPlacedObject(type: Task3SourceType, x: number, y: number): void {
    const sprite = sprites[type];
    const width = sprite.naturalWidth;
    const height = sprite.naturalHeight;

    const el = document.createElement("img");
    el.src = sprite.src;
    el.alt = "";
    el.setAttribute("aria-hidden", "true");
    el.className = "task3-placed";
    el.style.width = `${(width / TASK3_WIDTH) * 100}%`;

    const obj: Task3PlacedObject = {
      type,
      x: clampRange(x, width / 2, TASK3_WIDTH - width / 2),
      y: clampRange(y, height / 2, TASK3_HEIGHT - height / 2),
      width,
      height,
      el,
    };
    applyPosition(obj);
    scene.appendChild(el);
    wireDraggableObject(obj);
  }

  const controls = document.createElement("div");
  controls.className = "task3-controls";

  for (const def of TASK3_SOURCE_DEFS) {
    const sprite = sprites[def.type];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "task3-source";
    button.setAttribute("aria-label", `Place ${def.type}`);

    const image = document.createElement("img");
    image.src = sprite.src;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.className = "task3-source-image";
    button.appendChild(image);

    const label = document.createElement("span");
    label.className = "task3-source-label";
    label.textContent = def.label;
    button.appendChild(label);

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      button.classList.add("task3-source-active");
      const pointerId = event.pointerId;

      const ghost = document.createElement("img");
      ghost.src = sprite.src;
      ghost.alt = "";
      ghost.className = "task3-drag-ghost";
      const startRect = scene.getBoundingClientRect();
      ghost.style.width = `${(sprite.naturalWidth / TASK3_WIDTH) * startRect.width}px`;
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
      document.body.appendChild(ghost);

      function onMove(moveEvent: PointerEvent): void {
        ghost.style.left = `${moveEvent.clientX}px`;
        ghost.style.top = `${moveEvent.clientY}px`;
      }

      function cleanup(): void {
        if (button.hasPointerCapture(pointerId)) {
          button.releasePointerCapture(pointerId);
        }
        button.removeEventListener("pointermove", onMove);
        button.removeEventListener("pointerup", onUp);
        button.removeEventListener("pointercancel", onCancel);
        button.classList.remove("task3-source-active");
        dragTracker.current = null;
        ghost.remove();
      }

      function onUp(upEvent: PointerEvent): void {
        const rect = scene.getBoundingClientRect();
        if (task3IsInsideRect(upEvent.clientX, upEvent.clientY, rect)) {
          const { x, y } = task3ToNativeCoords(upEvent.clientX, upEvent.clientY, rect);
          createPlacedObject(def.type, x, y);
        }
        cleanup();
      }

      function onCancel(): void {
        cleanup();
      }

      dragTracker.current = onCancel;
      button.addEventListener("pointermove", onMove);
      button.addEventListener("pointerup", onUp);
      button.addEventListener("pointercancel", onCancel);
    });

    controls.appendChild(button);
  }

  return { frame, controls };
}

function renderTask3(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runTask3Sequence(h1, terminal, container, nav);
}

async function runTask3Sequence(
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

  await typeText(h1, TASK3_HEADING);
  await sleep(300);
  await typeLine(terminal, TASK3_INSTRUCTION);
  await sleep(400);

  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("click", onClick);

  if (!terminal.isConnected) {
    return;
  }

  const [background, stormCloud, whiteCloud] = await Promise.all([
    loadImage(task3BackgroundUrl),
    loadImage(task3StormCloudUrl),
    loadImage(task3WhiteCloudUrl),
  ]);

  if (!terminal.isConnected) {
    return;
  }

  if (background === null || stormCloud === null || whiteCloud === null) {
    await typeLine(terminal, "Scene assets unavailable.");
    if (!terminal.isConnected) {
      return;
    }
    actionButton(container, "CONFIRM", nav.next, SYSTEM_ACTION_PRIMARY);
    return;
  }

  const dragTracker: Task3DragTracker = { current: null };
  const { frame, controls } = buildTask3Interface(
    background,
    { "storm-cloud": stormCloud, "white-cloud": whiteCloud },
    dragTracker,
  );

  const workspace = document.createElement("div");
  workspace.className = "task3-workspace";
  container.appendChild(workspace);

  watchTask3Detachment(workspace, () => {
    dragTracker.current?.();
    dragTracker.current = null;
  });

  frame.classList.add("task1-reveal-in");
  workspace.appendChild(frame);
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  controls.classList.add("task1-reveal-in");
  workspace.appendChild(controls);
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

const TASK4_HEADING = "DAY LENGTH CONFIGURATION";
const TASK4_INSTRUCTION = "Set the duration of one day.";

const TASK4_BASE_MINUTES = 0;

interface Task4DragTracker {
  current: (() => void) | null;
}

function task4NormalizeDelta(delta: number): number {
  let d = delta % 360;
  if (d > 180) {
    d -= 360;
  }
  if (d < -180) {
    d += 360;
  }
  return d;
}

function task4AngleFromCenter(clientX: number, clientY: number, rect: DOMRect): number {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

function task4FormatDuration(totalMinutes: number): string {
  const roundedMinutes = Math.round(totalMinutes);
  const sign = roundedMinutes < 0 ? "-" : "+";
  const absMinutes = Math.abs(roundedMinutes);
  const hoursPart = Math.floor(absMinutes / 60);
  const minutesPart = absMinutes % 60;
  return `${sign}${String(hoursPart).padStart(5, "0")}:${String(minutesPart).padStart(2, "0")}`;
}

function watchTask4Detachment(node: HTMLElement, onDetached: () => void): void {
  const observer = new MutationObserver(() => {
    if (!node.isConnected) {
      observer.disconnect();
      onDetached();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function buildTask4Interface(dragTracker: Task4DragTracker): { clock: HTMLElement; display: HTMLElement } {
  const clock = document.createElement("div");
  clock.className = "task4-clock";

  const face = document.createElement("div");
  face.className = "task4-face";
  face.setAttribute("role", "group");
  face.setAttribute("aria-label", "Day length clock. Drag the hour and minute hands to adjust the day length.");
  clock.appendChild(face);

  const ring = document.createElement("div");
  ring.className = "task4-ring";
  face.appendChild(ring);

  const MARKER_RADIUS_PERCENT = 38;
  for (let i = 0; i < 12; i += 1) {
    const angle = i * 30;
    const isMajor = i % 3 === 0;
    const marker = document.createElement("div");
    marker.className = isMajor ? "task4-marker task4-marker-major" : "task4-marker";
    const rad = (angle * Math.PI) / 180;
    marker.style.left = `${50 + MARKER_RADIUS_PERCENT * Math.sin(rad)}%`;
    marker.style.top = `${50 - MARKER_RADIUS_PERCENT * Math.cos(rad)}%`;
    marker.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    face.appendChild(marker);
  }

  const hourHand = document.createElement("div");
  hourHand.className = "task4-hand task4-hand-hour";
  face.appendChild(hourHand);

  const minuteHand = document.createElement("div");
  minuteHand.className = "task4-hand task4-hand-minute";
  face.appendChild(minuteHand);

  const hub = document.createElement("div");
  hub.className = "task4-hub";
  face.appendChild(hub);

  const hourHit = document.createElement("button");
  hourHit.type = "button";
  hourHit.className = "task4-hand-hit task4-hand-hit-hour";
  hourHit.setAttribute("aria-label", "Hour hand. Drag to adjust the day length.");
  face.appendChild(hourHit);

  const minuteHit = document.createElement("button");
  minuteHit.type = "button";
  minuteHit.className = "task4-hand-hit task4-hand-hit-minute";
  minuteHit.setAttribute("aria-label", "Minute hand. Drag to adjust the day length.");
  face.appendChild(minuteHit);

  const display = document.createElement("div");
  display.className = "task4-display";

  const displayLabel = document.createElement("div");
  displayLabel.className = "task4-display-label";
  displayLabel.textContent = "DAY LENGTH";
  display.appendChild(displayLabel);

  const displayValue = document.createElement("div");
  displayValue.className = "task4-display-value";
  displayValue.textContent = task4FormatDuration(TASK4_BASE_MINUTES);
  display.appendChild(displayValue);

  let hourTotalDegrees = 0;
  let minuteTotalDegrees = 0;

  function updateDisplay(): void {
    const totalMinutes = TASK4_BASE_MINUTES + (hourTotalDegrees / 30) * 60 + minuteTotalDegrees / 6;
    displayValue.textContent = task4FormatDuration(totalMinutes);
  }

  function wireHand(hit: HTMLElement, handEl: HTMLElement, applyDelta: (delta: number) => void): void {
    hit.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      hit.setPointerCapture(event.pointerId);
      const pointerId = event.pointerId;
      let lastAngle = task4AngleFromCenter(event.clientX, event.clientY, face.getBoundingClientRect());

      function onMove(moveEvent: PointerEvent): void {
        const rect = face.getBoundingClientRect();
        const angle = task4AngleFromCenter(moveEvent.clientX, moveEvent.clientY, rect);
        const delta = task4NormalizeDelta(angle - lastAngle);
        applyDelta(delta);
        lastAngle = angle;
        hit.style.transform = `rotate(${angle}deg)`;
        handEl.style.transform = `rotate(${angle}deg)`;
        updateDisplay();
      }

      function cleanup(): void {
        hit.removeEventListener("pointermove", onMove);
        hit.removeEventListener("pointerup", onUp);
        hit.removeEventListener("pointercancel", onCancel);
        if (hit.hasPointerCapture(pointerId)) {
          hit.releasePointerCapture(pointerId);
        }
        dragTracker.current = null;
      }

      function onUp(): void {
        cleanup();
      }
      function onCancel(): void {
        cleanup();
      }

      dragTracker.current = onCancel;
      hit.addEventListener("pointermove", onMove);
      hit.addEventListener("pointerup", onUp);
      hit.addEventListener("pointercancel", onCancel);
    });
  }

  wireHand(hourHit, hourHand, (delta) => {
    hourTotalDegrees += delta;
  });

  wireHand(minuteHit, minuteHand, (delta) => {
    minuteTotalDegrees += delta;
  });

  return { clock, display };
}

function renderTask4(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runTask4Sequence(h1, terminal, container, nav);
}

async function runTask4Sequence(
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

  await typeText(h1, TASK4_HEADING);
  await sleep(300);
  await typeLine(terminal, TASK4_INSTRUCTION);
  await sleep(400);

  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("click", onClick);

  if (!terminal.isConnected) {
    return;
  }

  const dragTracker: Task4DragTracker = { current: null };
  const { clock, display } = buildTask4Interface(dragTracker);

  const workspace = document.createElement("div");
  workspace.className = "task4-workspace";
  container.appendChild(workspace);

  watchTask4Detachment(workspace, () => {
    dragTracker.current?.();
    dragTracker.current = null;
  });

  clock.classList.add("task1-reveal-in");
  workspace.appendChild(clock);
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  display.classList.add("task1-reveal-in");
  workspace.appendChild(display);
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
  renderTask2,
  renderTask3,
  renderTask4,
  ...Array.from({ length: 16 }, (_, i) => renderTaskPlaceholder(i + 5)),
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
