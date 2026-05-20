import { Component, OnInit } from '@angular/core';
import { ActivityLogEntry } from 'src/app/models/activity-log-entry';
import { ActivityLogService } from 'src/app/services/activity-log.service';

@Component({
  selector: 'app-admin-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.css'],
})
export class AdminActivityDashboardComponent implements OnInit {
  entries: ActivityLogEntry[] = [];
  entityFilter = '';

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  get filteredEntries(): ActivityLogEntry[] {
    return this.entityFilter ? this.entries.filter((entry) => entry.entityType === this.entityFilter) : this.entries;
  }

  loadEntries(): void {
    this.activityLogService.getEntries().subscribe((response) => this.entries = response.data);
  }

  clearLog(): void {
    if (!window.confirm('Clear the local Admin activity log?')) {
      return;
    }
    this.activityLogService.clear().subscribe(() => this.loadEntries());
  }
}
