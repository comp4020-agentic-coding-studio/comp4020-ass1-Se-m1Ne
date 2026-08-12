# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and each brief adds its own word count and moment count.

## What I built

I built an interactive explainer inspired by the Brain in a Vat thought experiment. The one strong idea is that the user slowly builds their own version of reality through their choices. Instead of simply showing the user a world that cannot be trusted, the system asks them to decide what different parts of the world should be like.

The project uses one core mechanic: calibration. In each of the 20 tasks, the system gives the user something about the world to set or answer. The user gives their answer, and the system accepts it and moves on. Dragging, drawing, selecting and typing are just different ways to give an answer, not different mechanics. The tasks start with simple things like objects and environment settings, but slowly move to questions about boundaries, reference and viewpoint. At the end, the system tries to check an external reality but cannot confirm it. My goal was to let the user experience the Brain in a Vat idea through the calibration process, instead of directly explaining the philosophy.

## The moments that mattered

### 1. Starting with a small structure

Before building the full experience, I first set the main project rules in `CLAUDE.md` and built a small state-machine structure.

[`71cde0b`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/71cde0b)
[`bf9e13d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/bf9e13d)

I did not want the agent to build the whole idea at once. Starting small let me check the basic flow, 
page changes and interaction structure before adding more content.

### 2. Testing an idea that did not work

My first main mechanic was a button counter. It worked normally at first,
then showed one wrong count to make the user question whether the system could be trusted.

[`086675f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/086675f)

The code worked, but the idea did not. The wrong number looked more like a software bug than something that made the user question reality. 
This made me stop improving that mechanic and rethink the whole interaction.

### 3. Changing the project to reality calibration

I changed the main idea from "the system gives wrong information" to "the user calibrates the world".

[`9857454`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/9857454)
[`7768adc`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/7768adc)

This became the core mechanic of the final project. The system gives the user something about the world to set or answer, accepts the response, and moves on.
This made unusual tasks feel like part of the system instead of bugs.

### 4. Building the ending and visual style early

Once the new direction was clear, I built the ending before all 20 tasks were finished. 
I first made the reality-checking sequence, then added the Windows-stylefailure popup and improved its timing and visual style.

[`bc34976`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/bc34976)
[`396b1ac`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/396b1ac)
[`f5288a1`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/f5288a1)

I chose not to tell the user that they are definitely in a simulation. 
The system tries to check an external reality, fails, and leaves the result unknown.
This gave the 20 tasks a clear point to lead towards.

I also used the same terminal style for Welcome, Briefing and the later system
screens.

[`4a803c5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/4a803c5)
[`fa4e6c5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/fa4e6c5)

### 5. Replanning the experience as 20 tasks

After testing several early calibration tasks, I planned the full 20-task sequence instead of treating each task as a separate mini-game.

[`2697d55`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/2697d55)
[`b22102f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/b22102f)
[`bda4e47`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/bda4e47)

The new order starts with simple environment tasks and slowly becomes stranger and more open. 
I wanted users to get used to following the calibration system before it started asking about things like the shape, 
limits and reference points of the world.

I then built the individual tasks around this shared calibration mechanic.

[`beba38f...baf8e2c`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/compare/beba38f...baf8e2c)

### 6. Making the later tasks less direct

Tasks 13-19 gradually move away from normal environment settings. 
For example, Task 13 asks whether the user can still see a sunset in 800 years, 
Task 15 lets the user draw the shape of the world, 
and Tasks 16-19 use open input, hierarchy, reference and object continuity.

[`22eb65d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/22eb65d)
[`ee622cf...497b2a7`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/compare/ee622cf...497b2a7)

I deliberately avoided direct questions like "What is real?" or "Can you trust your senses?". 
The interactions should suggest these ideas without telling the user what they are supposed to think.

### 7. Reusing the user's world in the final task

Task 20 brings back the world that the user drew in Task 15.

[`8bf276b`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/8bf276b)

The user can move an observation point anywhere on the screen, including outside the world they drew. 
The system does not show a warning or say that this is wrong.

I liked this connection because Task 15 seems like a simple drawing task when it first appears. 
Only later does the same drawing become the boundary of the user's world.

### 8. Final integration and pacing

The final pass connected the 20 tasks to the ending and improved shared details
such as task state, terminal instructions, text speed and ending transitions.

[`721bb83`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/721bb83)

I also changed the Briefing so it does not tell the user in advance that something is wrong with the world. 
The final experience starts like a normal calibration process and lets the strange parts appear through the tasks themselves.

The biggest change across the whole process was the user's role. 
The first prototype tried to make the system break the user's trust. 
The final version instead asks the user to keep defining and confirming the world for the system.
That change became the main idea behind the finished experience.

### A worked moment, for shape

### A worked moment: changing the core mechanic

My first version used one button-counting task. 
The system counted normally at first, then showed one wrong number to make the user question whether it could be trusted 
([`086675f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/086675f)). 
The interaction worked, but when I tested it, the wrong count just felt like a software bug. 
I could have kept asking the agent to make the mismatch more noticeable, but that would not fix the main problem with the idea. 
Instead, I changed the prompt and rebuilt the experience around **calibration**: 
the system asks the user to set or answer something about the world, accepts it, and moves on 
([`9857454`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/9857454), 
[`7768adc`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/7768adc)). 
I first tried this direction with a small set of tasks before planning the full sequence. 
Once those tasks worked as parts of the same system, I reorganised the project into the 20-task progression 
([`bda4e47`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Se-m1Ne/commit/bda4e47)). 
This was the point where the project stopped being about catching the system in a lie and became about the user helping the system define its world.
