# AI Agent Workflow Log

## Agents Used
- **Cursor AI Agent** (core build automation, file generation, backend/frontend)
- **Windsurf Agent** (refinements, prompt chaining, code verification)
- **Copilot** (inline completions, boilerplate suggestions)
- **Claude Code** (code optimization and formatting)

---

## Prompts & Outputs

### Example 1: Core Calculation Module

**Prompt:**
> Implement a FuelEU GHG calculation module in TypeScript. Must follow FuelEU Annex II and IV. Include functions for calcEnergyMJ, calcGHGIntensity, calcComplianceBalance. Use constants like 41000 MJ/t and targetIntensity 89.3368.

**Agent Output:**
Generated a full `calculationService.ts` with proper functions and typings. Used default emission constants but skipped slip factor.

**Correction:** I added missing CH₄/N₂O GWP constants (25, 298) and applied slip correction. Also adjusted units to gCO₂e properly.

---

### Example 2: Prisma Schema Generation

**Prompt:**
> Create Prisma schema for Route, ShipCompliance, BankEntry, Pool, PoolMember based on provided assignment fields and relationships.

**Agent Output:**
Correctly generated model fields, types, defaults, and relationships (e.g., PoolMember → Pool with foreign key). Minor issues in naming conventions.

**Correction:** Renamed some fields for clarity (`cb_before`, `cb_after`) and added createdAt timestamps manually.

---

## Validation / Corrections

- Ran all agent-generated TypeScript through `tsc --strict`
- Added unit tests for all core calculations
- Used Supertest to verify API responses match schema
- Added integration tests with seeded data
- Reused constants from assignment PDF (fuel LCV, WtT, Cf, GWP) manually to verify accuracy
- Used Recharts for frontend graphing (manually installed and configured based on agent suggestion)

---

## Observations

### ✅ Where agent saved time:
- Bootstrapped full backend structure in minutes (folder layout, TypeScript config)
- Generated Prisma schema and DB migration setup
- Created baseline React frontend with Tailwind and routing
- Provided test file scaffolds (with minor adjustments needed)

### ⚠️ Where agent failed or needed corrections:
- Omitted GWP multipliers in CH₄/N₂O calculation
- Generated Express routes without schema validation
- Pooling logic missed one constraint (sum CB must remain ≥ 0)
- Frontend state management had missing state resets after actions

### 🔀 Tool Combination Strategy:
- Cursor for step-by-step file generation and API routes
- Claude for formatting, refactoring services into reusable modules
- Copilot for autocompleting smaller repetitive functions (e.g., form inputs, hooks)

---

## Best Practices Followed

- Used Cursor’s `tasks.md` to track generation across backend/frontend
- Created reusable constants table for fuels/emissions
- All functions unit-tested with Jest
- Applied “strict hexagonal architecture” — core modules remain decoupled from adapters
- Created commit history reflecting each Cursor phase output
