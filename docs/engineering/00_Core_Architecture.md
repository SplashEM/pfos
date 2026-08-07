# Personal Financial Operating System

## Core Architecture & Project Setup Specification

**Document ID:** PFOS-ENG-00
**Status:** Draft for Review
**Target Release:** Version 1 Beta
**Primary Audience:** AI coding agents, software developers, technical reviewers
**Related Documents:**

* PFOS-00 Product Constitution
* PFOS-01 Product Vision & Version 1 PRD
* PFOS-02 Product Decision Log
* PFOS-ENG-01 Rule Engine Specification

---

# 1. Purpose

This document defines the technical foundation for PFOS Version 1.

It establishes:

* Application architecture
* Technology recommendations
* Module boundaries
* Repository organization
* Shared financial data standards
* Persistence abstractions
* State-management boundaries
* Error-handling conventions
* Testing infrastructure
* Security expectations
* Development workflow
* AI coding-agent guardrails

This specification exists to prevent individual features or AI coding tasks from introducing incompatible architectural decisions.

All future engine specifications inherit the standards in this document unless they explicitly state otherwise.

---

# 2. Version 1 Technical Profile

PFOS V1 is:

* A local-first web application
* Desktop-oriented
* Single-user
* USD-only
* Offline-capable after initial application load
* Stored locally using IndexedDB
* Built around deterministic financial engines
* Organized using modular domain boundaries
* Implemented incrementally
* Tested more strictly than a normal personal project

V1 does not require:

* A production backend
* User authentication
* Cloud synchronization
* Live bank connections
* Native mobile applications
* Server-side financial storage
* AI inference
* Physical money movement

---

# 3. Architectural Style

PFOS should use a layered modular architecture inspired by clean architecture and domain-driven design.

The primary layers are:

```text
Presentation
      ↓
Application / Orchestration
      ↓
Domain Engines
      ↓
Repository Interfaces
      ↓
Infrastructure Implementations
```

Dependencies should point inward.

The domain layer must not depend on:

* React
* Browser APIs
* IndexedDB
* UI libraries
* Network APIs
* Analytics SDKs
* Date formatting libraries
* Storage implementations

---

# 4. Architectural Layers

## 4.1 Presentation Layer

Responsible for:

* Screens
* Forms
* Navigation
* Tables
* Cards
* Dialogs
* User input
* Display formatting
* Accessibility
* Loading and error states

The Presentation Layer may call application services.

It must not:

* Implement financial formulas
* Resolve rule precedence
* Update IndexedDB directly
* Calculate net worth independently
* Reconstruct engine explanations
* Mutate domain entities without an application command

---

## 4.2 Application and Orchestration Layer

Responsible for coordinating complete user workflows.

Examples:

* Create paycheck draft
* Generate allocation preview
* Confirm allocation
* Add transaction
* Import CSV
* Reconcile account
* Create goal
* Run simulation
* Restore backup

This layer:

* Loads required domain state through repositories
* Calls the correct engines
* Coordinates atomic writes
* Converts domain results into presentation-ready view models where appropriate
* Records audit entries
* Handles commands and use cases

It must not duplicate domain calculations.

---

## 4.3 Domain Layer

The Domain Layer contains:

* Financial entities
* Value objects
* Engine logic
* Domain services
* Financial invariants
* Domain errors
* Domain event definitions
* Explanation structures

Major domain modules:

* Rules
* Allocations
* Goals
* Transactions
* Accounts
* Insights
* Coaching
* Simulations
* Shared financial primitives

The Domain Layer should be usable in unit tests without a browser.

---

## 4.4 Repository Interfaces

Repository interfaces define how the application accesses data.

Examples:

* RuleRepository
* BucketRepository
* PaycheckRepository
* TransactionRepository
* AccountRepository
* PlanSnapshotRepository
* AuditRepository
* SimulationRepository

Interfaces belong near the application or domain boundary.

Infrastructure implements them.

Financial engines must not directly access repositories unless a specific engine specification explicitly requires a read-only abstraction. Prefer supplying complete evaluation context to pure engine functions.

