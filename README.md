# 🚢 FuelEU Maritime Compliance App

A full-stack web application to calculate and monitor GHG compliance metrics for maritime routes, in full alignment with [FuelEU Maritime Regulation (EU) 2023/1805](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1805).

---

## 🌐 Features

* Add and manage ship routes with GHG metrics
* Automatically compute GHG intensity (`gCO₂e/MJ`)
* Set and switch the regulatory baseline route
* Compare route emissions and assess compliance
* Compute **Compliance Balance (CB)** per year
* Bank surplus credits and transfer them across ships
* Form **emissions pools** to manage fleet-level compliance

---

## 🏗️ Architecture

Strict Hexagonal Architecture — core business logic is fully decoupled from framework and infrastructure:

```
backend/
├── core/          # GHG formulas, domain logic
├── ports/         # Interfaces (repositories, services)
├── adapters/
│   ├── inbound/   # Express controllers and routes
│   └── outbound/  # Prisma (PostgreSQL) database adapters
```

Frontend (Vite + React + Tailwind):

```
frontend/
├── pages/         # Tabbed pages: Routes, Compare, Banking, Pooling
├── components/    # Tables, forms, input fields
├── adapters/      # API hooks and fetch clients
└── utils/         # Shared GHG computation helpers
```

---

## ⚙️ Setup

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

> Add a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fuel_eu
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ✅ API Overview

| Method | Endpoint                   | Description                          |
| ------ | -------------------------- | ------------------------------------ |
| GET    | `/routes`                  | List all ship routes                 |
| POST   | `/routes`                  | Add new route (auto-calculates GHG)  |
| POST   | `/routes/:id/baseline`     | Set route as regulatory baseline     |
| GET    | `/routes/comparison`       | Compare all routes to baseline       |
| GET    | `/compliance/cb?year=2024` | Get CB for all ships (year-filtered) |
| POST   | `/banking/bank`            | Bank surplus emissions               |
| POST   | `/banking/apply`           | Transfer CB to another ship          |
| POST   | `/pools`                   | Form a GHG emissions pooling group   |

---

## 📐 Key FuelEU Formulas

* **GHG Intensity:**
  `GHG_Intensity = f_wind × (WtT + TtW)`

* **Energy [MJ]:**
  `Energy = fuelConsumption_tonnes × 41,000`

* **Compliance Balance (CB):**
  `CB = (Target - Actual) × Energy`

* **Percent Difference:**
  `((comparison / baseline) - 1) × 100`

> **Target GHG Intensity (2025): 89.3368 gCO₂e/MJ**
> (As per Regulation Annex IV Article 4(2))

---

## 📸 Screenshots

<img width="1440" height="777" alt="Screenshot 2025-11-12 at 12 35 05 AM" src="https://github.com/user-attachments/assets/c6bdd113-8fa0-47a4-859f-b20537f8cac3" />


* **Routes Page** – Add new routes and set baseline
* **Comparison Page** – View intensity diffs and compliance status
* **Banking Panel** – Manage surplus and transfer
* **Pooling UI** – Balance compliance across a fleet

---

## 🧪 Testing

### Backend

```bash
cd backend
npm run test
```

* Core calculation tests (Jest)
* API integration tests (Supertest)
* Validated using seeded DB records

### Frontend

```bash
cd frontend
npm run test
```

* Component rendering tests (React Testing Library)
* Interaction + form logic
* Mocked API validation

---

## ✍️ Author

Built with the support of advanced AI agents:

* **Cursor** – file scaffolding, route automation
* **Windsurf** – architecture compliance & refinements
* **Copilot** – boilerplate suggestions
* **Claude Code** – function refactoring and formatting

This project demonstrates a production-ready FuelEU Maritime compliance platform built using modern frameworks and AI-driven development techniques — backed by domain-accurate emissions computation logic.
