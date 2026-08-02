// A small, explicit state machine driving a single-page flow. Each state is
// a <section data-app-state="..."> in index.html; this script only ever
// toggles which one is visible and moves focus to it. No timers, no hidden
// changes, no effects — that's deliberately left for a later iteration.
type AppState = "intro" | "experiment" | "doubt" | "reflection";

const NEXT_STATE: Record<AppState, AppState> = {
  intro: "experiment",
  experiment: "doubt",
  doubt: "reflection",
  reflection: "intro",
};

const sections = new Map<AppState, HTMLElement>();
for (const section of document.querySelectorAll<HTMLElement>("[data-app-state]")) {
  const state = section.dataset.appState as AppState;
  sections.set(state, section);
}

let currentState: AppState = "intro";

// The one mechanic: real presses recorded per stage vs. what the counter
// displays. These stay equal until the single deterministic drop in doubt.
let experimentPresses = 0;
let doubtPresses = 0;
let displayedCount = 0;
let mismatchApplied = false;

const MIN_PRESSES: Partial<Record<AppState, number>> = {
  experiment: 3,
  doubt: 1,
};

function pressesFor(state: AppState): number {
  return state === "experiment" ? experimentPresses : state === "doubt" ? doubtPresses : 0;
}

function updateContinueButton(state: AppState): void {
  const min = MIN_PRESSES[state];
  if (min === undefined) return;
  const button = sections.get(state)?.querySelector<HTMLButtonElement>("[data-action='continue']");
  if (button) button.disabled = pressesFor(state) < min;
}

function handlePress(): void {
  if (currentState !== "experiment" && currentState !== "doubt") return;

  if (currentState === "doubt" && !mismatchApplied) {
    mismatchApplied = true;
    doubtPresses += 1;
  } else {
    if (currentState === "experiment") experimentPresses += 1;
    else doubtPresses += 1;
    displayedCount += 1;
    const counter = sections.get(currentState)?.querySelector<HTMLElement>("[data-role='counter']");
    if (counter) counter.textContent = String(displayedCount);
  }

  updateContinueButton(currentState);
}

function showState(state: AppState): void {
  currentState = state;
  for (const [key, section] of sections) {
    section.hidden = key !== state;
  }

  if (state === "intro") {
    experimentPresses = 0;
    doubtPresses = 0;
    displayedCount = 0;
    mismatchApplied = false;
  }

  if (state === "experiment" || state === "doubt") {
    const counter = sections.get(state)?.querySelector<HTMLElement>("[data-role='counter']");
    if (counter) counter.textContent = String(displayedCount);
    updateContinueButton(state);
  }

  if (state === "reflection") {
    const trueCount = experimentPresses + doubtPresses;
    const trueCountEl = sections.get(state)?.querySelector<HTMLElement>("[data-role='true-count']");
    const displayedEl = sections.get(state)?.querySelector<HTMLElement>("[data-role='displayed-count']");
    if (trueCountEl) trueCountEl.textContent = String(trueCount);
    if (displayedEl) displayedEl.textContent = String(displayedCount);
  }

  sections.get(state)?.querySelector<HTMLElement>("h2")?.focus();
}

document.querySelector("main")?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (target.closest("[data-action='press']")) {
    handlePress();
    return;
  }

  if (target.closest("[data-action='continue']")) {
    showState(NEXT_STATE[currentState]);
  }
});

showState(currentState);