---

## 4.5 Infrastructure Layer

Responsible for:

* IndexedDB implementation
* CSV parsing adapters
* JSON backup and restore
* Schema migrations
* Browser file handling
* Date/time system adapters
* ID generation
* Optional Web Worker integration
* Logging infrastructure
* Future cloud adapters

Infrastructure may depend on browser APIs and third-party libraries.

It must satisfy the interfaces defined by inner layers.

---

# 5. Recommended Technology Stack

The final choices may be adjusted before Claude begins implementation, but the recommended V1 stack is:

## Language

> TypeScript with strict mode enabled.

## Frontend

> React with a modern build tool.

Recommended build tool:

> Vite.

## Routing

A lightweight client-side router, such as React Router.

## Local Database

> IndexedDB.

A typed IndexedDB wrapper may be used to reduce implementation risk.

Recommended candidate:

> Dexie.

The use of a wrapper must not leak into domain logic.

## Testing

* Vitest for unit and integration tests
* React Testing Library for component behavior
* Playwright for end-to-end testing
* fast-check or equivalent for property-based tests

## Validation

A schema-validation library may be used for imported or persisted data.

Recommended candidate:

> Zod.

Domain invariants must still be enforced by domain logic rather than relying only on schema validation.

## Styling

Use a consistent styling system that supports responsive layouts and accessible components.

The exact solution may be:

* CSS Modules
* Tailwind CSS
* A restrained component library
* A combination approved during UX implementation

Financial logic must remain independent of styling choices.

---

# 6. Technology Decision Constraints

Claude must not add major technologies without documenting the need.

Do not add by default:

* Redux
* GraphQL
* A server framework
* Firebase
* Supabase
* Authentication providers
* Cloud databases
* Microservices
* Electron
* Native mobile frameworks
* AI SDKs
* Bank-integration SDKs

Each dependency must provide a clear benefit that cannot be achieved reasonably with the existing stack.

Prefer fewer dependencies.

---

# 7. Suggested Repository Structure

```text
pfos/
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── vitest.config.ts
│
├── docs/
│   ├── 00_Product_Constitution.md
│   ├── 01_Product_Vision_PRD.md
│   ├── 02_Decision_Log.md
│   │
│   ├── engineering/
│   │   ├── 00_Core_Architecture.md
│   │   ├── 01_Rule_Engine.md
│   │   ├── 02_Allocation_Engine.md
│   │   ├── 03_Goal_Engine.md
│   │   ├── 04_Transaction_Engine.md
│   │   ├── 05_Insight_Engine.md
│   │   ├── 06_Coaching_Engine.md
│   │   ├── 07_Decision_Simulator.md
│   │   ├── 08_Database.md
│   │   ├── 09_Backup_Import_Export.md
│   │   ├── 10_Security.md
│   │   └── 11_Testing.md
│   │
│   ├── ux/
│   └── roadmap/
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers/
│   │   └── shell/
│   │
│   ├── application/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── services/
│   │   ├── orchestration/
│   │   └── dto/
│   │
│   ├── domain/
│   │   ├── shared/
│   │   │   ├── money/
│   │   │   ├── percentages/
│   │   │   ├── dates/
│   │   │   ├── ids/
│   │   │   ├── explanations/
│   │   │   └── errors/
│   │   │
│   │   ├── rules/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── services/
│   │   │   ├── validation/
│   │   │   └── contracts/
│   │   │
│   │   ├── allocations/
│   │   ├── goals/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── insights/
│   │   ├── coaching/
│   │   └── simulations/
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── indexeddb/
│   │   │   ├── migrations/
│   │   │   └── repositories/
│   │   │
│   │   ├── imports/
│   │   │   ├── csv/
│   │   │   └── json/
│   │   │
│   │   ├── exports/
│   │   ├── workers/
│   │   ├── logging/
│   │   └── system/
│   │
│   ├── presentation/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── forms/
│   │   └── view-models/
│   │
│   └── test/
│       ├── fixtures/
│       ├── builders/
│       ├── invariants/
│       └── helpers/
│
├── tests/
│   ├── integration/
│   ├── e2e/
│   ├── migrations/
│   └── performance/
│
└── scripts/
    ├── validate-docs.ts
    ├── check-invariants.ts
    └── seed-demo-data.ts
```

