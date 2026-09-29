import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BankService } from '../../services/bank.service';

@Component({
  selector: 'app-account-summary',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="summary-grid" *ngIf="bankService.account() as account">
      <!-- Balance Card -->
      <div class="card stat-card balance-card">
        <div class="card-header">
          <span class="card-icon">💰</span>
          <span class="card-label">Current Balance</span>
        </div>
        <div class="card-value font-mono highlight-green">
          {{ account.balance | currency:'USD':'symbol':'1.2-2' }}
        </div>
        <div class="card-footer">
          <span class="badge badge-success">Live Account Balance</span>
        </div>
      </div>

      <!-- Transaction Count Card -->
      <div class="card stat-card tx-count-card">
        <div class="card-header">
          <span class="card-icon">📊</span>
          <span class="card-label">Total Transactions</span>
        </div>
        <div class="card-value font-mono highlight-blue">
          {{ account.total_transactions }}
        </div>
        <div class="card-footer">
          <span class="badge badge-info">Logged Activity Count</span>
        </div>
      </div>

      <!-- Account Info Card -->
      <div class="card stat-card info-card">
        <div class="card-header">
          <span class="card-icon">🏦</span>
          <span class="card-label">Account Details</span>
        </div>
        <div class="info-body">
          <div class="info-row">
            <span class="info-key">Account Holder:</span>
            <span class="info-val">{{ account.account_holder }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">Account Number:</span>
            <span class="info-val font-mono">{{ account.account_number }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">Default APR:</span>
            <span class="info-val font-mono badge badge-amber">{{ (account.annual_interest_rate * 100) | number:'1.2-2' }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .card-icon {
      font-size: 1.25rem;
    }

    .card-value {
      font-size: 2.25rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 0.75rem;
    }

    .highlight-green {
      color: #059669;
    }

    .highlight-blue {
      color: #2563eb;
    }

    .card-footer {
      display: flex;
      align-items: center;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
    }

    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .badge-amber {
      background-color: #fef3c7;
      color: #92400e;
    }

    .info-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.925rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.25rem;
      border-bottom: 1px dashed #f3f4f6;
    }

    .info-key {
      color: #6b7280;
    }

    .info-val {
      font-weight: 600;
      color: #111827;
    }

    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
  `]
})
export class AccountSummaryComponent {
  public bankService = inject(BankService);
}
