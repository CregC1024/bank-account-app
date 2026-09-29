# 🏦 Bank Account Simulator (FastAPI + Angular)

A full-stack bank account simulation web application built with **Angular** on the frontend and **Python FastAPI** on the backend, backed by **SQLite** for persistent storage.

![Bank Account Simulator](https://img.shields.shields.io/badge/Angular-19%2F22-dd0031?logo=angular)
![FastAPI](https://img.shields.shields.io/badge/FastAPI-0.141-009688?logo=fastapi)
![Python](https://img.shields.shields.io/badge/Python-3.14-3776ab?logo=python)
![SQLite](https://img.shields.shields.io/badge/SQLite-Database-003b57?logo=sqlite)

---

## 🚀 Features

- **Save Account Balance**: Real-time balance persistence in SQLite.
- **Save Transaction Count**: Automatic tracking and counting of all account operations.
- **Deposits**: Deposit money with description logging and balance updates.
- **Withdrawals**: Take withdrawals with automatic overdraft protection validation.
- **Interest Calculation**: Calculate periodic interest ($I = P \times r \times \frac{t}{365}$) with options to preview or credit interest directly to the account balance.
- **Real-Time Reporting**: Instant dashboard metrics and detailed historical transaction ledger.

---

## 📁 Repository Architecture

```
bank-account-app/
├── backend/
│   ├── main.py              # FastAPI server & route handlers
│   ├── bank_account.py      # Banking business logic
│   ├── models.py            # SQLAlchemy & Pydantic models
│   ├── database.py          # SQLite connection manager
│   ├── test_backend.py      # Pytest automated test suite
│   └── requirements.txt     # Python backend dependencies
└── bank-frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── account-summary/     # Balance & transaction count cards
    │   │   │   ├── transaction-actions/ # Deposit, Withdraw, Interest forms
    │   │   │   └── transaction-history/ # Transaction ledger table
    │   │   ├── services/
    │   │   │   └── bank.service.ts     # Angular Signals & HttpClient service
    │   │   └── models/
    │   │       └── bank.models.ts      # TypeScript interfaces
    └── package.json
```

---

## 🛠️ Quick Start

### 1. Run Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8008
```

Interactive API documentation available at: `http://127.0.0.1:8008/docs`

### 2. Run Frontend (Angular)

```bash
cd bank-frontend
npm install
npx ng serve --port 4205
```

Open application dashboard at: `http://localhost:4205`

---

## 🧪 Testing

Run backend pytest suite:

```bash
cd backend
source venv/bin/activate
pytest -v
```

---

## 📄 License

MIT License