This structure may be simplified during initial scaffolding, but module boundaries must remain clear.

---

# 8. Module Ownership

Each major module owns a defined concept.

## Rules

Owns:

* Rule definitions
* Rule versions
* Rule validation
* Rule precedence
* Resolved rule sets
* Plan rule context

## Allocations

Owns:

* Allocation calculations
* Funding sequence
* Rounding distribution
* Underfunding results
* Allocation previews

## Goals

Owns:

* Goal state
* Goal lifecycle
* Goal progress
* Recurrence
* Funded/completed distinction
* Goal eligibility

## Transactions

Owns:

* Financial events
* Transaction splits
* Ledger effects
* Credit-card reserves
* Refund accounting
* Reconciliation adjustments

## Accounts

Owns:

* Physical financial accounts
* Account classification
* Actual and planned balances
* Liabilities
* Manual assets

## Insights

Owns:

* Planning Score
* Confidence Scores
* Net worth
* Trends
* Reports
* Forecast summaries

## Coaching

Owns:

* Human-readable recommendations
* Teaching messages
* Funding Advisor presentation
* Suggested corrective options

## Simulations

Owns:

* Temporary scenario state
* Scenario changes
* Before/after comparisons
* Application of approved scenario changes

---

# 9. Shared Financial Primitives

Financial primitives must be implemented before most engines.

Required primitives include:

* Money
* Percentage or BasisPoints
* FinancialDate
* DateRange
* EntityId
* CurrencyCode
* Explanation
* Warning
* DomainError
* AuditMetadata

These should be immutable or treated as immutable.

---

# 10. Money Representation

## 10.1 Internal Representation

USD amounts must be represented using integer cents.

Example:

```typescript
type MoneyCents = number;
```

However, a branded type or value object is preferred over a plain number.

Conceptually:

```typescript
type MoneyCents = number & { readonly __brand: "MoneyCents" };
```

Or:

```typescript
interface Money {
  readonly cents: number;
  readonly currency: "USD";
}
```

## 10.2 Safe Integer Constraint

All money values must remain within JavaScript's safe integer range.

Validation must reject unsafe values.

## 10.3 Operations

Money utilities should include:

* Add
* Subtract
* Compare
* Minimum
* Maximum
* Sum
* Allocate by percentages
* Format for display
* Parse user input safely

## 10.4 Prohibited Operations

Do not:

* Store money as formatted strings in the domain
* Store `$12.34` as binary floating-point dollars
* Use `toFixed()` as a financial calculation method
* Mix cents and dollars in the same interface
* Allow silent unit conversion

---

# 11. Percentage Representation

Percentages should use integer basis points or a similarly exact representation.

Example:

* 10% = 1,000 basis points
* 100% = 10,000 basis points

Conceptually:

```typescript
type BasisPoints = number & { readonly __brand: "BasisPoints" };
```

Validation:

* Normal allocation percentages generally range from 0 to 10,000.
* Certain analytical rates may require a wider range later.
* Percentage pools must be validated explicitly.

---

# 12. Deterministic Percentage Allocation

When dividing money by percentages:

1. Calculate each raw proportional share.
2. Round down or use the documented base rounding strategy.
3. Calculate remaining cents.
4. Distribute remaining cents in deterministic priority order.
5. Verify the output total equals the input total exactly.

Example:

```text
$100.00 split three ways:
33.34
33.33
33.33
```

The extra cent goes to the first eligible destination according to explicit ordering.

Repository order must not affect this result.

---

# 13. Date and Time Standards

## 13.1 Domain Dates

Use date-only values where clock time is irrelevant.

Examples:

* Pay date
* Bill due date
* Goal deadline
* Effective date

Avoid storing date-only financial concepts as ambiguous UTC timestamps.

## 13.2 Timestamps

Use timezone-aware timestamps for:

