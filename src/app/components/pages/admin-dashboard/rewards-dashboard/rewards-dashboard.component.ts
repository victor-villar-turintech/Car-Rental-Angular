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
  load(): void { this.rewardService.getAccounts().subscribe((r) => this.accounts = r.data); this.rewardService.getTransactions().subscribe((r) => this.transactions = r.data); }
  adjust(): void { this.rewardService.adjustPoints(this.selectedEmail, Number(this.points), this.message).subscribe((response) => { response.success ? this.toastrService.success(response.message) : this.toastrService.error(response.message); this.load(); }); }
}
