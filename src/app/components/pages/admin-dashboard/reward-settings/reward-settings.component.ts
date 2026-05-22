import { Component, OnInit } from '@angular/core';
import { restoreDemoCommerceData } from '../../../../helpers/demo-commerce-data-migration';

interface AdminRewardAccount {
  id: number;
  customerName: string;
  email: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'inactive';
  lastActivity: string;
  notes?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-admin-reward-settings',
  templateUrl: './reward-settings.component.html',
  styleUrls: ['./reward-settings.component.css']
})
export class AdminRewardSettingsComponent implements OnInit {
  readonly storageKeys = [
    'rewardAccounts',
    'rent-a-car-demo-reward-accounts',
    'rent-a-car-demo-rewards',
    'rewards',
    'customerRewards'
  ];

  rewardAccounts: AdminRewardAccount[] = [];
  searchTerm = '';
  statusFilter = 'all';
  tierFilter = 'all';
  sortBy = 'points';

  isFormOpen = false;
  isEditing = false;
  formError = '';
  formSuccess = '';

  rewardForm: AdminRewardAccount = this.createEmptyRewardAccount();

  ngOnInit(): void {
    restoreDemoCommerceData();
    this.loadData();
  }

  loadData(): void {
    this.rewardAccounts = this.readFirstNonEmpty<AdminRewardAccount>(this.storageKeys);
    this.persistRewardAccounts();
  }

  get filteredRewardAccounts(): AdminRewardAccount[] {
    const term = this.normalise(this.searchTerm);

    return this.rewardAccounts
      .filter(account => {
        const matchesStatus = this.statusFilter === 'all' || account.status === this.statusFilter;
        const matchesTier = this.tierFilter === 'all' || account.tier === this.tierFilter;
        const haystack = [
          account.id,
          account.customerName,
          account.email,
          account.pointsBalance,
          account.lifetimePoints,
          account.tier,
          account.status,
          account.notes
        ].join(' ');

        return matchesStatus && matchesTier && this.normalise(haystack).includes(term);
      })
      .sort((a, b) => this.compareRewardAccounts(a, b));
  }

  get activeCount(): number {
    return this.rewardAccounts.filter(account => account.status === 'active').length;
  }

  get inactiveCount(): number {
    return this.rewardAccounts.filter(account => account.status === 'inactive').length;
  }

  get totalOutstandingPoints(): number {
    return this.rewardAccounts.reduce((sum, account) => sum + Number(account.pointsBalance || 0), 0);
  }

  get totalLifetimePoints(): number {
    return this.rewardAccounts.reduce((sum, account) => sum + Number(account.lifetimePoints || 0), 0);
  }

  startAdd(): void {
    this.isFormOpen = true;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.rewardForm = this.createEmptyRewardAccount();
  }

  startEdit(account: AdminRewardAccount): void {
    this.isFormOpen = true;
    this.isEditing = true;
    this.formError = '';
    this.formSuccess = '';
    this.rewardForm = { ...account };
  }

  cancelForm(): void {
    this.isFormOpen = false;
    this.isEditing = false;
    this.formError = '';
    this.formSuccess = '';
    this.rewardForm = this.createEmptyRewardAccount();
  }

  saveRewardAccount(): void {
    this.formError = '';
    this.formSuccess = '';

    const validationError = this.validateForm();
    if (validationError) {
      this.formError = validationError;
      return;
    }

    const form: AdminRewardAccount = {
      ...this.rewardForm,
      customerName: this.rewardForm.customerName.trim(),
      email: this.rewardForm.email.trim().toLowerCase(),
      pointsBalance: Number(this.rewardForm.pointsBalance || 0),
      lifetimePoints: Number(this.rewardForm.lifetimePoints || 0),
      tier: this.rewardForm.tier,
      status: this.rewardForm.status,
      lastActivity: this.rewardForm.lastActivity || new Date().toISOString().slice(0, 10),
      notes: this.rewardForm.notes?.trim() || ''
    };

    if (this.isEditing) {
      this.rewardAccounts = this.rewardAccounts.map(account =>
        Number(account.id) === Number(form.id) ? { ...account, ...form } : account
      );
      this.formSuccess = 'Reward account updated.';
    } else {
      this.rewardAccounts = [
        ...this.rewardAccounts,
        {
          ...form,
          id: this.getNextId(this.rewardAccounts)
        }
      ];
      this.formSuccess = 'Reward account added.';
    }

    this.persistRewardAccounts();
    this.loadData();
    this.cancelForm();
  }

