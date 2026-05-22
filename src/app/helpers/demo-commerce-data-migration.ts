export interface DemoDiscountCode {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxRedemptions: number;
  redeemedCount: number;
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'inactive' | 'expired';
  isActive: boolean;
  appliesTo: string;
}

export interface DemoRewardAccount {
  id: number;
  customerName: string;
  email: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'inactive';
  lastActivity: string;
  notes?: string;
}

const DISCOUNT_KEYS = [
  'discountCodes',
  'rent-a-car-demo-discount-codes',
  'rentalDiscountCodes',
  'discounts'
];

const REWARD_KEYS = [
  'rewardAccounts',
  'rent-a-car-demo-reward-accounts',
  'rent-a-car-demo-rewards',
  'rewards',
  'customerRewards'
];

const DEFAULT_DISCOUNT_CODES: DemoDiscountCode[] = [
  {
    id: 1,
    code: 'WELCOME10',
    description: '10% off first demo booking',
    discountType: 'percentage',
    value: 10,
    minSpend: 75,
    maxRedemptions: 250,
    redeemedCount: 0,
    startsAt: '2026-01-01',
    expiresAt: '2026-12-31',
    status: 'active',
    isActive: true,
    appliesTo: 'All vehicles'
  },
  {
    id: 2,
    code: 'AIRPORT25',
    description: '£25 off airport pickup bookings',
    discountType: 'fixed',
    value: 25,
    minSpend: 150,
    maxRedemptions: 150,
    redeemedCount: 0,
    startsAt: '2026-01-01',
    expiresAt: '2026-12-31',
    status: 'active',
    isActive: true,
    appliesTo: 'Airport and location pickup'
  },
  {
    id: 3,
    code: 'WEEKEND15',
    description: '15% off weekend rental demos',
    discountType: 'percentage',
    value: 15,
    minSpend: 120,
    maxRedemptions: 100,
    redeemedCount: 0,
    startsAt: '2026-01-01',
    expiresAt: '2026-12-31',
    status: 'active',
    isActive: true,
    appliesTo: 'Weekend rentals'
  }
];

const DEFAULT_REWARD_ACCOUNTS: DemoRewardAccount[] = [
  {
    id: 1,
    customerName: 'John Doe',
    email: 'john@example.com',
    pointsBalance: 2400,
    lifetimePoints: 7800,
    tier: 'Gold',
    status: 'active',
    lastActivity: '2026-05-21',
    notes: 'Demo customer account used by the local booking flow.'
  },
  {
    id: 2,
    customerName: 'Demo User',
    email: 'demo@example.com',
    pointsBalance: 850,
    lifetimePoints: 1850,
    tier: 'Silver',
    status: 'active',
    lastActivity: '2026-05-21',
    notes: 'Fallback demo rewards account.'
  }
];

export function restoreDemoCommerceData(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  restoreKeyGroup<DemoDiscountCode>(DISCOUNT_KEYS, DEFAULT_DISCOUNT_CODES);
  restoreKeyGroup<DemoRewardAccount>(REWARD_KEYS, DEFAULT_REWARD_ACCOUNTS);

  localStorage.setItem('demoCommerceMigrationV1Complete', 'true');
}

function restoreKeyGroup<T>(keys: string[], fallback: T[]): void {
  const existing = firstNonEmptyArray<T>(keys);
  const value = existing.length > 0 ? existing : fallback;

  keys.forEach(key => {
    localStorage.setItem(key, JSON.stringify(value));
  });
}

function firstNonEmptyArray<T>(keys: string[]): T[] {
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
      // Ignore malformed demo data and continue to the next key.
    }
  }

  return [];
}
