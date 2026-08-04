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

const ALIGNMENT_WINDOW_OFFSET_PX = 16;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createAlignmentWindow(
  stage: HTMLElement,
  index: number,
  title: string,
): { root: HTMLElement; body: HTMLElement } {
  const root = document.createElement("div");
  root.className = "align-window";
  root.style.marginLeft = `${index * ALIGNMENT_WINDOW_OFFSET_PX}px`;

  const titleBar = document.createElement("div");
  titleBar.className = "align-window-title";
  titleBar.textContent = title;

  const body = document.createElement("div");
  body.className = "align-window-body";

  root.append(titleBar, body);
  stage.appendChild(root);
  return { root, body };
}

function createAlignmentProgress(body: HTMLElement, label: string): { track: HTMLElement; fill: HTMLElement } {
  const track = document.createElement("div");
  track.className = "align-progress-track";
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "100");
  track.setAttribute("aria-valuenow", "0");
  track.setAttribute("aria-label", label);

  const fill = document.createElement("div");
  fill.className = "align-progress-fill";
  track.appendChild(fill);
  body.appendChild(track);
  return { track, fill };
}

function animateAlignmentProgress(
  track: HTMLElement,
  fill: HTMLElement,
  targetPercent: number,
  durationMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    fill.style.transitionDuration = `${durationMs}ms`;
    requestAnimationFrame(() => {
      fill.style.width = `${targetPercent}%`;
      track.setAttribute("aria-valuenow", String(targetPercent));
    });
    setTimeout(resolve, durationMs);
  });
}

async function runAlignmentStep(stage: HTMLElement, index: number, title: string, message: string): Promise<void> {
  const { body } = createAlignmentWindow(stage, index, title);
  paragraph(body, message);
  const { track, fill } = createAlignmentProgress(body, message);
  await animateAlignmentProgress(track, fill, 100, 1500);
}

function runAlignmentCompleteWindow(stage: HTMLElement, index: number, title: string): void {
  const { body } = createAlignmentWindow(stage, index, title);
  paragraph(body, "Reality Alignment Complete.");
  paragraph(body, "Current environment verified.");
}

async function runExternalVerificationWindow(
  stage: HTMLElement,
  index: number,
  container: HTMLElement,
  nav: NavActions,
): Promise<void> {
  const { body } = createAlignmentWindow(stage, index, "External reality verification");
  const { track, fill } = createAlignmentProgress(body, "External reality verification");
  await animateAlignmentProgress(track, fill, 42, 1200);
  await sleep(3000);
  paragraph(body, "Verification failed.");
  actionButton(container, "Close Session", nav.restart);
}

async function runAlignmentSequence(stage: HTMLElement, container: HTMLElement, nav: NavActions): Promise<void> {
  const processTitle = "Reality Alignment Process";

  await runAlignmentStep(stage, 0, processTitle, "Checking reality consistency...");
  await sleep(400);
  await runAlignmentStep(stage, 1, processTitle, "Aligning environment...");
  await sleep(400);
  await runAlignmentStep(stage, 2, processTitle, "Restoring stable state...");
  await sleep(400);

  runAlignmentCompleteWindow(stage, 3, processTitle);
  await sleep(1200);

  await runExternalVerificationWindow(stage, 4, container, nav);
}

function renderReflection(container: HTMLElement, nav: NavActions): void {
  heading(container, "Reality Alignment");

  const stage = document.createElement("div");
  stage.className = "alignment-stage";
  stage.setAttribute("aria-live", "polite");
  container.appendChild(stage);

  void runAlignmentSequence(stage, container, nav);
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
