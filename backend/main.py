from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db
from models import (
    AccountSummary,
    TransactionResponse,
    DepositRequest,
    WithdrawRequest,
    InterestCalculateRequest,
    InterestCalculationResponse,
    TransactionDB
)
import bank_account as service

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bank Account Management API",
    description="API for saving account balance, transaction counts, deposits, withdrawals, and interest calculation.",
    version="1.0.0"
)

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows standard Angular dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/account", response_model=AccountSummary, summary="Report current account balance and transaction count")
def get_account(db: Session = Depends(get_db)):
    """
    Returns current account details including balance and total count of transactions.
    """
    account = service.get_or_create_account(db)
    return account


@app.post("/api/account/deposit", response_model=AccountSummary, summary="Make a deposit to the account")
def deposit(request: DepositRequest, db: Session = Depends(get_db)):
    """
    Deposit funds into the bank account, updates balance, and increments transaction count.
    """
    account = service.get_or_create_account(db)
    updated_account = service.deposit_funds(
        db=db,
        account=account,
        amount=request.amount,
        description=request.description or "Deposit"
    )
    return updated_account


@app.post("/api/account/withdraw", response_model=AccountSummary, summary="Take a withdrawal from the account")
def withdraw(request: WithdrawRequest, db: Session = Depends(get_db)):
    """
    Withdraw funds from the bank account with overdraft protection.
    """
    account = service.get_or_create_account(db)
    updated_account = service.withdraw_funds(
        db=db,
        account=account,
        amount=request.amount,
        description=request.description or "Withdrawal"
    )
    return updated_account


@app.post("/api/account/calculate-interest", response_model=InterestCalculationResponse, summary="Calculate interest for a period")
def calculate_interest(request: InterestCalculateRequest, db: Session = Depends(get_db)):
    """
    Calculate interest for a given period (in days) and rate, with optional payout to balance.
    """
    account = service.get_or_create_account(db)
    # Convert rate percentage (e.g. 5.0 -> 0.05) if provided
    rate_decimal = (request.annual_rate / 100.0) if request.annual_rate is not None else None
    
    result = service.compute_interest(
        db=db,
        account=account,
        annual_rate=rate_decimal,
        period_days=request.period_days,
        apply_to_account=request.apply_to_account
    )
    return result


@app.get("/api/account/transactions", response_model=List[TransactionResponse], summary="Report all transaction records")
def get_transactions(db: Session = Depends(get_db)):
    """
    Retrieve all historical transaction logs ordered by timestamp descending.
    """
    account = service.get_or_create_account(db)
    transactions = db.query(TransactionDB).filter(
        TransactionDB.account_id == account.id
    ).order_by(TransactionDB.timestamp.desc()).all()
    return transactions


@app.post("/api/account/reset", response_model=AccountSummary, summary="Reset account balance and transaction history")
def reset_account(db: Session = Depends(get_db)):
    """
    Resets account to initial state for testing/demo.
    """
    return service.reset_account_data(db)
