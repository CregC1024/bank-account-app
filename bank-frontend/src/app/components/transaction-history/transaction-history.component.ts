import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { BankService } from '../../services/bank.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="history-card">
      <div class="history-header">
        <div>
          <h3>Transaction History Ledger</h3>
          <p class="history-subtitle">Comprehensive record of all deposits, withdrawals, and interest postings.</p>
        </div>
        <button (click)="onRefresh()" class="refresh-btn">
          🔄 Refresh Ledger
        </button>
      </div>

      <div class="table-container">
        <table class="ledger-table">
          <thead>
            <tr>
              <th># ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance After</th>
              <th>Date & Time</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of bankService.transactions()">
              <td class="font-mono text-gray">#{{ tx.id }}</td>
              <td>
                <span 
                  class="badge-type" 
                  [ngClass]="{
                    'badge-deposit': tx.transaction_type === 'DEPOSIT',
                    'badge-withdraw': tx.transaction_type === 'WITHDRAWAL',
                    'badge-interest': tx.transaction_type === 'INTEREST'
                  }">
                  {{ tx.transaction_type }}
                </span>
              </td>
              <td class="font-mono font-bold" [ngClass]="{
                'text-green': tx.transaction_type === 'DEPOSIT' || tx.transaction_type === 'INTEREST',
                'text-red': tx.transaction_type === 'WITHDRAWAL'
              }">
                {{ (tx.transaction_type === 'WITHDRAWAL' ? '-' : '+') }}{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
              </td>
              <td class="font-mono font-bold">{{ tx.balance_after | currency:'USD':'symbol':'1.2-2' }}</td>
              <td class="text-sm text-gray">{{ tx.timestamp | date:'medium' }}</td>
              <td class="text-sm">{{ tx.description || '-' }}</td>
            </tr>

            <tr *ngIf="bankService.transactions().length === 0">
              <td colspan="6" class="empty-state">
                No transactions recorded yet. Perform a deposit or withdrawal above to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .history-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .history-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #111827;
    }

    .history-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .refresh-btn {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 0.5rem 0.875rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      color: #374151;
      cursor: pointer;
      transition: background 0.2s;
    }

    .refresh-btn:hover {
      background: #e5e7eb;
    }

    .table-container {
      overflow-x: auto;
    }

    .ledger-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .ledger-table th {
      background-color: #f9fafb;
      color: #374151;
      font-weight: 600;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid #e5e7eb;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .ledger-table td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid #f3f4f6;
      color: #111827;
    }

    .ledger-table tr:hover {
      background-color: #f9fafb;
    }

    .badge-type {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }

    .badge-deposit {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-withdraw {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-interest {
      background: #fef3c7;
      color: #92400e;
    }

    .text-green { color: #059669; }
    .text-red { color: #dc2626; }
    .text-gray { color: #6b7280; }
    .text-sm { font-size: 0.85rem; }
    .font-mono { font-family: ui-monospace, monospace; }
    .font-bold { font-weight: 700; }

    .empty-state {
      text-align: center;
      padding: 2rem !important;
      color: #9ca3af;
      font-style: italic;
    }
  `]
})
export class TransactionHistoryComponent {
  public bankService = inject(BankService);

  onRefresh() {
    this.bankService.fetchTransactions().subscribe();
  }
}
