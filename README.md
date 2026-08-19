# PFOS

**Personal Financial Operating System** — a planning-first personal financial system.

> Plan first. Spend with confidence.

PFOS helps you decide what your money should do *before* it is spent, rather than
reporting where it already went. Version 1 exists to answer five questions well:

1. Where should my next paycheck go?
2. Am I on track with my financial plan?
3. Will I reach my goals?
4. What should I change if I will not?
5. What happens if I make this financial decision?

---

## What PFOS does today

PFOS answers the first of its five questions end to end, locally, on your own
device:

- **Build a plan.** Set a giving percentage, rank up to three top priorities
  with a fixed amount each, and name where everything left over goes.
- **Keep it.** Plan settings are saved on this device and survive a reload.
- **Preview a paycheck.** Enter an amount and a date and see exactly where that
  money would go, resolved by the Rule Engine and allocated by the Allocation
  Engine.
- **Understand every line.** Each destination says why it received what it did —
  the rate that applied, the priority rank and what it asked for, or that it
  takes the remainder.
- **See whether the plan fit.** When a paycheck cannot fully fund every
  priority, the preview says so before you read a single row.
- **Confirm it.** Confirming records the paycheck and the plan that produced it
  as an immutable local record.
- **Keep your history.** Every confirmed paycheck stays readable, newest first,
  showing the amounts, reasons and destination names it was confirmed with —
  unchanged by any later edit to your plan.

**PFOS never moves money.** It is a planning system: confirming records what you
decided, and no transfer, payment or bank interaction happens or is possible.

Confirmed paychecks cannot yet be corrected, reversed or deleted.

Everything is local. There is no account, no server and no synchronisation.

### Not in this version

Goal tracking, recurring bills, lower-priority pools, simulations, coaching,
corrections, export and backup, bank connections, and multi-currency. The
architecture leaves room for them; none is partially implemented.

Milestones are defined in `docs/engineering/00_Core_Architecture.md` §48 and are
taken in order as separate reviewable units (Decision 069).

---

## Prerequisites

- **Node.js** 20.19+ or 22.12+ (developed on 24.x)
- **npm** 10+

## Setup

```bash
npm install
```

To run end-to-end tests, install the browser binaries once:

```bash
npx playwright install chromium
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck, then produce a production build |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Typecheck application and config projects |
| `npm run lint` | ESLint, including architectural import boundaries |
| `npm run format` | Apply Prettier |
| `npm run format:check` | Verify formatting without writing |
| `npm test` | Run unit and component tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run Playwright end-to-end tests |

Before submitting a milestone, `typecheck`, `lint`, `test`, and `build` must all
pass (`docs/engineering/00_Core_Architecture.md` §45).

---

## Architecture

Dependencies point **inward**. An outer layer may depend on an inner one; never
the reverse.

```
Presentation  →  Application / Orchestration  →  Domain Engines
                                                      ↓
                                          Repository Interfaces
                                                      ↑
                                        Infrastructure Implementations
```

| Directory | Layer | Rules |
| --- | --- | --- |
| `src/app/` | Composition root | Wires everything together. The one place permitted to import infrastructure. |
| `src/presentation/` | Presentation | Screens and components. No financial math, no storage access. |
| `src/application/` | Application | Commands, queries, workflow orchestration. No React, no infrastructure. |
| `src/domain/` | Domain | Pure deterministic financial logic. No React, no browser APIs, no clock, no randomness. |
| `src/infrastructure/` | Infrastructure | IndexedDB, CSV, backups. Implements inner-layer interfaces. |
| `src/test/` | Test support | Shared setup, fixtures, architecture guards, and integration tests that cross layers. |
| `tests/e2e/` | End-to-end | Playwright specs. |

Subdirectories are created by the milestone that fills them, rather than
pre-built empty.

These boundaries are enforced by ESLint (`eslint.config.js`), not by convention
alone. The domain layer additionally rejects `new Date()`, `Date.now()`,
`Math.random()`, and browser globals, because financial engines must be
deterministic and receive their evaluation context explicitly.

### Path aliases

`@app/*` · `@application/*` · `@domain/*` · `@infrastructure/*` ·
`@presentation/*` · `@test/*`

Declared in `tsconfig.json` and `vite.config.ts`. Both must stay in sync.

---

## Non-negotiable rules

These are enforced in review and, where possible, in tooling:

- Money is never a floating-point dollar value. Use integer cents or an exact
  `Money` value object.
- Percentages use basis points (10% = 1,000 bp).
- No financial calculations in React components.
- Domain engines never touch IndexedDB.
- One calculation, one owner. Never duplicate a calculation another engine owns.
- Historical plan snapshots are preserved. Rule changes are prospective.
- Previews and simulations never modify confirmed data.
- Every financial calculation has tests. Every financial bug gets a permanent
  regression test.
- Never weaken or delete a test to make it pass.

The full set lives in `CLAUDE.md` and `docs/00_Product_Constitution.md`.

---

## Documentation

Read in this order. When documents conflict, authority runs top to bottom
(Decision 068).

| Document | Purpose |
| --- | --- |
| `docs/00_Product_Constitution.md` | Governing principles. Highest authority. |
| `docs/02_Decision_Log.md` | Accepted decisions and their reasoning. |
| `docs/01_Product_Vision_PRD.md` | What V1 is. |
| `docs/engineering/00_Core_Architecture.md` | Technical foundation and milestones. |
| `docs/engineering/01_Rule_Engine.md` | Rule resolution and precedence. |
| `docs/engineering/02_Allocation_Engine.md` | Allocation calculations. |
| `CLAUDE.md` | Operational instructions for coding agents only. |

A decision that is accepted is not reversed informally. See
`docs/02_Decision_Log.md` §4 for the process.

---

## Scope boundaries

Version 1 is local-first, single-user, USD-only, and desktop-oriented. It does
not include bank synchronization, physical money movement, notifications,
shared households, multi-currency, native mobile apps, or machine learning.

The architecture is designed to permit these later. They must not be partially
implemented now.
