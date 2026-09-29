export interface AccountSummary {
  account_number: string;
  account_holder: string;
  balance: number;
  total_transactions: number;
  annual_interest_rate: number;
}

export interface TransactionResponse {
  id: number;
  transaction_type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST';
  amount: number;
  balance_after: number;
  description?: string;
  timestamp: string;
}

export interface DepositRequest {
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
}

export interface InterestCalculateRequest {
  annual_rate?: number;
  period_days: number;
  apply_to_account: boolean;
}

export interface InterestCalculationResponse {
  principal: number;
  annual_rate: number;
  period_days: number;
  calculated_interest: number;
  projected_balance: number;
  applied: boolean;
  current_balance: number;
  total_transactions: number;
}
