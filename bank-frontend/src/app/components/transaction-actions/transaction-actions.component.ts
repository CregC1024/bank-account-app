import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankService } from '../../services/bank.service';

@Component({
  selector: 'app-transaction-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="actions-card">
      <div class="tabs-header">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'deposit'"
          (click)="activeTab = 'deposit'">
          📥 Deposit
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'withdraw'"
          (click)="activeTab = 'withdraw'">
          📤 Withdraw
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'interest'"
          (click)="activeTab = 'interest'">
          📈 Calculate Interest
        </button>
      </div>

      <div class="tab-content">
        <!-- Deposit Tab -->
        <div *ngIf="activeTab === 'deposit'" class="action-form">
          <h3>Make a Deposit</h3>
          <p class="form-desc">Add funds to your account. Current balance will immediately increase and a new transaction will be logged.</p>
          
          <div class="form-group">
            <label>Deposit Amount ($)</label>
            <input 
              type="number" 
              [(ngModel)]="depositAmount" 
              placeholder="e.g. 500.00" 
              min="0.01" 
              step="0.01"
              class="form-control font-mono">
          </div>

          <div class="form-group">
            <label>Description (Optional)</label>
            <input 
              type="text" 
              [(ngModel)]="depositDesc" 
              placeholder="e.g. Salary, Dividend, Transfer" 
              class="form-control">
          </div>

          <button 
            (click)="onDeposit()" 
            [disabled]="!depositAmount || depositAmount <= 0 || bankService.loading()"
            class="btn btn-primary">
            Submit Deposit
          </button>
        </div>

        <!-- Withdraw Tab -->
        <div *ngIf="activeTab === 'withdraw'" class="action-form">
          <h3>Take a Withdrawal</h3>
          <p class="form-desc">Withdraw money from your account. Automatic overdraft validation prevents withdrawing more than your available balance.</p>

          <div class="form-group">
            <label>Withdrawal Amount ($)</label>
            <input 
              type="number" 
              [(ngModel)]="withdrawAmount" 
              placeholder="e.g. 150.00" 
              min="0.01" 
              step="0.01"
              class="form-control font-mono">
          </div>

          <div class="form-group">
            <label>Description (Optional)</label>
            <input 
              type="text" 
              [(ngModel)]="withdrawDesc" 
              placeholder="e.g. Bill payment, ATM" 
              class="form-control">
          </div>

          <button 
            (click)="onWithdraw()" 
            [disabled]="!withdrawAmount || withdrawAmount <= 0 || bankService.loading()"
            class="btn btn-danger">
            Submit Withdrawal
          </button>
        </div>

        <!-- Interest Tab -->
        <div *ngIf="activeTab === 'interest'" class="action-form">
          <h3>Calculate Interest for Period</h3>
          <p class="form-desc">Calculate interest accrued over a time period (Interest = Balance &times; Rate &times; Days / 365). You can preview results or credit interest directly to your balance.</p>

          <div class="form-grid-2">
            <div class="form-group">
              <label>Annual Interest Rate (%)</label>
              <input 
                type="number" 
                [(ngModel)]="interestRate" 
                placeholder="5.0" 
                min="0" 
                step="0.1"
                class="form-control font-mono">
            </div>

            <div class="form-group">
              <label>Period (Days)</label>
              <input 
                type="number" 
                [(ngModel)]="periodDays" 
                placeholder="365" 
                min="1" 
                class="form-control font-mono">
            </div>
          </div>

          <div class="form-buttons">
            <button 
              (click)="onCalculateInterest(false)" 
              [disabled]="periodDays <= 0 || bankService.loading()"
              class="btn btn-secondary">
              🔍 Preview Interest
            </button>
            <button 
              (click)="onCalculateInterest(true)" 
              [disabled]="periodDays <= 0 || bankService.loading()"
              class="btn btn-success">
              💰 Credit Interest to Account
            </button>
          </div>

          <!-- Interest Calculation Results -->
          <div *ngIf="bankService.interestResult() as res" class="result-box mt-4">
            <h4>Calculation Summary:</h4>
            <div class="result-grid">
              <div><span>Principal:</span> <strong>{{ res.principal | currency }}</strong></div>
              <div><span>Rate (APR):</span> <strong>{{ res.annual_rate * 100 | number:'1.2-2' }}%</strong></div>
              <div><span>Period:</span> <strong>{{ res.period_days }} days</strong></div>
              <div><span>Interest Amount:</span> <strong class="text-green">+{{ res.calculated_interest | currency }}</strong></div>
              <div><span>Projected Balance:</span> <strong>{{ res.projected_balance | currency }}</strong></div>
              <div><span>Status:</span> <span class="badge" [class.badge-success]="res.applied" [class.badge-secondary]="!res.applied">{{ res.applied ? 'Credited to Balance' : 'Preview Mode' }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .actions-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      margin-bottom: 2rem;
    }

    .tabs-header {
      display: flex;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .tab-btn {
      flex: 1;
      padding: 1rem 1.25rem;
      border: none;
      background: transparent;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }

    .tab-btn:hover {
      color: #111827;
      background: #f3f4f6;
    }

    .tab-btn.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
      background: #ffffff;
    }

    .tab-content {
      padding: 1.5rem;
    }

    .action-form h3 {
      margin-top: 0;
      margin-bottom: 0.35rem;
      font-size: 1.25rem;
      color: #111827;
    }

    .form-desc {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.4rem;
    }

    .form-control {
      width: 100%;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.65rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.2s, opacity 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary { background: #2563eb; color: #ffffff; }
    .btn-primary:hover:not(:disabled) { background: #1d4ed8; }

    .btn-danger { background: #dc2626; color: #ffffff; }
    .btn-danger:hover:not(:disabled) { background: #b91c1c; }

    .btn-secondary { background: #4b5563; color: #ffffff; }
    .btn-secondary:hover:not(:disabled) { background: #374151; }

    .btn-success { background: #059669; color: #ffffff; }
    .btn-success:hover:not(:disabled) { background: #047857; }

    .result-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 1rem;
    }

    .result-box h4 {
      margin: 0 0 0.5rem 0;
      color: #166534;
      font-size: 0.95rem;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
      font-size: 0.875rem;
    }

    .text-green { color: #059669; }
    .mt-4 { margin-top: 1rem; }
    .font-mono { font-family: ui-monospace, monospace; }

    .badge {
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-secondary { background: #e5e7eb; color: #374151; }
  `]
})
export class TransactionActionsComponent {
  public bankService = inject(BankService);

  public activeTab: 'deposit' | 'withdraw' | 'interest' = 'deposit';

  public depositAmount: number | null = null;
  public depositDesc: string = '';

  public withdrawAmount: number | null = null;
  public withdrawDesc: string = '';

  public interestRate: number = 5.0;
  public periodDays: number = 365;

  onDeposit() {
    if (this.depositAmount && this.depositAmount > 0) {
      this.bankService.deposit(this.depositAmount, this.depositDesc || 'Deposit').subscribe({
        next: () => {
          this.depositAmount = null;
          this.depositDesc = '';
        }
      });
    }
  }

  onWithdraw() {
    if (this.withdrawAmount && this.withdrawAmount > 0) {
      this.bankService.withdraw(this.withdrawAmount, this.withdrawDesc || 'Withdrawal').subscribe({
        next: () => {
          this.withdrawAmount = null;
          this.withdrawDesc = '';
        }
      });
    }
  }

  onCalculateInterest(apply: boolean) {
    if (this.periodDays > 0) {
      this.bankService.calculateInterest(this.interestRate, this.periodDays, apply).subscribe();
    }
  }
}