* Created at
* Updated at
* Audit events
* Import time
* Confirmation time

## 13.3 Timezone

V1 is single-user but should store the user’s configured timezone.

Do not assume UTC for month boundaries or effective-date calculations.

## 13.4 Current Time

Domain functions must receive the evaluation date or clock abstraction explicitly.

Do not call `new Date()` inside deterministic engine functions.

---

# 14. Entity Identification

Entities should use stable opaque IDs.

Recommended:

* UUIDs
* ULIDs
* Another collision-resistant identifier

Domain logic must not derive meaning from IDs.

Display names must never be used as identifiers.

---

# 15. Immutability

Confirmed financial records should generally be immutable.

Changes occur through:

* New versions
* Corrections
* Reversals
* Audit entries
* Soft deletion
* Replacement snapshots

Examples:

* Editing a permanent rule creates a new rule version.
* Correcting a transaction records correction metadata.
* Changing a plan creates a new Plan Snapshot when next used.

Draft objects may remain mutable before confirmation.

---

# 16. Command and Query Separation

Use explicit commands for state changes.

Examples:

* CreateIncomeSource
* CreatePaycheckDraft
* ConfirmPaycheckAllocation
* CreateBucket
* UpdateRule
* RecordTransaction
* ReconcileAccount
* RestoreBackup

Use queries for reads.

Examples:

* GetDashboardSummary
* GetAllocationPreview
* GetGoalDetails
* GetNetWorthHistory
* GetPlanningScoreExplanation

Queries must not change financial state.

---

# 17. Atomic Operations

Any workflow that changes multiple financial records must be committed atomically.

Examples:

## Confirm Paycheck Allocation

May create:

* Paycheck record
* Allocation record
* Allocation lines
* Plan Snapshot
* Bucket balance changes
* Audit entries

All must succeed or none should remain confirmed.

## Credit-Card Purchase

May create:

* Transaction
* Split lines
* Credit-card liability change
* Payment reserve change
* Bucket balance effects
* Audit metadata

These effects must remain consistent.

## Restore Backup

The existing database must not be partially overwritten.

---

# 18. Draft, Preview, and Confirmed States

PFOS must explicitly distinguish:

## Draft

User-entered but incomplete data.

May be edited freely.

## Preview

Calculated hypothetical result based on current draft and rules.

Must not modify confirmed balances.

## Confirmed

Financially committed application state.

Requires atomic persistence.

## Reversed or Corrected

Confirmed state that has been explicitly changed while retaining history.

This distinction applies to:

* Paychecks
* Allocations
* Imports
* Reconciliation
* Simulations
* Historical corrections

---

# 19. Domain Events

Application workflows may emit domain events after successful confirmation.

Examples:

* PaycheckConfirmed
* AllocationPosted
* GoalFunded
* GoalCompleted
* GoalBalanceDroppedBelowTarget
* TransactionRecorded
* CreditCardPurchaseRecorded
* AccountReconciled
* RuleVersionActivated
* BackupRestored

V1 does not need a distributed event system.

Events may be synchronous internal objects used for:

* Audit entries
* Updating projections
* Triggering related application logic
* Test verification

Events must not be used to hide core transactional behavior.

---

# 20. Explanation Model

Explanations are first-class domain outputs.

A conceptual explanation structure:

```typescript
interface Explanation {
  readonly code: string;
  readonly title: string;
  readonly summary: string;
  readonly details?: readonly ExplanationDetail[];
  readonly sourceEntityIds?: readonly string[];
  readonly ruleVersionIds?: readonly string[];
  readonly severity?: "info" | "success" | "warning";
}
```

Explanations should use stable codes so the UI can display or group them consistently.

The domain should return structured facts rather than fully styled UI text when possible.

---

# 21. Warning Model

Warnings are not the same as errors.

A warning indicates:

* The action is valid
* The result may be undesirable or unusual
* The user should review it

Examples:

* Lower priorities receive no funding
* Goal is projected late
* Fixed commitments exceed normal income
* Reconciliation adjustment is unexplained

A conceptual warning:

