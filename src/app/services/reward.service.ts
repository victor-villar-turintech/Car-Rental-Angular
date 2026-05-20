import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { RewardAccount, RewardTransaction, RewardTransactionType } from '../models/reward';
import { CustomerActivityService } from './customer-activity.service';

@Injectable({ providedIn: 'root' })
export class RewardService {
  private readonly accountsKey = 'rent-a-car-demo-reward-accounts';
  private readonly transactionsKey = 'rent-a-car-demo-reward-transactions';
  private accounts: RewardAccount[] = this.loadAccounts();
  private transactions: RewardTransaction[] = this.loadTransactions();

  constructor(private customerActivityService: CustomerActivityService) {}

  getAccounts(): Observable<ListResponseModel<RewardAccount>> {
    return of({ success: true, message: 'Reward accounts loaded.', data: this.accounts });
  }

  getAccount(email: string): RewardAccount {
    return this.ensureAccount(email);
  }

  getTransactions(email?: string): Observable<ListResponseModel<RewardTransaction>> {
    const normalised = email ? this.normalise(email) : undefined;
    const data = normalised ? this.transactions.filter((item) => this.normalise(item.customerEmail) === normalised) : this.transactions;
    return of({ success: true, message: 'Reward transactions loaded.', data });
  }

  earnForBooking(email: string, bookingReference: string, amount: number): void {
    if (!email || !amount) { return; }
    const basePoints = Math.floor(Number(amount || 0));
    const existingPaidBookings = this.transactions.filter((item) => this.normalise(item.customerEmail) === this.normalise(email) && item.type === 'Earned').length;
    const bonus = existingPaidBookings === 0 ? 100 : 0;
    this.addTransaction(email, 'Earned', basePoints + bonus, `Earned ${basePoints + bonus} points for paid booking ${bookingReference}.`, bookingReference);
  }

  reverseForBooking(email: string, bookingReference: string): void {
    const earned = this.transactions.filter((item) => this.normalise(item.customerEmail) === this.normalise(email) && item.bookingReference === bookingReference && item.type === 'Earned').reduce((sum, item) => sum + item.points, 0);
    if (earned > 0) {
      this.addTransaction(email, 'Reversed', -earned, `Reversed ${earned} points after cancellation/refund for ${bookingReference}.`, bookingReference);
    }
  }

  adjustPoints(email: string, points: number, message: string): Observable<ResponseModel> {
    if (!email || !points) {
      return of({ success: false, message: 'Email and points are required.' });
    }
    this.addTransaction(email, 'Adjusted', Number(points), message || 'Manual admin reward adjustment.');
    return of({ success: true, message: 'Reward points updated.' });
  }

  redeemPoints(email: string, points: number, bookingReference?: string): { success: boolean; message: string; discountAmount: number } {
    const account = this.ensureAccount(email);
    const requested = Number(points || 0);
    if (!requested || requested < 500) {
      return { success: false, message: 'Minimum redemption is 500 points.', discountAmount: 0 };
    }
    if (account.pointsBalance < requested) {
      return { success: false, message: 'Not enough reward points.', discountAmount: 0 };
    }
    const discountAmount = Math.floor(requested / 500) * 10;
    this.addTransaction(email, 'Redeemed', -requested, `Redeemed ${requested} points for £${discountAmount} discount.`, bookingReference);
    return { success: true, message: `Applied £${discountAmount} reward discount.`, discountAmount };
  }

  private addTransaction(email: string, type: RewardTransactionType, points: number, message: string, bookingReference?: string): void {
    const normalised = this.normalise(email);
    const transaction: RewardTransaction = {
      transactionId: Math.max(...this.transactions.map((item) => item.transactionId || 0), 0) + 1,
      customerEmail: normalised,
      type,
      points,
      bookingReference,
      message,
      createdAt: new Date().toISOString(),
    };
    this.transactions = [transaction, ...this.transactions];
    const account = this.ensureAccount(normalised);
    const nextBalance = Math.max(0, account.pointsBalance + points);
    const lifetimeEarned = account.lifetimeEarned + (points > 0 ? points : 0);
    const lifetimeRedeemed = account.lifetimeRedeemed + (type === 'Redeemed' ? Math.abs(points) : 0);
    this.accounts = this.accounts.map((item) => this.normalise(item.customerEmail) === normalised ? { ...item, pointsBalance: nextBalance, lifetimeEarned, lifetimeRedeemed, updatedAt: new Date().toISOString() } : item);
    this.save();
    this.customerActivityService.record(normalised, points >= 0 ? 'RewardsEarned' : 'RewardsRedeemed', message, { entityReference: bookingReference, metadata: { points } });
  }

  private ensureAccount(email: string): RewardAccount {
    const normalised = this.normalise(email);
    let account = this.accounts.find((item) => this.normalise(item.customerEmail) === normalised);
    if (!account) {
      account = { customerEmail: normalised, pointsBalance: 0, lifetimeEarned: 0, lifetimeRedeemed: 0, updatedAt: new Date().toISOString() };
      this.accounts = [...this.accounts, account];
      this.save();
    }
    return account;
  }

  private loadAccounts(): RewardAccount[] {
    return this.parse(this.accountsKey);
  }

  private loadTransactions(): RewardTransaction[] {
    return this.parse(this.transactionsKey);
  }

  private parse<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) { return []; }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  private save(): void {
    localStorage.setItem(this.accountsKey, JSON.stringify(this.accounts));
    localStorage.setItem(this.transactionsKey, JSON.stringify(this.transactions));
  }

  private normalise(value: string): string {
    return (value || '').trim().toLowerCase();
  }
}
