import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AccountSummary,
  TransactionResponse,
  DepositRequest,
  WithdrawRequest,
  InterestCalculateRequest,
  InterestCalculationResponse
} from '../models/bank.models';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8008/api/account';

  // Reactive State via Signals
  public account = signal<AccountSummary | null>(null);
  public transactions = signal<TransactionResponse[]>([]);
  public loading = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);
  public interestResult = signal<InterestCalculationResponse | null>(null);

  constructor() {
    this.refreshAllData();
  }

  public refreshAllData(): void {
    this.fetchAccountSummary().subscribe();
    this.fetchTransactions().subscribe();
  }

  public fetchAccountSummary() {
    this.loading.set(true);
    return this.http.get<AccountSummary>(this.baseUrl).pipe(
      tap((data) => {
        this.account.set(data);
        this.loading.set(false);
      }),
      catchError((err) => this.handleError(err))
    );
  }

  public fetchTransactions() {
    return this.http.get<TransactionResponse[]>(`${this.baseUrl}/transactions`).pipe(
      tap((data) => {
        this.transactions.set(data);
      }),
      catchError((err) => this.handleError(err))
    );
  }

  public deposit(amount: number, description?: string) {
    this.loading.set(true);
    this.clearAlerts();
    const payload: DepositRequest = { amount, description };
    return this.http.post<AccountSummary>(`${this.baseUrl}/deposit`, payload).pipe(
      tap((updatedAccount) => {
        this.account.set(updatedAccount);
        this.successMessage.set(`Successfully deposited $${amount.toFixed(2)} to account.`);
        this.loading.set(false);
        this.fetchTransactions().subscribe();
      }),
      catchError((err) => this.handleError(err))
    );
  }

  public withdraw(amount: number, description?: string) {
    this.loading.set(true);
    this.clearAlerts();
    const payload: WithdrawRequest = { amount, description };
    return this.http.post<AccountSummary>(`${this.baseUrl}/withdraw`, payload).pipe(
      tap((updatedAccount) => {
        this.account.set(updatedAccount);
        this.successMessage.set(`Successfully withdrew $${amount.toFixed(2)} from account.`);
        this.loading.set(false);
        this.fetchTransactions().subscribe();
      }),
      catchError((err) => this.handleError(err))
    );
  }

  public calculateInterest(annualRate: number | undefined, periodDays: number, applyToAccount: boolean) {
    this.loading.set(true);
    this.clearAlerts();
    const payload: InterestCalculateRequest = {
      annual_rate: annualRate,
      period_days: periodDays,
      apply_to_account: applyToAccount
    };
    return this.http.post<InterestCalculationResponse>(`${this.baseUrl}/calculate-interest`, payload).pipe(
      tap((res) => {
        this.interestResult.set(res);
        this.loading.set(false);
        if (applyToAccount) {
          this.successMessage.set(
            `Interest of $${res.calculated_interest.toFixed(2)} credited to account balance for ${periodDays} days!`
          );
          this.fetchAccountSummary().subscribe();
          this.fetchTransactions().subscribe();
        } else {
          this.successMessage.set(
            `Calculated interest projection: $${res.calculated_interest.toFixed(2)} over ${periodDays} days.`
          );
        }
      }),
      catchError((err) => this.handleError(err))
    );
  }

  public resetAccount() {
    this.loading.set(true);
    this.clearAlerts();
    return this.http.post<AccountSummary>(`${this.baseUrl}/reset`, {}).pipe(
      tap((res) => {
        this.account.set(res);
        this.interestResult.set(null);
        this.successMessage.set('Account reset to initial default state ($1,000.00 balance, 0 transactions).');
        this.loading.set(false);
        this.fetchTransactions().subscribe();
      }),
      catchError((err) => this.handleError(err))
    );
  }

  public clearAlerts(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  private handleError(error: HttpErrorResponse) {
    this.loading.set(false);
    let msg = 'An unexpected error occurred.';
    if (error.error && error.error.detail) {
      msg = error.error.detail;
    } else if (error.status === 0) {
      msg = 'Unable to connect to FastAPI backend server. Please make sure backend is running on http://127.0.0.1:8008.';
    } else if (error.message) {
      msg = error.message;
    }
    this.errorMessage.set(msg);
    return throwError(() => new Error(msg));
  }
}
