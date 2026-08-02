# COMP4020 prototype

# Project

This project is an interactive philosophical explainer inspired by the "Brain in a Vat" thought experiment.
The goal is not to tell users the philosophy directly.
Instead, users should gradually experience uncertainty through interaction before any explanation is revealed.

## Design Principles

Every feature must support one of these stages:
1. Trust
2. Doubt
3. Reflection
If a feature does not strengthen one of these stages, it should not be added.

## User Experience

The interface should feel believable before it becomes questionable.
Avoid unnecessary visual effects.
Avoid making the experience feel like a game.
Subtlety is preferred over surprise.
Small inconsistencies are more effective than obvious tricks.

## Development Principles

Keep components small.
Keep application statentally.
Do not over-engineer early versions.

## Accessibility

The experience must remain usable with:
- keyboard navigation
- desktop viewport
- mobile viewport
Semantic HTML should always be preferred.

## Scope

One idea.
One interaction.
One experience.
Avoid adding unrelated content or features.

## Iteration 1

Current goal:
Build a clean application structure only.
Do not implement psychological effects yet.e explicit.
Prefer readable code over clever code.
Avoid unnecessary dependencies.
Build features increm

## Iteration 2

Building the first Brain in a Vat experience layer.

Goal:
Transform the existing interaction skeleton into the first playable version of the
Brain in a Vat concept.

The experience should not explain the philosophical theory directly. Instead, it
should create the feeling of gradually losing trust in the interface.

Design principles:
- Build around one core mechanic: trust erosion through interaction.
- The user should actively do something before doubt is introduced.
- Changes should be intentional and understandable, not random tricks.
- Preserve the existing state-machine architecture unless a strong reason requires
  changing it.
- Keep the prototype small: one idea, one interaction, one experience.

Current experience arc:
1. Establish trust.
2. Introduce small inconsistencies.
3. Encourage the user to question the system.
4. End with an open reflection rather than a clear explanation.

Implementation constraints:
- Do not add unnecessary frameworks or dependencies.
- Do not modify spec/ tests.
- Keep the site static and client-side.
- Verify behaviour before accepting changes.