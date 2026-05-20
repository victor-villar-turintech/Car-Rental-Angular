import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RewardSettings } from '../../../../models/reward-settings';
import { RewardSettingsService } from '../../../../services/reward-settings.service';

@Component({
  selector: 'app-admin-reward-settings',
  templateUrl: './reward-settings.component.html',
  styleUrls: ['./reward-settings.component.css']
})
export class AdminRewardSettingsComponent implements OnInit {
  settings!: RewardSettings;
  showResetConfirm = false;

  constructor(private rewardSettingsService: RewardSettingsService, private toastrService: ToastrService) {}

  ngOnInit(): void {
    this.settings = this.rewardSettingsService.getSettings();
  }

  save(): void {
    this.settings.pointsPerPound = Math.max(0, Number(this.settings.pointsPerPound || 0));
    this.settings.firstPaidBookingBonus = Math.max(0, Number(this.settings.firstPaidBookingBonus || 0));
    this.settings.pointsPerTenPoundsDiscount = Math.max(1, Number(this.settings.pointsPerTenPoundsDiscount || 500));
    this.settings.minimumRedeemablePoints = Math.max(0, Number(this.settings.minimumRedeemablePoints || 0));
    this.settings.maximumRedemptionPercent = Math.min(100, Math.max(0, Number(this.settings.maximumRedemptionPercent || 50)));
    this.rewardSettingsService.saveSettings(this.settings);
    this.settings = this.rewardSettingsService.getSettings();
    this.toastrService.success('Reward settings saved.');
  }

  reset(): void {
    this.settings = this.rewardSettingsService.resetSettings();
    this.showResetConfirm = false;
    this.toastrService.success('Reward settings reset to demo defaults.');
  }
}
