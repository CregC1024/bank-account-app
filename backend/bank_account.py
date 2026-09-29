from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models import BankAccountDB, TransactionDB
from datetime import datetime, timezone


def get_or_create_account(db: Session) -> BankAccountDB:
    account = db.query(BankAccountDB).first()
    if not account:
        account = BankAccountDB(
            account_number="ACC-1001",
            account_holder="Primary Account Holder",
            balance=1000.00,  # Initial seed balance
            total_transactions=0,
            annual_interest_rate=0.05  # 5%
        )
        db.add(account)
        db.commit()
        db.refresh(account)
    return account


def deposit_funds(db: Session, account: BankAccountDB, amount: float, description: str = "Deposit") -> BankAccountDB:
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit amount must be greater than zero."
        )

    account.balance = round(account.balance + amount, 2)
    account.total_transactions += 1

    transaction = TransactionDB(
        account_id=account.id,
        transaction_type="DEPOSIT",
        amount=round(amount, 2),
        balance_after=account.balance,
        description=description,
        timestamp=datetime.now(timezone.utc)
    )

    db.add(transaction)
    db.commit()
    db.refresh(account)
    return account


def withdraw_funds(db: Session, account: BankAccountDB, amount: float, description: str = "Withdrawal") -> BankAccountDB:
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Withdrawal amount must be greater than zero."
        )

    if amount > account.balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient funds. Current balance is ${account.balance:.2f}."
        )

    account.balance = round(account.balance - amount, 2)
    account.total_transactions += 1

    transaction = TransactionDB(
        account_id=account.id,
        transaction_type="WITHDRAWAL",
        amount=round(amount, 2),
        balance_after=account.balance,
        description=description,
        timestamp=datetime.now(timezone.utc)
    )

    db.add(transaction)
    db.commit()
    db.refresh(account)
    return account


def compute_interest(
    db: Session,
    account: BankAccountDB,
    annual_rate: float = None,
    period_days: int = 365,
    apply_to_account: bool = False
):
    rate = annual_rate if annual_rate is not None else account.annual_interest_rate
    if rate < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interest rate cannot be negative."
        )

    # Simple/compounding interest for period: I = P * r * (days / 365)
    interest_amount = round(account.balance * (rate) * (period_days / 365.0), 2)
    projected_balance = round(account.balance + interest_amount, 2)

    if apply_to_account and interest_amount > 0:
        account.balance = projected_balance
        account.total_transactions += 1

        transaction = TransactionDB(
            account_id=account.id,
            transaction_type="INTEREST",
            amount=interest_amount,
            balance_after=account.balance,
            description=f"Interest Payout ({period_days} days @ {rate*100:.2f}%)",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(transaction)
        db.commit()
        db.refresh(account)

    return {
        "principal": account.balance if not apply_to_account else round(projected_balance - interest_amount, 2),
        "annual_rate": rate,
        "period_days": period_days,
        "calculated_interest": interest_amount,
        "projected_balance": projected_balance,
        "applied": apply_to_account,
        "current_balance": account.balance,
        "total_transactions": account.total_transactions
    }


def reset_account_data(db: Session) -> BankAccountDB:
    db.query(TransactionDB).delete()
    db.query(BankAccountDB).delete()
    db.commit()
    return get_or_create_account(db)