```typescript
interface DomainWarning {
  readonly code: string;
  readonly message: string;
  readonly affectedEntityIds: readonly string[];
  readonly recommendedAction?: string;
}
```

---

# 22. Error Model

Errors must be typed and stable.

Each error should include:

* Stable code
* Category
* User-safe summary
* Technical details where appropriate
* Affected entity IDs
* Suggested resolution where possible

Categories may include:

* Validation
* Missing reference
* Conflict
* Invariant violation
* Persistence
* Import
* Migration
* Unsupported state
* Security
* Concurrency

Raw stack traces must not be shown in the UI.

---

# 23. Result Pattern

Expected domain and application failures should be returned using a typed result rather than thrown indiscriminately.

Conceptually:

```typescript
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Exceptions may still be used for truly unexpected programming failures.

The project should choose one consistent approach.

---

# 24. State Management

The UI should not treat its client-side state store as the authoritative financial database.

Recommended separation:

* IndexedDB repositories own persisted state.
* Application services coordinate reads and writes.
* UI state manages transient presentation concerns.
* Query caching may cache read models.
* Draft forms remain local until saved.

Avoid storing the entire financial domain in one mutable global UI store.

A dedicated state library should be added only if application complexity justifies it.

---

# 25. Persistence Architecture

## 25.1 IndexedDB

IndexedDB stores:

* Accounts
* Buckets
* Groups
* Rules
* Rule versions
* Income sources
* Paychecks
* Allocations
* Plan Snapshots
* Transactions
* Transaction splits
* Goal cycles
* Reconciliation records
* Audit records
* Saved imports
* Categorization rules
* Simulations
* Application settings

## 25.2 Repository Boundary

Repositories convert persistence records into domain objects.

The domain must not know:

* Table names
* IndexedDB indexes
* Dexie schemas
* Migration versions
* Serialization format

## 25.3 Transactions

Infrastructure must expose an atomic unit-of-work mechanism for workflows requiring multiple repository changes.

---

# 26. IndexedDB Schema Versioning

Every schema change requires a migration.

Migration rules:

* Never silently delete user financial data.
* Validate preconditions.
* Back up or preserve recoverable state where practical.
* Test migration from every supported prior version.
* Record completed schema version.
* Fail safely if migration cannot complete.
* Explain recovery options to the user.

V1 may begin at schema version 1, but migration infrastructure must exist before public beta data is considered durable.

---

# 27. Backup Format

Full JSON backups must include:

* Backup format version
* Application schema version
* Export timestamp
* Currency
* User timezone
* Entity collections
* Audit history
* Plan Snapshots
* Referential integrity metadata where needed

Backups must not include executable code.

Restore flow:

1. Parse file.
2. Validate structure.
3. Validate version.
4. Validate references.
5. Check invariants.
6. Show restore summary.
7. Confirm overwrite or merge behavior.
8. Restore atomically.
9. Re-run integrity checks.

V1 should prefer full replacement restore over complicated merging unless later specified.

---

# 28. CSV Architecture

CSV parsing should occur through an adapter.

Stages:

1. Read file safely.
2. Parse rows.
3. Detect encoding or fail clearly.
4. Infer columns.
5. Map columns.
6. Normalize values.
7. Validate rows.
8. Detect duplicates.
9. Apply categorization suggestions.
10. Build import preview.
11. Confirm.
12. Commit atomically.

Large parsing tasks may use a Web Worker.

CSV rows must never become confirmed transactions before review.

---

# 29. Security Architecture

## 29.1 Trust Boundaries

Treat as untrusted:

* CSV files
* JSON backups
* User-entered text
* Imported merchant names
* File names
* Future external data

## 29.2 Prohibited Behavior

Do not:

* Evaluate imported JavaScript
* Use `eval`
* Insert unsanitized HTML
* Trust backup enum values automatically
* Log financial amounts to third-party services
* Send local financial data to external APIs
* Embed secrets in the frontend

## 29.3 Content Security

Use safe rendering practices.

Merchant names and notes must render as text, not HTML.

## 29.4 Future Encryption

V1 backup encryption is optional unless separately specified.

The interface should clearly warn users that unencrypted exports contain sensitive information.

---

# 30. Privacy

V1 should avoid third-party analytics containing financial content.

Permitted local technical diagnostics may include:

* Application version
* Schema version
* Generic error code
* Nonfinancial performance timing

Even these should not be transmitted externally unless telemetry is explicitly added in a future decision.

---

# 31. Testing Architecture

Testing is organized by scope.

## 31.1 Unit Tests

Pure domain functions and value objects.

Examples:

* Money arithmetic
* Percentage splitting
* Rule validation
* Allocation calculations
* Goal state transitions

## 31.2 Integration Tests

Multiple domain modules plus repositories or orchestration.

Examples:

* Rule resolution into allocation
* Paycheck confirmation
* Credit-card purchase posting
* Backup restore

## 31.3 Property-Based Tests

Financial invariants across many generated inputs.

Examples:

* Allocations always balance
* Refunds never restore more than original spending
* Rule resolution always terminates
* Credit-card payments do not duplicate expenses

## 31.4 Migration Tests

Each IndexedDB migration.

## 31.5 End-to-End Tests

The five core product questions.

## 31.6 Performance Tests

Large import and multi-year datasets.

---

# 32. Required Global Financial Invariants

The application must continuously preserve the following.

## Invariant 1

```text
Income = Allocated + Unallocated
```

exactly to the cent.

## Invariant 2

A financial event cannot create or destroy money unless its event type represents an external inflow, outflow, value change, or explicit adjustment.

## Invariant 3

A credit-card purchase records spending exactly once.

## Invariant 4

A credit-card payment is not new spending.

## Invariant 5

Transaction split totals equal the parent transaction total.

## Invariant 6

A refund cannot exceed the refundable amount without an explicit unmatched-credit classification.

## Invariant 7

Archived groups and buckets cannot receive new automatic allocations.

## Invariant 8

Preview and simulation state cannot modify confirmed state.

## Invariant 9

Historical operations retain their original Plan Snapshot.

## Invariant 10

Rule changes do not alter historical allocations.

## Invariant 11

Repository ordering cannot alter deterministic engine results.

## Invariant 12

All references in confirmed records resolve to valid entities or preserved historical references.

---

# 33. Test Fixtures and Builders

Use reusable typed test builders.

Examples:

* money()
* paycheckBuilder()
* bucketBuilder()
* goalBuilder()
* ruleBuilder()
* accountBuilder()
* transactionBuilder()
* planSnapshotBuilder()

Builders should provide valid defaults and allow explicit overrides.

Avoid copying large anonymous objects into every test.

Tests must still remain readable.

---

# 34. Demonstration Data

Development may include optional local demo data.

Demo data must be clearly separated from real user data.

The application should never silently populate financial data in a real user profile.

A developer-only reset or seed script may exist.

---

# 35. Accessibility

V1 must follow core accessibility practices.

Required:

* Keyboard-accessible navigation
* Visible focus states
* Proper labels
* Semantic headings
* Accessible dialogs
* Screen-reader-readable validation
* Text alternatives for charts or visual progress
* Do not use color as the only status indicator
* Reasonable contrast
* Forms usable without mouse hover

Accessibility must be part of component acceptance criteria.

---

# 36. Responsive Scope

V1 is web-first and desktop-oriented.

It should still:

* Avoid fixed widths that break smaller screens
* Support common laptop resolutions
* Remain usable on tablets where practical
* Avoid hover-only actions
* Use responsive cards and tables
* Provide accessible alternatives to dense views

Full mobile optimization is deferred to V2.

---

# 37. Performance Architecture

## 37.1 Targets

* Dashboard under approximately one second for normal data
* Rule and allocation calculations under approximately 100 milliseconds for normal plans
* Smooth interaction with several years of data
* 10,000-row import without long UI blocking

## 37.2 Strategies

Allowed:

* Memoization using immutable inputs
* Indexed queries
* Pagination
* Virtualized tables
* Web Workers
* Incremental parsing
* Cached read models

Not allowed:

* Duplicating domain calculations
* Skipping validation
* Using stale rules without clear cache invalidation
* Sacrificing correctness silently

---

# 38. Logging

Use structured local logging for development.

Log levels:

* Debug
* Info
* Warning
* Error

Production logs must avoid sensitive content.

Do not log:

* Full transaction descriptions
* Account numbers
* Financial balances
* Export contents
* User notes

Use stable error codes and entity IDs where safe.

---

# 39. Feature Flags

V1 may use simple local feature flags during development.

Examples:

* Decision Simulator beta
* CSV import beta
* Reports beta

Feature flags must not create two divergent implementations of financial logic.

Disabled features should remain inaccessible and not partially modify data.

---

# 40. Application Versioning

Track:

* Application version
* Database schema version
* Backup format version
* Domain snapshot schema version

These versions serve different purposes and must not be conflated.

---

# 41. Documentation Standards

Every major domain module must include:

* Specification document
* Public interfaces
* Important invariants
* Example inputs and outputs
* Tests
* Known limitations
* Future extensions

Significant decisions must update PFOS-02 Decision Log.

Code comments should explain why, not restate obvious syntax.

---

# 42. Coding Standards

Required:

* TypeScript strict mode
* No unchecked `any` in domain logic
* Exhaustive handling of discriminated unions
* Immutable inputs where practical
* Pure domain functions where practical
* Explicit return types for public domain APIs
* Stable error codes
* No magic monetary numbers
* No hidden current-date reads in deterministic logic
* No financial calculations in React components

Recommended:

* Small focused functions
* Named domain concepts
* Clear module boundaries
* Consistent naming
* Dependency injection through interfaces
* Functional core with imperative orchestration shell

---

# 43. Linting and Formatting

The project should use automatic formatting and linting.

Recommended:

* ESLint
* Prettier

Rules should prioritize:

* Correctness
* Type safety
* Import boundaries
* Unused-code detection
* React accessibility where available

Avoid overly stylistic lint rules that create unnecessary friction.

---

# 44. Import Boundary Enforcement

The project should prevent invalid dependencies where practical.

Examples:

* `domain` cannot import from `presentation`.
* `domain` cannot import from `infrastructure`.
* `application` may import from `domain`.
* `infrastructure` may implement application/domain interfaces.
* `presentation` may call application services.

This may be enforced using:

* ESLint import restrictions
* Package boundaries
* Path aliases
* Architecture tests

---

# 45. CI Quality Gate

Before merging a milestone:

1. TypeScript compiles.
2. Lint passes.
3. Unit tests pass.
4. Integration tests pass.
5. Relevant property tests pass.
6. Relevant end-to-end tests pass.
7. No financial invariant failures.
8. Documentation is updated.
9. No unrelated future features were added.

A future GitHub Actions workflow may automate these checks.

---

# 46. Claude Project Instructions

The repository root should contain `CLAUDE.md`.

Its purpose is to give Claude persistent operational instructions.

Recommended content:

```text
# PFOS Claude Instructions

