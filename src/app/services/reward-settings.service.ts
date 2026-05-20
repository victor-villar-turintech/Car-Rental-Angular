import { Injectable } from '@angular/core';
import { RewardSettings } from '../models/reward-settings';

@Injectable({ providedIn: 'root' })
export class RewardSettingsService {
  private readonly storageKey = 'rentacar-reward-settings';

  readonly defaultSettings: RewardSettings = {
    pointsPerPound: 1,
    firstPaidBookingBonus: 100,
    pointsPerTenPoundsDiscount: 500,
    minimumRedeemablePoints: 100,
    maximumRedemptionPercent: 50,
    updatedAt: new Date().toISOString()
  };

  getSettings(): RewardSettings {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      this.saveSettings(this.defaultSettings);
      return { ...this.defaultSettings };
    }
    try {
      return { ...this.defaultSettings, ...JSON.parse(raw) };
    } catch {
      this.saveSettings(this.defaultSettings);
      return { ...this.defaultSettings };
    }
  }

  saveSettings(settings: RewardSettings): void {
    localStorage.setItem(this.storageKey, JSON.stringify({ ...settings, updatedAt: new Date().toISOString() }));
  }

  resetSettings(): RewardSettings {
    this.saveSettings(this.defaultSettings);
    return this.getSettings();
  }

  pointValuePounds(): number {
    const settings = this.getSettings();
    return 10 / Math.max(1, Number(settings.pointsPerTenPoundsDiscount || 500));
  }

  maxRedeemablePoints(pointsBalance: number, grossTotal: number): number {
    const settings = this.getSettings();
    const byBalance = Math.max(0, Math.floor(Number(pointsBalance || 0)));
    const maxDiscountByPercent = Math.max(0, Number(grossTotal || 0)) * (Number(settings.maximumRedemptionPercent || 50) / 100);
    const byTotal = Math.floor(maxDiscountByPercent / this.pointValuePounds());
    return Math.max(0, Math.min(byBalance, byTotal));
  }
}
