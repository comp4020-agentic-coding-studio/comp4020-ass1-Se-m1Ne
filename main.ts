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

function renderReflection(container: HTMLElement, nav: NavActions): void {
  heading(container, "Reality Alignment");
  paragraph(container, "Checking reality consistency...");
  paragraph(container, "Aligning environment...");
  paragraph(container, "Restoring stable state...");
  paragraph(container, "Reality Alignment Complete.");
  paragraph(container, "Current environment verified.");
  paragraph(container, "");
  paragraph(container, "External reality verification:");
  paragraph(container, "Unable to verify.");
  actionButton(container, "Close Session", nav.restart);
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