  deactivateRewardAccount(account: AdminRewardAccount): void {
    this.rewardAccounts = this.rewardAccounts.map(item =>
      Number(item.id) === Number(account.id)
        ? { ...item, status: 'inactive' }
        : item
    );
    this.persistRewardAccounts();
    this.loadData();
    this.formSuccess = 'Reward account deactivated.';
  }

  reactivateRewardAccount(account: AdminRewardAccount): void {
    this.rewardAccounts = this.rewardAccounts.map(item =>
      Number(item.id) === Number(account.id)
        ? { ...item, status: 'active' }
        : item
    );
    this.persistRewardAccounts();
    this.loadData();
    this.formSuccess = 'Reward account reactivated.';
  }

  deleteRewardAccount(account: AdminRewardAccount): void {
    if (Number(account.pointsBalance || 0) > 0 || Number(account.lifetimePoints || 0) > 0) {
      this.formError = 'This reward account has point history. Deactivate it instead of deleting it.';
      return;
    }

    const confirmed = window.confirm(`Delete reward account for ${account.customerName} permanently?`);
    if (!confirmed) {
      return;
    }

    this.rewardAccounts = this.rewardAccounts.filter(item => Number(item.id) !== Number(account.id));
    this.persistRewardAccounts();
    this.loadData();
    this.formSuccess = 'Reward account deleted.';
  }

  getRedemptionValue(account: AdminRewardAccount): string {
    const value = Number(account.pointsBalance || 0) / 100;
    return `£${value.toFixed(2)}`;
  }

  private validateForm(): string {
    if (!this.rewardForm.customerName?.trim()) {
      return 'Customer name is required.';
    }

    if (!this.rewardForm.email?.trim()) {
      return 'Customer email is required.';
    }

    if (!/^\S+@\S+\.\S+$/.test(this.rewardForm.email.trim())) {
      return 'A valid customer email is required.';
    }

    const duplicate = this.rewardAccounts.some(account =>
      this.normalise(account.email) === this.normalise(this.rewardForm.email)
      && Number(account.id) !== Number(this.rewardForm.id)
    );

    if (duplicate) {
      return 'A reward account with this email already exists.';
    }

    if (Number(this.rewardForm.pointsBalance || 0) < 0) {
      return 'Points balance cannot be negative.';
    }

    if (Number(this.rewardForm.lifetimePoints || 0) < Number(this.rewardForm.pointsBalance || 0)) {
      return 'Lifetime points cannot be lower than the current points balance.';
    }

    return '';
  }

  private compareRewardAccounts(a: AdminRewardAccount, b: AdminRewardAccount): number {
    switch (this.sortBy) {
      case 'name':
        return a.customerName.localeCompare(b.customerName);
      case 'tier':
        return this.tierRank(b.tier) - this.tierRank(a.tier);
      case 'lifetime':
        return Number(b.lifetimePoints || 0) - Number(a.lifetimePoints || 0);
      case 'activity':
        return String(b.lastActivity || '').localeCompare(String(a.lastActivity || ''));
      case 'points':
      default:
        return Number(b.pointsBalance || 0) - Number(a.pointsBalance || 0);
    }
  }

  private tierRank(tier: string): number {
    const ranks: Record<string, number> = {
      Bronze: 1,
      Silver: 2,
      Gold: 3,
      Platinum: 4
    };

    return ranks[tier] || 0;
  }

  private persistRewardAccounts(): void {
    this.storageKeys.forEach(key => localStorage.setItem(key, JSON.stringify(this.rewardAccounts)));
  }

  private readFirstNonEmpty<T>(keys: string[]): T[] {
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as T[];
        }
      } catch {
        // Ignore malformed demo data.
      }
    }

    return [];
  }

  private createEmptyRewardAccount(): AdminRewardAccount {
    return {
      id: 0,
      customerName: '',
      email: '',
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: 'Bronze',
      status: 'active',
      lastActivity: new Date().toISOString().slice(0, 10),
      notes: ''
    };
  }

  private normalise(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private getNextId(items: Array<{ id?: number }>): number {
    return items.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;
  }
}