Before editing code:

1. Read PFOS-00 Product Constitution.
2. Read PFOS-01 Product Vision PRD.
3. Read PFOS-02 Decision Log.
4. Read PFOS-ENG-00 Core Architecture.
5. Read the specification for the assigned module.

Rules:

- Work only on the requested milestone.
- Do not implement future-version features.
- Do not calculate money using floating-point dollars.
- Do not put financial logic in React components.
- Do not access IndexedDB from domain engines.
- Do not duplicate an existing engine calculation.
- Preserve historical Plan Snapshots.
- Add tests for all financial logic.
- Add a regression test for every financial bug.
- Never weaken tests merely to make them pass.
- Report specification conflicts before choosing a major behavior.
- Keep changes reviewable.
- Update the Decision Log for material architectural changes.
- Run the required test suite before declaring completion.

At task completion, report:

- Files changed
- Requirements implemented
- Tests added
- Test results
- Assumptions
- Known limitations
- Specification conflicts
- Recommended next task
```

---

# 47. Initial Claude Implementation Scope

Claude should not begin by building the complete application.

The first coding milestone should include only:

* Project scaffolding
* TypeScript strict configuration
* Test configuration
* Domain shared primitives
* Money value object
* Basis-points value object
* Domain Result and error types
* Explanation and warning types
* Rule Engine domain types
* Rule validation
* Rule resolution core
* Rule Engine unit and property tests

Do not include in the first milestone:

* Full UI
* IndexedDB repositories
* Allocation Engine
* Goal Engine
* Transaction Engine
* Dashboard
* CSV import
* Decision Simulator
* Cloud services

---

# 48. Recommended First Development Milestones

## Milestone 0: Repository Foundation

Deliver:

* Vite React TypeScript project
* Strict TypeScript
* Linting and formatting
* Vitest
* Playwright setup
* Directory structure
* Path aliases
* CLAUDE.md
* Documentation folder

## Milestone 1: Financial Primitives

Deliver:

* Money
* BasisPoints
* IDs
* Dates
* Results
* Errors
* Explanations
* Invariant tests

## Milestone 2: Rule Engine

Deliver:

* Rule variants
* Validation
* Resolution
* Versioning domain objects
* Snapshot structures
* Determinism tests
* Property tests

## Milestone 3: Allocation Engine

Deliver:

* Pure allocation logic
* Exact rounding
* Priority behavior
* Leftover policies
* Explanations
* Invariants

## Milestone 4: Persistence Foundation

Deliver:

* IndexedDB schema
* Repository interfaces
* Repository implementations
* Unit-of-work abstraction
* Migrations
* Repository tests

## Milestone 5: Paycheck Allocation Vertical Slice

Deliver:

* Minimal paycheck entry
* Allocation preview
* Confirmation
* Plan Snapshot
* Persistence
* Basic audit history
* Minimal UI

This is the first point at which the user can experience the product’s core value.

---

# 49. Architecture Acceptance Criteria

The architecture foundation is complete when:

1. The repository follows documented layer boundaries.
2. TypeScript strict mode is active.
3. Money cannot be represented ambiguously in domain APIs.
4. Percentages use exact deterministic representation.
5. Domain functions do not access browser storage.
6. Repository interfaces isolate IndexedDB.
7. Commands and queries are distinguishable.
8. Draft, preview, and confirmed states are distinct.
9. Atomic operation support is defined.
10. Typed errors and results are available.
11. Explanation and warning structures are available.
12. Date and clock access can be injected.
13. Unit, integration, property, and end-to-end test frameworks are configured.
14. Import boundaries are enforceable.
15. `CLAUDE.md` exists and reflects PFOS constraints.
16. No future-version backend or cloud architecture has been introduced.
17. A developer or coding agent can implement the Rule Engine without choosing a new architecture.

---

# 50. Definition of Done

The Core Architecture is not complete merely because the application runs.

It is complete when:

* Financial logic has a safe home.
* Every dependency boundary is clear.
* Money and percentages have exact representations.
* Engines can be tested without React or IndexedDB.
* Persistence can change without rewriting domain logic.
* Historical behavior can remain reconstructable.
* Imports and backups have defined trust boundaries.
* The AI coding agent has explicit implementation constraints.
* Future features can be added without duplicating financial rules.
* The first vertical slice can be implemented incrementally and safely.

---

# 51. Deferred Technical Decisions

The following may remain undecided until the relevant milestone:

* Exact component library
* Exact chart library
* Exact form library
* Exact client query-cache library
* Exact worker implementation
* Backup encryption
* Cloud synchronization framework
* Native mobile framework
* Server architecture
* Authentication provider

Claude must not choose or implement these prematurely.

---

# 52. Final Architecture Statement

PFOS should be built as a financial domain system with a web interface—not as a collection of screens containing calculations.

The architecture must ensure that:

> Financial rules are defined once, financial calculations are owned once, financial history is preserved, and every important result can be explained.

The next technical document is the **Allocation Engine Specification**. Once that document is approved, the initial Claude implementation package will contain enough detail to begin Milestones 0–2 safely.
