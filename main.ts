import skyImageUrl from "./assets/task01-sky-canvas-transparent-v4.png";
import task2BackgroundUrl from "./assets/task02-light-placement-background-v1.png";
import task2StarUrl from "./assets/task02-star.png";
import task2MoonUrl from "./assets/task02-moon.png";
import task2SunUrl from "./assets/task02-sun.png";
import task3BackgroundUrl from "./assets/task03-rainfall-background-v1.png";
import task3StormCloudUrl from "./assets/task03-storm-cloud.png";
import task3WhiteCloudUrl from "./assets/task03-white-cloud.png";
import task5BackgroundUrl from "./assets/task05-season-slots-background.png";
import task5SpringUrl from "./assets/task05-spring.png";
import task5SummerUrl from "./assets/task05-summer.png";
import task5AutumnUrl from "./assets/task05-autumn.png";
import task5WinterUrl from "./assets/task05-winter.png";
import sleeveBaseTorsoUrl from "./assets/task02-sleeve-base-torso.png";
import sleeveScissorsUrl from "./assets/task02-sleeve-scissors.png";
import sleeveDetachedUrl from "./assets/task02-sleeve-detached.png";
import sleeveLeft01Url from "./assets/task02-sleeve-left-01.png";
import sleeveLeft02Url from "./assets/task02-sleeve-left-02.png";
import sleeveLeft03Url from "./assets/task02-sleeve-left-03.png";
import sleeveRight01Url from "./assets/task02-sleeve-right-01.png";
import sleeveRight02Url from "./assets/task02-sleeve-right-02.png";
import sleeveRight03Url from "./assets/task02-sleeve-right-03.png";
import habitatBackgroundUrl from "./assets/fish-position-background.png";
import habitatFishUrl from "./assets/fish-position-fish.png";

interface NavActions {
  next: () => void;
  restart: () => void;
  recheck: () => void;
  previous: () => void;
  redo: () => void;
  hasPrevious: boolean;
  alreadyVisited: boolean;
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

async function runTaskIntro(
  h1: HTMLElement,
  terminal: HTMLElement,
  headingText: string,
  instructionText: string,
  alreadyVisited: boolean,
): Promise<void> {
  if (alreadyVisited) {
    h1.textContent = headingText;
    const line = document.createElement("div");
    line.className = "term-line";
    line.textContent = instructionText;
    terminal.appendChild(line);
    return;
  }

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
  await typeLine(terminal, instructionText);
  await sleep(400);

  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("click", onClick);
}

function addTaskNavControls(
  container: HTMLElement,
  nav: NavActions,
): { redoButton: HTMLButtonElement; confirmButton: HTMLButtonElement } {
  const group = document.createElement("div");
  group.className = "task-action-group task1-reveal-in";
  container.appendChild(group);

  if (nav.hasPrevious) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "task-action-secondary";
    back.textContent = "← BACK";
    back.setAttribute("aria-label", "Previous task");
    back.addEventListener("click", nav.previous);
    group.appendChild(back);
  }

  const redoButton = document.createElement("button");
  redoButton.className = "task-action-secondary";
  redoButton.type = "button";
  redoButton.textContent = "REDO";
  redoButton.setAttribute("aria-label", "Redo current task");
  redoButton.addEventListener("click", nav.redo);
  group.appendChild(redoButton);

  const confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.textContent = "CONFIRM";
  confirmButton.addEventListener("click", nav.next);
  group.appendChild(confirmButton);

