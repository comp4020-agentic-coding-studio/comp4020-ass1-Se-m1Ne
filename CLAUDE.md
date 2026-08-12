# Project Direction

## Overall experience

Build a **linear full-screen interactive explainer** inspired by the **Brain in a Vat** thought experiment.

The experience should feel like a controlled environment calibration system, not a normal website or game.

Only **one page or stage** is visible at a time.

Scrolling must never reveal future tasks or ending content.

The philosophical idea should mainly come through the user's actions. Do not explain the **Brain in a Vat** thought experiment directly during the main experience.

---

## Core idea and mechanic

The **one strong idea** is that the user slowly builds their own version of reality through their choices.

The **one core mechanic is calibration**.

In each task:

1. the system gives the user something about the world to set or answer;
2. the user gives a response;
3. the system accepts it as part of the calibrated world;
4. the experience moves on.

Dragging, drawing, selecting, typing and positioning are different ways of giving a response, not separate core mechanics.

There is no scoring and no single correct version of the world.

---

## Experience structure

The experience is organised as a sequence of separate stages:

* Welcome
* Briefing
* 20 calibration tasks
* Reality Confirmation
* Reality Alignment
* External Reality Verification
* Ending

Each stage should have one clear purpose.

Future stages remain hidden until reached.

Some stages use buttons to continue, while some later system sequences may move forward automatically.

---

## Welcome

The experience begins with a minimal terminal-style Welcome screen.

Keep it simple.

Use the established system typing style and avoid giving the user unnecessary information before the experience begins.

The Welcome should feel like entering a system rather than opening a normal webpage.

---

## Briefing

The Briefing introduces the task sequence in neutral language.

Use:

> The following tasks will present a series of environment parameters and conditions.
>
> Interact with each according to the instructions provided.
>
> Use your own judgement where required.

Do not tell the user that the environment is wrong.

Do not mention:

* simulation
* Brain in a Vat
* external reality
* hidden errors
* a final twist

The user should enter the tasks without being told what conclusion to reach.

---

## Calibration tasks

The experience contains **20 short calibration tasks**.

Each task should focus on one small part of the world or one question about it.

The early tasks should feel simple and practical. Later tasks can become more open and uncertain, moving towards ideas such as:

* the shape of the world
* ordering and hierarchy
* boundaries
* reference
* object continuity
* viewpoint

Do not suddenly turn the experience into a philosophy quiz.

Avoid direct questions such as:

> What is real?

or:

> Can you trust your senses?

Let the interaction suggest these ideas instead.

---

## Task interaction rules

The system should accept the user's response without judging it.

Do not add:

* scores
* Correct / Incorrect messages
* success ratings
* failure states based on answers
* unnecessary validation

Open tasks may accept unusual, incomplete or empty answers where the current task design allows it.

The goal is for the user to make decisions, not solve puzzles.

---

## Task navigation and state

Use the shared:

* BACK
* REDO
* CONFIRM

system where appropriate.

**BACK** should return to the previous task while keeping the user's saved state.

**REDO** should reset only the current task.

**CONFIRM** accepts the current response and normally moves forward.

Some designed sequences may continue automatically after CONFIRM or after a system animation. Do not require an extra click when the current design calls for an automatic transition.

Returning to a task should restore its saved user state unless that task has a specific designed reveal that should replay.

---

## Progression

The 20 tasks should feel like parts of the same calibration process, even when they use different input methods.

The overall progression is roughly:

simple environment calibration
-> unusual physical conditions
-> open world definition
-> boundaries and reference
-> observation and viewpoint

Keep this change gradual.

The user should become familiar with the system before the questions become more unusual.

---

## Task 20 connection

The final calibration task should reuse the world drawing created earlier in Task 15.

The Task 15 drawing represents the user's world.

In Task 20, the observation point can move across the full viewport, including outside the boundary of that world.

Do not warn the user when the point is outside.

Do not label it as invalid or external.

There is no correct viewpoint.

This should remain quiet and unexplained.

---

## Ending

After the calibration tasks, move into the existing ending sequence.

The ending includes:

1. **Reality Confirmation**
2. **Reality Alignment**
3. **External Reality Verification**
4. the final failed / unknown external reality state

Reality Alignment should look like a controlled system process.

After it completes, move to External Reality Verification as a separate stage.

The external check should fail to give a clear answer.

Do not confirm that the user is definitely:

* in a simulation
* in a Brain in a Vat scenario
* outside reality

The ending should leave the status of external reality uncertain.

Keep the existing popup and return behaviour.

---

## Visual language

Keep the interface consistent across the full experience:

* dark / black background
* muted cyan-grey colours
* monospace typography
* terminal-style text input
* thin system borders
* simple mechanical controls
* flat, cold visual assets
* restrained animation

The experience should feel clinical, controlled and slightly uncomfortable.

Avoid:

* colourful game UI
* playful cartoon styling
* decorative modern cards
* unnecessary effects
* large visual changes between tasks

---

## Text and animation

Task instructions should use the same terminal-style `>` marker as other system output.

Keep typing animations visible but reasonably quick.

Task headings can load slightly more slowly than normal terminal output.

Do not connect text typing speed to image or workspace loading.

Images and interactive task bodies should keep their own working reveal timing.

---

## Design principles

* One stage = one main interaction or purpose.
* Only one stage is visible at a time.
* No scrolling into future content.
* Use **calibration** as the shared core mechanic.
* Different input methods are still part of the same mechanic.
* No correctness checking or scoring.
* Do not tell users what they should think.
* Keep philosophical explanation minimal.
* Let later tasks become stranger gradually.
* Preserve user state when moving back.
* Keep the interface minimal, clinical and consistent.
* Prefer interaction over explanation.
