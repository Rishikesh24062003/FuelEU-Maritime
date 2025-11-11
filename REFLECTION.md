### **Reflection — Building the FuelEU Maritime Compliance System with AI Agents**

This project gave me hands-on experience solving a real maritime industry problem—calculating FuelEU compliance balance, banking surplus emissions, and pooling ships based on competition rules. I approached the assignment with an engineering mindset: clear architecture, well-defined stages, continuous testing, and quality checkpoints. AI agents acted as accelerators, not replacements for reasoning.

---

## **What I Learned**

This project showed me that good software depends on clarity—both in architecture and communication.

1. **Structured problem solving matters.**
   Breaking the project into phases (domain → persistence → API → UI → documentation) enabled predictable progress and eliminated rework.

2. **Prompt engineering is a skill.**
   I learned to give AI agents *constraints*, not vague tasks: hexagonal architecture, pure functions in the core, ports & adapters, transactional operations, etc. Good prompts produced consistently high-quality code.

3. **Validation is my responsibility.**
   Agents can generate code quickly, but correctness requires engineering discipline. I used:

   * Unit tests (65 tests covering business logic)
   * Integration tests (database + API)
   * Strict TypeScript + Prisma schema verification

   The business logic did not change across phases because the core was well-tested.

---

## **Efficiency Gains Compared to Manual Development**

Work that normally takes days—project scaffolding, repetitive CRUD code, React component wiring—was generated in minutes.
This allowed me to focus on **high-value decisions**, such as:

* designing the greedy pool allocation logic,
* ensuring compliance rules match FuelEU regulations,
* protecting transactional integrity for banking/applying balances.

The agent handled mechanics; I handled correctness.

| Task                             | Manual time    | With AI Agents          |
| -------------------------------- | -------------- | ----------------------- |
| Project scaffolding              | 6–8 hours      | 15 minutes              |
| UI component boilerplate         | 1.5–2 days     | 45 minutes              |
| Documentation drafts             | 4–6 hours      | 30 minutes              |
| Core business logic & validation | 100% human-led | 100% preserved accuracy |

This amplified my output, not reduced my involvement.

---

## **Improvements I Would Make in Future Iterations**

1. **Automated E2E flow** using Playwright/Cypress to validate UI ↔ backend interactions.
2. **Docker-first environment** so new contributors run the entire system with one command.
3. **Better observability** (logging correlation IDs, tracing DB queries).
4. **User authentication and RBAC** to secure production deployments.
5. **Internal agent workflow library** so teams can reuse proven prompting patterns.

---

## **Final Thoughts**

AI accelerated development, but testing, architecture, and product decisions required engineering judgment.
The project reinforced that:

> *AI is a powerful multiplier—when guided by clear thinking, accountability, and ownership.*

I treated the agent as a junior developer and myself as the responsible engineer.
That mindset ensured a production-ready, test-covered, maintainable codebase.
