import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankService } from './services/bank.service';
import { AccountSummaryComponent } from './components/account-summary/account-summary.component';
import { TransactionActionsComponent } from './components/transaction-actions/transaction-actions.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AccountSummaryComponent,
    TransactionActionsComponent,
    TransactionHistoryComponent
  ],
  template: `
    <div class="app-layout">
      <!-- Top Navigation Header -->
      <header class="app-header">
        <div class="container header-container">
          <div class="brand">
            <span class="brand-icon">🏦</span>
            <div class="brand-text">
              <h1 class="brand-title">Apex Bank Account Simulator</h1>
              <span class="brand-subtitle">FastAPI Python Backend & Angular Frontend</span>
            </div>
          </div>
          <div class="header-actions">
            <button 
              (click)="onReset()" 
              [disabled]="bankService.loading()"
              class="btn-reset"
              title="Reset account data to default initial state">
              🔄 Reset Demo Account
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="main-content">
        <div class="container">

          <!-- Global Notifications & Alerts -->
          <div *ngIf="bankService.successMessage() as successMsg" class="alert alert-success">
            <span>✅ {{ successMsg }}</span>
            <button (click)="bankService.clearAlerts()" class="close-alert">&times;</button>
          </div>

          <div *ngIf="bankService.errorMessage() as errorMsg" class="alert alert-danger">
            <span>⚠️ {{ errorMsg }}</span>
            <button (click)="bankService.clearAlerts()" class="close-alert">&times;</button>
          </div>

          <!-- Section 1: Account Metrics (Balance & Transaction Count) -->
          <app-account-summary></app-account-summary>

          <!-- Section 2: Financial Operations (Deposit, Withdraw, Calculate Interest) -->
          <app-transaction-actions></app-transaction-actions>

          <!-- Section 3: Historical Transaction Ledger -->
          <app-transaction-history></app-transaction-history>

        </div>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="container footer-content">
          <p>Bank Account Modeling System &bull; Powered by FastAPI & Angular 19/22 &bull; Persistence via SQLite</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      min-height: 100vh;
    }

    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .app-header {
      background: #1e293b;
      color: #ffffff;
      padding: 1.25rem 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .brand-icon {
      font-size: 2.25rem;
    }

    .brand-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .brand-subtitle {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .btn-reset {
      background: #334155;
      color: #f8fafc;
      border: 1px solid #475569;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-reset:hover:not(:disabled) {
      background: #475569;
    }

    .main-content {
      flex: 1;
      padding: 2rem 0 3rem 0;
    }

    .alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .alert-success {
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }

    .alert-danger {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .close-alert {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: inherit;
    }

    .app-footer {
      background: #e2e8f0;
      color: #64748b;
      padding: 1.25rem 0;
      text-align: center;
      font-size: 0.825rem;
    }

    .footer-content p {
      margin: 0;
    }
  `]
})
export class AppComponent {
  public bankService = inject(BankService);

  onReset() {
    if (confirm('Are you sure you want to reset the account back to the default state ($1,000 balance, 0 transactions)?')) {
      this.bankService.resetAccount().subscribe();
    }
  }
}
