from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field, ConfigDict
from database import Base

# SQLAlchemy Models
class BankAccountDB(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, unique=True, index=True, default="ACC-1001")
    account_holder = Column(String, default="Standard User")
    balance = Column(Float, default=0.0)
    total_transactions = Column(Integer, default=0)
    annual_interest_rate = Column(Float, default=0.05)  # 5.0%

    transactions = relationship("TransactionDB", back_populates="account", cascade="all, delete-orphan")


class TransactionDB(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("bank_accounts.id"))
    transaction_type = Column(String)  # DEPOSIT, WITHDRAWAL, INTEREST
    amount = Column(Float)
    balance_after = Column(Float)
    description = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    account = relationship("BankAccountDB", back_populates="transactions")


# Pydantic Schemas
class AccountSummary(BaseModel):
    account_number: str
    account_holder: str
    balance: float
    total_transactions: int
    annual_interest_rate: float

    model_config = ConfigDict(from_attributes=True)


class TransactionResponse(BaseModel):
    id: int
    transaction_type: str
    amount: float
    balance_after: float
    description: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class DepositRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to deposit, must be greater than zero")
    description: Optional[str] = "Deposit"


class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to withdraw, must be greater than zero")
    description: Optional[str] = "Withdrawal"


class InterestCalculateRequest(BaseModel):
    annual_rate: Optional[float] = Field(None, ge=0, description="Annual interest rate percentage (e.g. 5.0 for 5%)")
    period_days: int = Field(365, gt=0, description="Period in days to calculate interest for")
    apply_to_account: bool = Field(False, description="Whether to credit calculated interest directly into account balance")


class InterestCalculationResponse(BaseModel):
    principal: float
    annual_rate: float
    period_days: int
    calculated_interest: float
    projected_balance: float
    applied: bool
    current_balance: float
    total_transactions: int