  return { redoButton, confirmButton };
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
    addTaskNavControls(container, nav);
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

interface Task1SkyState {
  paint: ImageData;
}

function buildTask1Interface(
  img: HTMLImageElement,
  mask: Uint8Array,
  initialPaint: ImageData | null,
  onChange: (paint: ImageData) => void,
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
  if (initialPaint) {
    paintCtx.putImageData(initialPaint, 0, 0);
  }

  function persist(): void {
    onChange(paintCtx.getImageData(0, 0, TASK1_WIDTH, TASK1_HEIGHT));
  }

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
      persist();
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
    persist();
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
  await runTaskIntro(h1, terminal, TASK1_HEADING, TASK1_INSTRUCTION, nav.alreadyVisited);

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
  const { frame, palette, tools } = buildTask1Interface(img, mask, taskSession.task1?.paint ?? null, (paint) => {
    taskSession.task1 = { paint };
  });

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

  addTaskNavControls(container, nav);
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

interface Task2LightState {
  placed: { type: Task2SourceType; x: number; y: number }[];
}

function buildTask2Interface(
  background: HTMLImageElement,
  sprites: Record<Task2SourceType, HTMLImageElement>,
  dragTracker: Task2DragTracker,
  initialPlaced: { type: Task2SourceType; x: number; y: number }[] | null,
  onChange: (placed: { type: Task2SourceType; x: number; y: number }[]) => void,
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

  const objects: Task2PlacedObject[] = [];

  function persist(): void {
    onChange(objects.map((obj) => ({ type: obj.type, x: obj.x, y: obj.y })));
  }

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
        persist();
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
    objects.push(obj);
    persist();
  }

  if (initialPlaced) {
    for (const item of initialPlaced) {
      createPlacedObject(item.type, item.x, item.y);
    }
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
  await runTaskIntro(h1, terminal, TASK2_HEADING, TASK2_INSTRUCTION, nav.alreadyVisited);

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
  const { frame, controls } = buildTask2Interface(
    background,
    { star, moon, sun },
    dragTracker,
    taskSession.task2?.placed ?? null,
    (placed) => {
      taskSession.task2 = { placed };
    },
  );

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

  addTaskNavControls(container, nav);
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

interface Task3WeatherState {
  placed: { type: Task3SourceType; x: number; y: number }[];
}

function buildTask3Interface(
  background: HTMLImageElement,
  sprites: Record<Task3SourceType, HTMLImageElement>,
  dragTracker: Task3DragTracker,
  initialPlaced: { type: Task3SourceType; x: number; y: number }[] | null,
  onChange: (placed: { type: Task3SourceType; x: number; y: number }[]) => void,
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

  const objects: Task3PlacedObject[] = [];

  function persist(): void {
    onChange(objects.map((obj) => ({ type: obj.type, x: obj.x, y: obj.y })));
  }

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
        persist();
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
    objects.push(obj);
    persist();
  }

  if (initialPlaced) {
    for (const item of initialPlaced) {
      createPlacedObject(item.type, item.x, item.y);
    }
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
  await runTaskIntro(h1, terminal, TASK3_HEADING, TASK3_INSTRUCTION, nav.alreadyVisited);

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
    taskSession.task3?.placed ?? null,
    (placed) => {
      taskSession.task3 = { placed };
    },
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

  addTaskNavControls(container, nav);
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

interface Task4HandsState {
  hourTotalDegrees: number;
  minuteTotalDegrees: number;
  hourAngle: number;
  minuteAngle: number;
}

function buildTask4Interface(
  dragTracker: Task4DragTracker,
  initial: Task4HandsState | null,
  onChange: (state: Task4HandsState) => void,
): { clock: HTMLElement; display: HTMLElement } {
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
  display.appendChild(displayValue);

  let hourTotalDegrees = initial?.hourTotalDegrees ?? 0;
  let minuteTotalDegrees = initial?.minuteTotalDegrees ?? 0;
  let hourAngle = initial?.hourAngle ?? 0;
  let minuteAngle = initial?.minuteAngle ?? 0;

  hourHit.style.transform = `rotate(${hourAngle}deg)`;
  hourHand.style.transform = `rotate(${hourAngle}deg)`;
  minuteHit.style.transform = `rotate(${minuteAngle}deg)`;
  minuteHand.style.transform = `rotate(${minuteAngle}deg)`;

  function updateDisplay(): void {
    const totalMinutes = TASK4_BASE_MINUTES + (hourTotalDegrees / 30) * 60 + minuteTotalDegrees / 6;
    displayValue.textContent = task4FormatDuration(totalMinutes);
  }

  updateDisplay();

  function persist(): void {
    onChange({ hourTotalDegrees, minuteTotalDegrees, hourAngle, minuteAngle });
  }

  function wireHand(
    hit: HTMLElement,
    handEl: HTMLElement,
    applyDelta: (delta: number) => void,
    setAngle: (angle: number) => void,
  ): void {
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
        setAngle(angle);
        updateDisplay();
        persist();
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

  wireHand(
    hourHit,
    hourHand,
    (delta) => {
      hourTotalDegrees += delta;
    },
    (angle) => {
      hourAngle = angle;
    },
  );

  wireHand(
    minuteHit,
    minuteHand,
    (delta) => {
      minuteTotalDegrees += delta;
    },
    (angle) => {
      minuteAngle = angle;
    },
  );

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
  await runTaskIntro(h1, terminal, TASK4_HEADING, TASK4_INSTRUCTION, nav.alreadyVisited);

  if (!terminal.isConnected) {
    return;
  }

  const dragTracker: Task4DragTracker = { current: null };
  const { clock, display } = buildTask4Interface(dragTracker, taskSession.task4, (state) => {
    taskSession.task4 = state;
  });

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

  addTaskNavControls(container, nav);
}

const TASK5_HEADING = "SEASON CONFIGURATION";
const TASK5_INSTRUCTION = "Set the seasonal sequence.";

type Task5SeasonType = "spring" | "summer" | "autumn" | "winter";

const TASK5_SOURCE_DEFS: { type: Task5SeasonType; label: string }[] = [
  { type: "spring", label: "SPRING" },
  { type: "summer", label: "SUMMER" },
  { type: "autumn", label: "AUTUMN" },
  { type: "winter", label: "WINTER" },
];

const TASK5_SLOT_COUNT = 4;
const TASK5_SLOT_LEFT_PERCENTS = [2.5, 27.5, 52.5, 77.5];
const TASK5_SLOT_WIDTH_PERCENT = 20;
const TASK5_SLOT_TOP_PERCENT = 25;
const TASK5_SLOT_HEIGHT_PERCENT = 45;

interface Task5DragTracker {
  current: (() => void) | null;
}

function task5IsInsideRect(clientX: number, clientY: number, rect: DOMRect): boolean {
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function watchTask5Detachment(node: HTMLElement, onDetached: () => void): void {
  const observer = new MutationObserver(() => {
    if (!node.isConnected) {
      observer.disconnect();
      onDetached();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

interface Task5SlotsState {
  slots: (Task5SeasonType | null)[];
}

function buildTask5Interface(
  background: HTMLImageElement,
  sprites: Record<Task5SeasonType, HTMLImageElement>,
  dragTracker: Task5DragTracker,
  initialSlots: (Task5SeasonType | null)[] | null,
  onChange: (slots: (Task5SeasonType | null)[]) => void,
): { frame: HTMLElement; controls: HTMLElement } {
  const frame = document.createElement("div");
  frame.className = "task5-frame";

  const backgroundImg = document.createElement("img");
  backgroundImg.src = background.src;
  backgroundImg.alt = "";
  backgroundImg.setAttribute("aria-hidden", "true");
  backgroundImg.className = "task5-background";
  frame.appendChild(backgroundImg);

  const slotsLayer = document.createElement("div");
  slotsLayer.className = "task5-slots";
  slotsLayer.setAttribute("role", "group");
  slotsLayer.setAttribute("aria-label", "Season configuration area. Drag seasons into the four slots.");
  frame.appendChild(slotsLayer);

  const slots: (Task5SeasonType | null)[] = initialSlots
    ? [...initialSlots]
    : Array.from({ length: TASK5_SLOT_COUNT }, () => null);
  const slotElements: HTMLElement[] = [];

  function persist(): void {
    onChange([...slots]);
  }

  for (let i = 0; i < TASK5_SLOT_COUNT; i += 1) {
    const slotEl = document.createElement("div");
    slotEl.className = "task5-slot";
    slotEl.style.left = `${TASK5_SLOT_LEFT_PERCENTS[i]}%`;
    slotEl.style.top = `${TASK5_SLOT_TOP_PERCENT}%`;
    slotEl.style.width = `${TASK5_SLOT_WIDTH_PERCENT}%`;
    slotEl.style.height = `${TASK5_SLOT_HEIGHT_PERCENT}%`;
    slotEl.setAttribute("role", "group");
    slotsLayer.appendChild(slotEl);
    slotElements.push(slotEl);
  }

  function slotLabel(index: number): string {
    const value = slots[index];
    const seasonLabel = TASK5_SOURCE_DEFS.find((def) => def.type === value)?.label;
    return `Slot ${index + 1}: ${seasonLabel ?? "empty"}.`;
  }

  function renderSlot(index: number): void {
    const slotEl = slotElements[index];
    slotEl.replaceChildren();
    slotEl.setAttribute("aria-label", slotLabel(index));

    const value = slots[index];
    if (value === null) {
      return;
    }

    const def = TASK5_SOURCE_DEFS.find((d) => d.type === value)!;
    const sprite = sprites[value];

    const placed = document.createElement("button");
    placed.type = "button";
    placed.className = "task5-placed";
    placed.setAttribute("aria-label", `${def.label} placed in slot ${index + 1}. Drag to move to another slot.`);

    const image = document.createElement("img");
    image.src = sprite.src;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.className = "task5-placed-image";
    placed.appendChild(image);

    wirePlacedDrag(placed, index);
    slotEl.appendChild(placed);
  }

  function assignSlot(index: number, value: Task5SeasonType): void {
    slots[index] = value;
    renderSlot(index);
  }

  function findSlotAt(clientX: number, clientY: number): number {
    for (let i = 0; i < slotElements.length; i += 1) {
      if (task5IsInsideRect(clientX, clientY, slotElements[i].getBoundingClientRect())) {
        return i;
      }
    }
    return -1;
  }

  function startDrag(
    seasonType: Task5SeasonType,
    sprite: HTMLImageElement,
    originButton: HTMLElement,
    pointerId: number,
    startClientX: number,
    startClientY: number,
    originIndex: number | null,
  ): void {
    originButton.setPointerCapture(pointerId);
    originButton.classList.add("task5-drag-origin");

    const ghost = document.createElement("img");
    ghost.src = sprite.src;
    ghost.alt = "";
    ghost.className = "task5-drag-ghost";
    const frameRect = frame.getBoundingClientRect();
    ghost.style.width = `${(TASK5_SLOT_WIDTH_PERCENT / 100) * frameRect.width * 0.7}px`;
    ghost.style.left = `${startClientX}px`;
    ghost.style.top = `${startClientY}px`;
    document.body.appendChild(ghost);

    function onMove(moveEvent: PointerEvent): void {
      ghost.style.left = `${moveEvent.clientX}px`;
      ghost.style.top = `${moveEvent.clientY}px`;
    }

    function cleanup(): void {
      if (originButton.hasPointerCapture(pointerId)) {
        originButton.releasePointerCapture(pointerId);
      }
      originButton.removeEventListener("pointermove", onMove);
      originButton.removeEventListener("pointerup", onUp);
      originButton.removeEventListener("pointercancel", onCancel);
      originButton.classList.remove("task5-drag-origin");
      dragTracker.current = null;
      ghost.remove();
    }

    function onUp(upEvent: PointerEvent): void {
      const targetIndex = findSlotAt(upEvent.clientX, upEvent.clientY);
      cleanup();
      if (targetIndex === -1) {
        return;
      }
      assignSlot(targetIndex, seasonType);
      if (originIndex !== null && originIndex !== targetIndex) {
        slots[originIndex] = null;
        renderSlot(originIndex);
      }
      persist();
    }

    function onCancel(): void {
      cleanup();
    }

    dragTracker.current = onCancel;
    originButton.addEventListener("pointermove", onMove);
    originButton.addEventListener("pointerup", onUp);
    originButton.addEventListener("pointercancel", onCancel);
  }

  function wirePlacedDrag(placed: HTMLElement, index: number): void {
    placed.addEventListener("pointerdown", (event) => {
      const value = slots[index];
      if (value === null) {
        return;
      }
      event.preventDefault();
      startDrag(value, sprites[value], placed, event.pointerId, event.clientX, event.clientY, index);
    });
  }

  for (let i = 0; i < TASK5_SLOT_COUNT; i += 1) {
    renderSlot(i);
  }

  const controls = document.createElement("div");
  controls.className = "task5-controls";

  for (const def of TASK5_SOURCE_DEFS) {
    const sprite = sprites[def.type];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "task5-source";
    button.setAttribute("aria-label", `${def.label} source. Drag into a slot to place it.`);

    const image = document.createElement("img");
    image.src = sprite.src;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.className = "task5-source-image";
    button.appendChild(image);

    const label = document.createElement("span");
    label.className = "task5-source-label";
    label.textContent = def.label;
    button.appendChild(label);

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      startDrag(def.type, sprite, button, event.pointerId, event.clientX, event.clientY, null);
    });

    controls.appendChild(button);
  }

  return { frame, controls };
}

function renderTask5(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runTask5Sequence(h1, terminal, container, nav);
}

async function runTask5Sequence(
  h1: HTMLElement,
  terminal: HTMLElement,
  container: HTMLElement,
  nav: NavActions,
): Promise<void> {
  await sleep(0);
  await runTaskIntro(h1, terminal, TASK5_HEADING, TASK5_INSTRUCTION, nav.alreadyVisited);

  if (!terminal.isConnected) {
    return;
  }

  const [background, spring, summer, autumn, winter] = await Promise.all([
    loadImage(task5BackgroundUrl),
    loadImage(task5SpringUrl),
    loadImage(task5SummerUrl),
    loadImage(task5AutumnUrl),
    loadImage(task5WinterUrl),
  ]);

  if (!terminal.isConnected) {
    return;
  }

  if (background === null || spring === null || summer === null || autumn === null || winter === null) {
    await typeLine(terminal, "Scene assets unavailable.");
    if (!terminal.isConnected) {
      return;
    }
    actionButton(container, "CONFIRM", nav.next, SYSTEM_ACTION_PRIMARY);
    return;
  }

  const dragTracker: Task5DragTracker = { current: null };
  const { frame, controls } = buildTask5Interface(
    background,
    { spring, summer, autumn, winter },
    dragTracker,
    taskSession.task5?.slots ?? null,
    (slots) => {
      taskSession.task5 = { slots };
    },
  );

  const workspace = document.createElement("div");
  workspace.className = "task5-workspace";
  container.appendChild(workspace);

  watchTask5Detachment(workspace, () => {
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

  addTaskNavControls(container, nav);
}

const HABITAT_HEADING = "HABITAT CONFIGURATION";
const HABITAT_INSTRUCTION = "Set the fish position.";

const HABITAT_WIDTH = 640;
const HABITAT_HEIGHT = 360;

const HABITAT_FISH_WIDTH_PERCENT = 9;

const HABITAT_FISH_INITIAL_POSITIONS = [
  { xPercent: 32, yPercent: 17 },
  { xPercent: 50, yPercent: 24 },
  { xPercent: 68, yPercent: 14 },
];

interface HabitatDragTracker {
  current: (() => void) | null;
}

interface HabitatState {
  fish: { x: number; y: number }[];
}

function habitatToNativeCoords(clientX: number, clientY: number, rect: DOMRect): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * HABITAT_WIDTH,
    y: ((clientY - rect.top) / rect.height) * HABITAT_HEIGHT,
  };
}

function watchHabitatDetachment(node: HTMLElement, onDetached: () => void): void {
  const observer = new MutationObserver(() => {
    if (!node.isConnected) {
      observer.disconnect();
      onDetached();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function createHabitatFish(
  scene: HTMLElement,
  fish: HTMLImageElement,
  label: string,
  initialX: number,
  initialY: number,
  halfWidth: number,
  halfHeight: number,
  dragTracker: HabitatDragTracker,
  onSettled: (x: number, y: number) => void,
): HTMLElement {
  let fishX = initialX;
  let fishY = initialY;

  const fishButton = document.createElement("button");
  fishButton.type = "button";
  fishButton.className = "habitat-fish";
  fishButton.setAttribute("aria-label", label);
  fishButton.style.width = `${HABITAT_FISH_WIDTH_PERCENT}%`;
  fishButton.style.aspectRatio = `${fish.naturalWidth} / ${fish.naturalHeight}`;

  const fishImg = document.createElement("img");
  fishImg.src = fish.src;
  fishImg.alt = "";
  fishImg.setAttribute("aria-hidden", "true");
  fishImg.className = "habitat-fish-image";
  fishButton.appendChild(fishImg);

  function applyFishPosition(): void {
    fishButton.style.left = `${(fishX / HABITAT_WIDTH) * 100}%`;
    fishButton.style.top = `${(fishY / HABITAT_HEIGHT) * 100}%`;
  }
  applyFishPosition();

  fishButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    fishButton.setPointerCapture(event.pointerId);
    const pointerId = event.pointerId;
    const startX = fishX;
    const startY = fishY;
    fishButton.classList.add("habitat-fish-active");

    function onMove(moveEvent: PointerEvent): void {
      const rect = scene.getBoundingClientRect();
      const { x, y } = habitatToNativeCoords(moveEvent.clientX, moveEvent.clientY, rect);
      fishX = clampRange(x, halfWidth, HABITAT_WIDTH - halfWidth);
      fishY = clampRange(y, halfHeight, HABITAT_HEIGHT - halfHeight);
      applyFishPosition();
    }

    function finish(): void {
      fishButton.removeEventListener("pointermove", onMove);
      fishButton.removeEventListener("pointerup", onUp);
      fishButton.removeEventListener("pointercancel", onCancel);
      if (fishButton.hasPointerCapture(pointerId)) {
        fishButton.releasePointerCapture(pointerId);
      }
      fishButton.classList.remove("habitat-fish-active");
      dragTracker.current = null;
      onSettled(fishX, fishY);
    }

    function onUp(): void {
      finish();
    }

    function onCancel(): void {
      fishX = startX;
      fishY = startY;
      applyFishPosition();
      finish();
    }

    dragTracker.current = onCancel;
    fishButton.addEventListener("pointermove", onMove);
    fishButton.addEventListener("pointerup", onUp);
    fishButton.addEventListener("pointercancel", onCancel);
  });

  return fishButton;
}

function buildHabitatInterface(
  background: HTMLImageElement,
  fish: HTMLImageElement,
  dragTracker: HabitatDragTracker,
  savedFish: { x: number; y: number }[] | null,
  onFishSettled: (index: number, x: number, y: number) => void,
): { frame: HTMLElement; attachFish: () => void } {
  const frame = document.createElement("div");
  frame.className = "habitat-frame";

  const backgroundImg = document.createElement("img");
  backgroundImg.src = background.src;
  backgroundImg.alt = "";
  backgroundImg.setAttribute("aria-hidden", "true");
  backgroundImg.className = "habitat-background";
  frame.appendChild(backgroundImg);

  const scene = document.createElement("div");
  scene.className = "habitat-scene";
  scene.setAttribute("role", "group");
  scene.setAttribute("aria-label", "Habitat configuration area.");
  frame.appendChild(scene);

  const fishAspect = fish.naturalWidth / fish.naturalHeight;
  const fishWidthNative = (HABITAT_FISH_WIDTH_PERCENT / 100) * HABITAT_WIDTH;
  const fishHeightNative = fishWidthNative / fishAspect;
  const halfWidth = fishWidthNative / 2;
  const halfHeight = fishHeightNative / 2;

  const fishButtons = HABITAT_FISH_INITIAL_POSITIONS.map((pos, index) => {
    const saved = savedFish?.[index];
    const initialX = saved ? saved.x : (pos.xPercent / 100) * HABITAT_WIDTH;
    const initialY = saved ? saved.y : (pos.yPercent / 100) * HABITAT_HEIGHT;
    return createHabitatFish(
      scene,
      fish,
      `Fish ${index + 1}. Drag to reposition.`,
      initialX,
      initialY,
      halfWidth,
      halfHeight,
      dragTracker,
      (x, y) => onFishSettled(index, x, y),
    );
  });

  function attachFish(): void {
    for (const fishButton of fishButtons) {
      scene.appendChild(fishButton);
      fishButton.classList.add("task1-reveal-in");
    }
  }

  return { frame, attachFish };
}

function renderHabitatTask(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runHabitatTaskSequence(h1, terminal, container, nav);
}

async function runHabitatTaskSequence(
  h1: HTMLElement,
  terminal: HTMLElement,
  container: HTMLElement,
  nav: NavActions,
): Promise<void> {
  await sleep(0);
  await runTaskIntro(h1, terminal, HABITAT_HEADING, HABITAT_INSTRUCTION, nav.alreadyVisited);

  if (!terminal.isConnected) {
    return;
  }

  const [background, fish] = await Promise.all([loadImage(habitatBackgroundUrl), loadImage(habitatFishUrl)]);

  if (!terminal.isConnected) {
    return;
  }

  if (background === null || fish === null) {
    await typeLine(terminal, "Scene assets unavailable.");
    if (!terminal.isConnected) {
      return;
    }
    actionButton(container, "CONFIRM", nav.next, SYSTEM_ACTION_PRIMARY);
    return;
  }

  const savedFish = taskSession.habitat?.fish ?? null;
  const fishState: { x: number; y: number }[] = savedFish
    ? savedFish.map((pos) => ({ ...pos }))
    : HABITAT_FISH_INITIAL_POSITIONS.map((pos) => ({
        x: (pos.xPercent / 100) * HABITAT_WIDTH,
        y: (pos.yPercent / 100) * HABITAT_HEIGHT,
      }));

  const dragTracker: HabitatDragTracker = { current: null };
  const { frame, attachFish } = buildHabitatInterface(background, fish, dragTracker, fishState, (index, x, y) => {
    fishState[index] = { x, y };
    taskSession.habitat = { fish: fishState.map((pos) => ({ ...pos })) };
  });

  const workspace = document.createElement("div");
  workspace.className = "habitat-workspace";
  container.appendChild(workspace);

  watchHabitatDetachment(workspace, () => {
    if (dragTracker.current) {
      dragTracker.current();
    }
  });

  frame.classList.add("task1-reveal-in");
  workspace.appendChild(frame);
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  attachFish();
  await sleep(120);
  if (!terminal.isConnected) {
    return;
  }

  addTaskNavControls(container, nav);
}

const SLEEVE_HEADING = "GARMENT CONFIGURATION";
const SLEEVE_INSTRUCTION = "Remove unnecessary sleeves.";

const SLEEVE_TORSO_LEFT_PERCENT = 33.359375;
const SLEEVE_TORSO_WIDTH_PERCENT = 33.28125;
const SLEEVE_TORSO_RIGHT_PERCENT = SLEEVE_TORSO_LEFT_PERCENT + SLEEVE_TORSO_WIDTH_PERCENT;

const SLEEVE_FRAME_WIDTH = 640;
const SLEEVE_FRAME_HEIGHT = 360;
const SLEEVE_NATIVE_WIDTH = 176;
const SLEEVE_NATIVE_HEIGHT = 49;

const SLEEVE_WIDTH_PERCENT = 38;
const SLEEVE_HEIGHT_PERCENT =
  ((SLEEVE_WIDTH_PERCENT / 100) *
    SLEEVE_FRAME_WIDTH *
    (SLEEVE_NATIVE_HEIGHT / SLEEVE_NATIVE_WIDTH) *
    100) /
  SLEEVE_FRAME_HEIGHT;

const SLEEVE_ROOT_OVERLAP_PERCENT = 5;
const SLEEVE_LEFT_SIDE_LEFT_PERCENT = SLEEVE_TORSO_LEFT_PERCENT + SLEEVE_ROOT_OVERLAP_PERCENT - SLEEVE_WIDTH_PERCENT;
const SLEEVE_RIGHT_SIDE_LEFT_PERCENT = SLEEVE_TORSO_RIGHT_PERCENT - SLEEVE_ROOT_OVERLAP_PERCENT;
const SLEEVE_TOP_PERCENTS = [15, 39, 62];

const SLEEVE_HIT_PAD_X_PERCENT = 3;
const SLEEVE_HIT_PAD_Y_PERCENT = 1.5;
const SLEEVE_FALL_DURATION_MS = 600;

type SleeveSide = "left" | "right";
type SleevePosition = "upper" | "middle" | "lower";
type SleeveId = "left-01" | "left-02" | "left-03" | "right-01" | "right-02" | "right-03";

interface SleeveDef {
  id: SleeveId;
  side: SleeveSide;
  position: SleevePosition;
  url: string;
  leftPercent: number;
  topPercent: number;
}

const SLEEVE_DEFS: SleeveDef[] = [
  {
    id: "left-01",
    side: "left",
    position: "upper",
    url: sleeveLeft01Url,
    leftPercent: SLEEVE_LEFT_SIDE_LEFT_PERCENT,
    topPercent: SLEEVE_TOP_PERCENTS[0],
  },
  {
    id: "left-02",
    side: "left",
    position: "middle",
    url: sleeveLeft02Url,
    leftPercent: SLEEVE_LEFT_SIDE_LEFT_PERCENT,
    topPercent: SLEEVE_TOP_PERCENTS[1],
  },
  {
    id: "left-03",
    side: "left",
    position: "lower",
    url: sleeveLeft03Url,
    leftPercent: SLEEVE_LEFT_SIDE_LEFT_PERCENT,
    topPercent: SLEEVE_TOP_PERCENTS[2],
  },
  {
    id: "right-01",
    side: "right",
    position: "upper",
    url: sleeveRight01Url,
    leftPercent: SLEEVE_RIGHT_SIDE_LEFT_PERCENT,
    topPercent: SLEEVE_TOP_PERCENTS[0],
  },
  {
    id: "right-02",
    side: "right",
    position: "middle",
    url: sleeveRight02Url,
    leftPercent: SLEEVE_RIGHT_SIDE_LEFT_PERCENT,
    topPercent: SLEEVE_TOP_PERCENTS[1],
  },
  {
    id: "right-03",
    side: "right",
    position: "lower",
    url: sleeveRight03Url,
    leftPercent: SLEEVE_RIGHT_SIDE_LEFT_PERCENT,
    topPercent: SLEEVE_TOP_PERCENTS[2],
  },
];

function sleeveHitLabel(def: SleeveDef): string {
  const side = def.side === "left" ? "Left" : "Right";
  return `${side} ${def.position} sleeve. Click to remove when scissors are selected.`;
}

interface SleeveState {
  attached: Record<SleeveId, boolean>;
}

function buildSleeveInterface(
  torso: HTMLImageElement,
  scissors: HTMLImageElement,
  detached: HTMLImageElement,
  sleeveSprites: Record<SleeveId, HTMLImageElement>,
  savedAttached: Record<SleeveId, boolean> | null,
  onChange: (attached: Record<SleeveId, boolean>) => void,
): { frame: HTMLElement; controls: HTMLElement } {
  const frame = document.createElement("div");
  frame.className = "sleeve-frame";
  frame.setAttribute("role", "group");
  frame.setAttribute("aria-label", "Garment. Select the scissors, then click a sleeve to remove it.");

  const torsoImg = document.createElement("img");
  torsoImg.src = torso.src;
  torsoImg.alt = "";
  torsoImg.setAttribute("aria-hidden", "true");
  torsoImg.className = "sleeve-torso";
  torsoImg.style.left = `${SLEEVE_TORSO_LEFT_PERCENT}%`;
  torsoImg.style.width = `${SLEEVE_TORSO_WIDTH_PERCENT}%`;
  frame.appendChild(torsoImg);

  const attached: Record<SleeveId, boolean> = savedAttached
    ? { ...savedAttached }
    : {
        "left-01": true,
        "left-02": true,
        "left-03": true,
        "right-01": true,
        "right-02": true,
        "right-03": true,
      };

  const sleeveHits = new Map<SleeveId, HTMLElement>();
  let scissorsSelected = false;

  const hitWidthPercent = SLEEVE_WIDTH_PERCENT + SLEEVE_HIT_PAD_X_PERCENT * 2;
  const hitHeightPercent = SLEEVE_HEIGHT_PERCENT + SLEEVE_HIT_PAD_Y_PERCENT * 2;
  const sleeveImageLeftPercent = (SLEEVE_HIT_PAD_X_PERCENT / hitWidthPercent) * 100;
  const sleeveImageTopPercent = (SLEEVE_HIT_PAD_Y_PERCENT / hitHeightPercent) * 100;
  const sleeveImageWidthPercent = (SLEEVE_WIDTH_PERCENT / hitWidthPercent) * 100;
  const sleeveImageHeightPercent = (SLEEVE_HEIGHT_PERCENT / hitHeightPercent) * 100;

  function spawnFall(def: SleeveDef): void {
    const fallEl = document.createElement("img");
    fallEl.src = detached.src;
    fallEl.alt = "";
    fallEl.setAttribute("aria-hidden", "true");
    fallEl.className = `sleeve-detached sleeve-fall-${def.side}`;
    fallEl.style.left = `${def.leftPercent}%`;
    fallEl.style.top = `${def.topPercent}%`;
    fallEl.style.width = `${SLEEVE_WIDTH_PERCENT}%`;
    fallEl.style.height = `${SLEEVE_HEIGHT_PERCENT}%`;
    frame.appendChild(fallEl);

    let removed = false;
    function removeFallEl(): void {
      if (removed) {
        return;
      }
      removed = true;
      fallEl.remove();
    }
    fallEl.addEventListener("animationend", removeFallEl, { once: true });
    setTimeout(removeFallEl, SLEEVE_FALL_DURATION_MS + 200);
  }

  function cutSleeve(id: SleeveId): void {
    if (!attached[id]) {
      return;
    }
    attached[id] = false;
    const hit = sleeveHits.get(id);
    if (hit) {
      hit.remove();
      sleeveHits.delete(id);
    }
    const def = SLEEVE_DEFS.find((d) => d.id === id);
    if (def) {
      spawnFall(def);
    }
    onChange({ ...attached });
  }

  for (const def of SLEEVE_DEFS) {
    if (!attached[def.id]) {
      continue;
    }
    const sprite = sleeveSprites[def.id];

    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "sleeve-hit";
    hit.setAttribute("aria-label", sleeveHitLabel(def));
    hit.style.left = `${def.leftPercent - SLEEVE_HIT_PAD_X_PERCENT}%`;
    hit.style.top = `${def.topPercent - SLEEVE_HIT_PAD_Y_PERCENT}%`;
    hit.style.width = `${hitWidthPercent}%`;
    hit.style.height = `${hitHeightPercent}%`;

    const img = document.createElement("img");
    img.src = sprite.src;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.className = "sleeve-item";
    img.style.left = `${sleeveImageLeftPercent}%`;
    img.style.top = `${sleeveImageTopPercent}%`;
    img.style.width = `${sleeveImageWidthPercent}%`;
    img.style.height = `${sleeveImageHeightPercent}%`;
    hit.appendChild(img);

    hit.addEventListener("click", () => {
      if (!scissorsSelected) {
        return;
      }
      cutSleeve(def.id);
    });

    frame.appendChild(hit);
    sleeveHits.set(def.id, hit);
  }

  const controls = document.createElement("div");
  controls.className = "sleeve-controls";

  const tool = document.createElement("button");
  tool.type = "button";
  tool.className = "sleeve-tool";
  tool.setAttribute("aria-pressed", "false");
  tool.setAttribute("aria-label", "Scissors. Select the cutting tool.");

  const toolImage = document.createElement("img");
  toolImage.src = scissors.src;
  toolImage.alt = "";
  toolImage.setAttribute("aria-hidden", "true");
  toolImage.className = "sleeve-tool-image";
  tool.appendChild(toolImage);

  const toolLabel = document.createElement("span");
  toolLabel.className = "sleeve-tool-label";
  toolLabel.textContent = "SCISSORS";
  tool.appendChild(toolLabel);

  tool.addEventListener("click", () => {
    scissorsSelected = !scissorsSelected;
    tool.setAttribute("aria-pressed", String(scissorsSelected));
    tool.classList.toggle("sleeve-tool-active", scissorsSelected);
    frame.classList.toggle("sleeve-scissors-active", scissorsSelected);
    frame.style.cursor = scissorsSelected ? `url("${scissors.src}") 92 16, pointer` : "";
  });

  controls.appendChild(tool);

  return { frame, controls };
}

function renderSleeveTask(container: HTMLElement, nav: NavActions): void {
  container.classList.add("term-wide");

  const h1 = document.createElement("h1");
  h1.tabIndex = -1;
  container.appendChild(h1);

  const terminal = document.createElement("div");
  terminal.className = "align-terminal";
  terminal.setAttribute("aria-live", "polite");
  container.appendChild(terminal);

  void runSleeveTaskSequence(h1, terminal, container, nav);
}

async function runSleeveTaskSequence(
  h1: HTMLElement,
  terminal: HTMLElement,
  container: HTMLElement,
  nav: NavActions,
): Promise<void> {
  await sleep(0);
  await runTaskIntro(h1, terminal, SLEEVE_HEADING, SLEEVE_INSTRUCTION, nav.alreadyVisited);

  if (!terminal.isConnected) {
    return;
  }

  const [torso, scissors, detached, left01, left02, left03, right01, right02, right03] = await Promise.all([
    loadImage(sleeveBaseTorsoUrl),
    loadImage(sleeveScissorsUrl),
    loadImage(sleeveDetachedUrl),
    loadImage(sleeveLeft01Url),
    loadImage(sleeveLeft02Url),
    loadImage(sleeveLeft03Url),
    loadImage(sleeveRight01Url),
    loadImage(sleeveRight02Url),
    loadImage(sleeveRight03Url),
  ]);

  if (!terminal.isConnected) {
    return;
  }

  if (
    torso === null ||
    scissors === null ||
    detached === null ||
    left01 === null ||
    left02 === null ||
    left03 === null ||
    right01 === null ||
    right02 === null ||
    right03 === null
  ) {
    await typeLine(terminal, "Scene assets unavailable.");
    if (!terminal.isConnected) {
      return;
    }
    actionButton(container, "CONFIRM", nav.next, SYSTEM_ACTION_PRIMARY);
    return;
  }

  const sleeveSprites: Record<SleeveId, HTMLImageElement> = {
    "left-01": left01,
    "left-02": left02,
    "left-03": left03,
    "right-01": right01,
    "right-02": right02,
    "right-03": right03,
  };

  const { frame, controls } = buildSleeveInterface(
    torso,
    scissors,
    detached,
    sleeveSprites,
    taskSession.sleeve?.attached ?? null,
    (attached) => {
      taskSession.sleeve = { attached };
    },
  );

  const workspace = document.createElement("div");
  workspace.className = "sleeve-workspace";
  container.appendChild(workspace);

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

  addTaskNavControls(container, nav);
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
const HABITAT_INDEX = 2;
const SLEEVE_INDEX = 3;
const TASK4_INDEX = 6;
const TASK5_INDEX = 7;
const TASK3_INDEX = 8;
const TASK2_INDEX = 9;
const TASK1_INDEX = 13;
const LAST_TASK_INDEX = FIRST_TASK_INDEX + 19;

interface TaskSession {
  habitat: HabitatState | null;
  sleeve: SleeveState | null;
  task1: Task1SkyState | null;
  task2: Task2LightState | null;
  task3: Task3WeatherState | null;
  task4: Task4HandsState | null;
  task5: Task5SlotsState | null;
}

const taskSession: TaskSession = {
  habitat: null,
  sleeve: null,
  task1: null,
  task2: null,
  task3: null,
  task4: null,
  task5: null,
};

const visitedTaskIndices = new Set<number>();

function resetTaskState(index: number): void {
  switch (index) {
    case HABITAT_INDEX:
      taskSession.habitat = null;
      break;
    case SLEEVE_INDEX:
      taskSession.sleeve = null;
      break;
    case TASK4_INDEX:
      taskSession.task4 = null;
      break;
    case TASK5_INDEX:
      taskSession.task5 = null;
      break;
    case TASK3_INDEX:
      taskSession.task3 = null;
      break;
    case TASK2_INDEX:
      taskSession.task2 = null;
      break;
    case TASK1_INDEX:
      taskSession.task1 = null;
      break;
    default:
      break;
  }
}

function restartExperience(): void {
  taskSession.habitat = null;
  taskSession.sleeve = null;
  taskSession.task1 = null;
  taskSession.task2 = null;
  taskSession.task3 = null;
  taskSession.task4 = null;
  taskSession.task5 = null;
  visitedTaskIndices.clear();
  show(0);
}

const SEQUENCE: Render[] = [
  renderWelcome,
  renderBriefing,
  renderHabitatTask,
  renderSleeveTask,
  renderTaskPlaceholder(3),
  renderTaskPlaceholder(4),
  renderTask4,
  renderTask5,
  renderTask3,
  renderTask2,
  renderTaskPlaceholder(9),
  renderTaskPlaceholder(10),
  renderTaskPlaceholder(11),
  renderTask1,
  renderTaskPlaceholder(13),
  renderTaskPlaceholder(14),
  renderTaskPlaceholder(15),
  renderTaskPlaceholder(16),
  renderTaskPlaceholder(17),
  renderTaskPlaceholder(18),
  renderTaskPlaceholder(19),
  renderTaskPlaceholder(20),
  renderChoice,
  renderReflection,
];

let currentIndex = 0;
const container = document.querySelector<HTMLElement>("#screen")!;

function show(index: number): void {
  currentIndex = index;
  const isTaskIndex = index >= FIRST_TASK_INDEX && index <= LAST_TASK_INDEX;
  const alreadyVisited = isTaskIndex && visitedTaskIndices.has(index);
  if (isTaskIndex) {
    visitedTaskIndices.add(index);
  }
  container.replaceChildren();
  container.classList.remove("term-wide");
  SEQUENCE[currentIndex](container, {
    next: () => show(currentIndex + 1),
    restart: () => restartExperience(),
    recheck: () => show(FIRST_TASK_INDEX),
    previous: () => {
      if (isTaskIndex && currentIndex > FIRST_TASK_INDEX) {
        show(currentIndex - 1);
      }
    },
    redo: () => {
      resetTaskState(currentIndex);
      show(currentIndex);
    },
    hasPrevious: isTaskIndex && index > FIRST_TASK_INDEX,
    alreadyVisited,
  });
  container.querySelector("h1")?.focus();
}

show(0);
