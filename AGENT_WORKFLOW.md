# AI Agent Workflow Log

*A documented breakdown of AI agent collaboration in building a FuelEU-compliant maritime emissions platform.*

---

## 🔧 Agents Employed

| Agent              | Role in Workflow                                                               |
| ------------------ | ------------------------------------------------------------------------------ |
| **Cursor**         | Principal generator for backend/frontend structure and boilerplate scaffolding |
| **Windsurf**       | Prompt refinement, architecture enforcement, and complex task chaining         |
| **GitHub Copilot** | Inline completions for boilerplate, JSX rendering, and helper utilities        |
| **Claude Code**    | Code review assistant for formula validation and type-safe refactoring         |

---

## 📋 Prompt-Driven Engineering Highlights

### 🎯 Phase 1: FuelEU Core Calculation Engine

**Prompt (to Cursor):**

> “Design a FuelEU GHG computation service in TypeScript implementing Annex II and IV logic. Include `calcEnergyMJ`, `calcGHGIntensity`, and `calcComplianceBalance`. Use fixed target 89.3368 gCO₂e/MJ and 41,000 MJ/t.”

**Generated Output:**

* Created `calculationService.ts` with modular, testable functions.
* Missed GWP factors and slip corrections for CH₄/N₂O.

**Manual Enhancements:**

* Applied GWP100 factors: CH₄ = 25, N₂O = 298
* Integrated fuel-specific WtT + TtW constants per FuelEU Annex II
* Ensured all results computed in gCO₂e internally for consistency

---

### 🎯 Phase 2: Data Layer — Prisma ORM Schema

**Prompt (to Windsurf):**

> “Generate a Prisma schema for Route, ShipCompliance, BankEntry, Pool, and PoolMember. Ensure normalized relationships and unique route identifiers.”

**Generated Output:**

* Delivered normalized, relational schema with route-centric design
* Handled model relationships effectively

**Fixes & Augmentations:**

* Introduced `cb_before` and `cb_after` fields for pooling integrity
* Added timestamp defaults and optional indexing for performance
* Used Zod validation downstream for API safety

---

## ✅ Validation and QA

* Enforced `tsc --strict` and `eslint` rules across both frontend and backend
* Built unit tests for all core formulas using `Jest`
* API tested using `Supertest` on seeded data with expected GHG outputs
* Manually verified GHG computation accuracy with FuelEU Annex IV examples
* Confirmed API contract alignment with frontend expectations using Postman mocks

---

## 📌 Observations & Engineering Insights

### ✅ AI Strengths

* **Rapid bootstrap**: Cursor built hexagonal scaffolding + Prisma setup in minutes
* **Functional correctness**: GHG formulas (e.g. CB, intensity) translated with minimal tweaks
* **Modular UI**: React components generated with reusable props and clear hierarchy

### ⚠️ Human Oversight Was Essential

* **Numeric precision**: Agent skipped rounding rules (needed 6 decimals for tonnes)
* **Logic boundaries**: Pooling logic lacked constraint to preserve individual ship CB
* **Schema design**: Needed semantic renaming and compliance-specific attributes
* **State management**: Required React optimizations to avoid data staleness on tab switch

---

## 🧠 Engineering Best Practices Applied

| Principle              | Implementation Example                                                  |
| ---------------------- | ----------------------------------------------------------------------- |
| Modular Prompting      | Isolated each agent task by architecture layer or business rule         |
| Prompt Iteration       | Refined prompts with Windsurf to close gaps and improve clarity         |
| Layer Isolation        | Applied hexagonal architecture: pure logic separated from adapters      |
| Data Integrity         | Used Prisma validations and runtime checks via Zod                      |
| Test-First Development | Calculations, compliance logic, and pooling algorithm unit-tested early |

---

## 💬 Commit Discipline

Commits were atomic, semantically grouped, and traceable:

* `feat(core): implement calcGHGIntensity and compliance balance logic`
* `test(api): add Supertest suite for route comparison endpoint`
* `fix(prisma): enforce unique constraints and add createdAt timestamps`
* `feat(frontend): implement pooling UI and data wiring`
* `chore(ci): configure GitHub Actions for lint/test validation`
* `docs: finalize README, workflow, and compliance formulas`

---

## 🔁 Improvements & Scalability

* Predefine prompt chaining map across agent responsibilities
* Integrate OpenAPI schema generation from Zod definitions
* Introduce GitHub Actions matrix testing for DB migrations and API health
* Use Storybook for UI contract isolation and accessibility snapshots

---

## 🔍 Final Thoughts

This project allowed me to combine AI-assisted velocity with principled software engineering. I treated AI agents as intelligent collaborators—not code generators—and curated each output with the same scrutiny I’d apply to peer-reviewed contributions.

That mindset ensured regulatory accuracy, test coverage, and long-term maintainability — all while accelerating delivery.
