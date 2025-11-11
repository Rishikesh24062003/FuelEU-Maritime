# FuelEU Maritime Compliance App

A full-stack web application to calculate and monitor GHG compliance metrics for ships and shipping routes as per the **FuelEU Maritime regulation**.

---

## 🌐 Features
- Add shipping routes and calculate GHG intensity (gCO₂e/MJ)
- Set a baseline route and compare all others with percentDiff
- Compute compliance balance (CB) for each ship per year
- Bank and transfer GHG surplus credits
- Create emission pools to balance fleet-wide compliance

---

## 🏗️ Architecture

**Hexagonal structure**:

```
core/        <-- FuelEU calculations, pure TS
ports/       <-- interfaces for adapters
adapters/
  inbound/   <-- Express routes
  outbound/  <-- Prisma/PostgreSQL repo
```

Frontend: React + TypeScript + Tailwind  
Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL  
Tested with Jest, Supertest, React Testing Library

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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `.env` in backend:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fuel_eu
```

---

## ✅ API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/routes` | List all ship routes |
| POST   | `/routes` | Add a new route (computes intensity) |
| POST   | `/routes/:id/baseline` | Set selected route as baseline |
| GET    | `/routes/comparison` | Compare routes vs baseline |
| GET    | `/compliance/cb?year=2024` | Compliance balance per route |
| POST   | `/banking/bank` | Bank GHG surplus |
| POST   | `/banking/apply` | Transfer surplus |
| POST   | `/pools` | Form emission pool |

---

## 📐 Key FuelEU Formulas

- `GHG_Intensity = f_wind × (WtT + TtW)`
- `Energy [MJ] = fuelConsumption_tonnes × 41,000 MJ/t`
- `CB [gCO₂e] = (Target - Actual) × Energy`
- `percentDiff = ((comparison / baseline) - 1) × 100`

Target GHG Intensity (2025): **89.3368 gCO₂e/MJ**

---

## 📸 Screenshots

Add actual UI screenshots here (RoutesPage, ComparePage, etc.)

---

## 🧪 Testing

### Backend

```bash
cd backend
npm run test
```

### Frontend

```bash
cd frontend
npm run test
```

---

## ✍️ Author

Built with support from AI agents (Cursor, Windsurf, Copilot, Claude). 
