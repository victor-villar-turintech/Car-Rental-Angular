import { restoreDemoCommerceData, DemoDiscountCode, DemoRewardAccount } from './demo-commerce-data-migration';

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

describe('restoreDemoCommerceData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds default discount codes and rewards when no data exists', () => {
    restoreDemoCommerceData();

    DISCOUNT_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      expect(raw).withContext(`Expected discount key '${key}' to be seeded`).not.toBeNull();
      const parsed: DemoDiscountCode[] = JSON.parse(raw as string);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed[0].code).toBe('WELCOME10');
    });

    REWARD_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      expect(raw).withContext(`Expected reward key '${key}' to be seeded`).not.toBeNull();
      const parsed: DemoRewardAccount[] = JSON.parse(raw as string);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed[0].tier).toBeDefined();
    });

    expect(localStorage.getItem('demoCommerceMigrationV1Complete')).toBe('true');
  });

  it('mirrors existing non-empty discount data to every legacy key', () => {
    const existing: DemoDiscountCode[] = [{
      id: 99,
      code: 'EXISTING',
      description: 'pre-seeded',
      discountType: 'fixed',
      value: 5,
      minSpend: 0,
      maxRedemptions: 1,
      redeemedCount: 0,
      startsAt: '2026-01-01',
      expiresAt: '2026-12-31',
      status: 'active',
      isActive: true,
      appliesTo: 'all'
    }];
    localStorage.setItem('discountCodes', JSON.stringify(existing));

    restoreDemoCommerceData();

    DISCOUNT_KEYS.forEach((key) => {
      const parsed: DemoDiscountCode[] = JSON.parse(localStorage.getItem(key) as string);
      expect(parsed.length).toBe(1);
      expect(parsed[0].code).toBe('EXISTING');
    });
  });

  it('falls back to defaults when existing data is empty arrays', () => {
    localStorage.setItem('discountCodes', JSON.stringify([]));
    localStorage.setItem('rewardAccounts', JSON.stringify([]));

    restoreDemoCommerceData();

    const seededDiscounts: DemoDiscountCode[] = JSON.parse(localStorage.getItem('discountCodes') as string);
    const seededRewards: DemoRewardAccount[] = JSON.parse(localStorage.getItem('rewardAccounts') as string);

    expect(seededDiscounts.length).toBeGreaterThan(0);
    expect(seededRewards.length).toBeGreaterThan(0);
  });

  it('tolerates malformed JSON in legacy keys and still seeds defaults', () => {
    localStorage.setItem('discountCodes', '{not valid json');
    localStorage.setItem('rewardAccounts', 'also not valid');

    expect(() => restoreDemoCommerceData()).not.toThrow();

    const seededDiscounts: DemoDiscountCode[] = JSON.parse(localStorage.getItem('discountCodes') as string);
    const seededRewards: DemoRewardAccount[] = JSON.parse(localStorage.getItem('rewardAccounts') as string);

    expect(seededDiscounts.length).toBeGreaterThan(0);
    expect(seededRewards.length).toBeGreaterThan(0);
  });
});
