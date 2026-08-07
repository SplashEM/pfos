# PFOS Claude Instructions

## Product

PFOS is a planning-first Personal Financial Operating System.

Version 1 must answer:

1. Where should my next paycheck go?
2. Am I on track with my financial plan?
3. Will I reach my goals?
4. What should I change if I will not?
5. What happens if I make this financial decision?

## Required reading

Before changing code, read:

- docs/00_Product_Constitution.md
- docs/01_Product_Vision_PRD.md
- docs/02_Decision_Log.md
- docs/engineering/00_Core_Architecture.md
- The specification for the assigned engine or milestone

## Non-negotiable rules

- Work only on the requested milestone.
- Do not implement future-version features.
- Do not use floating-point dollars for money.
- Represent money using integer cents or an exact Money value object.
- Use basis points for percentages.
- Do not place financial calculations in React components.
- Do not access IndexedDB directly from domain engines.
- Do not duplicate calculations owned by another engine.
- Preserve historical plan snapshots.
- Keep previews and simulations separate from confirmed data.
- Add tests for all financial logic.
- Add a regression test for every financial bug.
- Never weaken or remove a test merely to make it pass.
- Do not introduce major dependencies without explaining why.
- Do not make architectural decisions that conflict with the specifications.
- Report material ambiguities before implementing assumptions.
- Keep changes small and reviewable.
- Do not edit unrelated files.

## Completion report

At the end of every task, report:

1. Files created or modified
2. Requirements implemented
3. Tests added
4. Commands run
5. Test results
6. Assumptions made
7. Known limitations
8. Specification conflicts
9. Recommended next task
