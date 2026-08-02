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

function showState(state: AppState): void {
  currentState = state;
  for (const [key, section] of sections) {
    section.hidden = key !== state;
  }
  sections.get(state)?.querySelector<HTMLElement>("h2")?.focus();
}

document.querySelector("main")?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest("[data-action='continue']")) return;
  showState(NEXT_STATE[currentState]);
});

showState(currentState);
