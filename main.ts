interface NavActions {
  next: () => void;
  restart: () => void;
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

function actionButton(container: HTMLElement, label: string, onClick: () => void): void {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  container.appendChild(button);
}

function renderWelcome(container: HTMLElement, nav: NavActions): void {
  heading(container, "Welcome");
  paragraph(container, "Welcome.");
  actionButton(container, "Begin", nav.next);
}

function renderBriefing(container: HTMLElement, nav: NavActions): void {
  heading(container, "Briefing");
  paragraph(container, "Some parts of the following environment may not reflect the world as you know it.");
  paragraph(container, "Proceed through each stage using your own judgement.");
  paragraph(container, "Instructions for each task will be provided individually.");
  actionButton(container, "Continue", nav.next);
}

function renderTaskPlaceholder(n: number): Render {
  return (container, nav) => {
    heading(container, `Task ${n}`);
    paragraph(container, `Task ${n} Placeholder.`);
    actionButton(container, "Continue", nav.next);
  };
}

function renderChoice(container: HTMLElement, nav: NavActions): void {
  heading(container, "Choice");
  actionButton(container, "Accept", nav.next);
  actionButton(container, "Look Again", nav.restart);
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

function typeLine(terminal: HTMLElement, text: string): Promise<HTMLElement> {
  const line = document.createElement("div");
  line.className = "term-line";
  terminal.appendChild(line);

  if (text.length === 0) {
    return Promise.resolve(line);
  }

  return new Promise((resolve) => {
    let i = 0;
    function typeNext(): void {
      i += 1;
      line.textContent = text.slice(0, i);
      if (i < text.length) {
        setTimeout(typeNext, TYPE_CHAR_MS);
      } else {
        resolve(line);
      }
    }
    setTimeout(typeNext, TYPE_CHAR_MS);
  });
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

const SEQUENCE: Render[] = [
  renderWelcome,
  renderBriefing,
  ...Array.from({ length: 20 }, (_, i) => renderTaskPlaceholder(i + 1)),
  renderChoice,
  renderReflection,
];

let currentIndex = 0;
const container = document.querySelector<HTMLElement>("#screen")!;

function show(index: number): void {
  currentIndex = index;
  container.replaceChildren();
  SEQUENCE[currentIndex](container, {
    next: () => show(currentIndex + 1),
    restart: () => show(0),
  });
  container.querySelector("h1")?.focus();
}

show(0);
