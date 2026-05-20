import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RewardAccount, RewardTransaction } from 'src/app/models/reward';
import { RewardService } from 'src/app/services/reward.service';

@Component({ selector: 'app-admin-rewards-dashboard', templateUrl: './rewards-dashboard.component.html', styleUrls: ['./rewards-dashboard.component.css'] })
export class AdminRewardsDashboardComponent implements OnInit {
  accounts: RewardAccount[] = [];
  transactions: RewardTransaction[] = [];
  selectedEmail = '';
  points = 100;
  message = 'Manual admin adjustment';

  constructor(private rewardService: RewardService, private toastrService: ToastrService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.rewardService.getAccounts().subscribe((response: any) => this.accounts = response.data || []); this.rewardService.getTransactions().subscribe((response: any) => this.transactions = response.data || []); }
  adjust(): void {
    const result: any = this.rewardService.adjustPoints(this.selectedEmail, Number(this.points), this.message);
    const handle = (response: any) => {
      if (!response || response.success !== false) {
        this.toastrService.success(response?.message || 'Reward points adjusted.');
      } else {
        this.toastrService.error(response.message || 'Unable to adjust reward points.');
      }
      this.load();
    };
    if (result && typeof result.subscribe === 'function') {
      result.subscribe(handle);
    } else {
      handle(result);
    }
  }
}
