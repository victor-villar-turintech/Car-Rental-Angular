import { Component, OnInit } from '@angular/core';
import { ActivityEntityType, ActivityLogEntry } from 'src/app/models/activity-log-entry';
import { ActivityLogService } from 'src/app/services/activity-log.service';

@Component({
  selector: 'app-admin-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.css'],
})
export class AdminActivityDashboardComponent implements OnInit {
  entries: ActivityLogEntry[] = [];
  entityFilter: ActivityEntityType | '' = '';
  searchText = '';
  fromDate = '';
  toDate = '';

  constructor(private activityLogService: ActivityLogService) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  get filteredEntries(): ActivityLogEntry[] {
    const term = this.searchText.trim().toLowerCase();
    const fromTime = this.fromDate ? new Date(this.fromDate).getTime() : undefined;
    const toTime = this.toDate ? new Date(this.toDate + 'T23:59:59').getTime() : undefined;

    return this.entries
      .filter((entry) => !this.entityFilter || entry.entityType === this.entityFilter)
      .filter((entry) => {
        if (fromTime === undefined && toTime === undefined) { return true; }
        const created = new Date(entry.createdAt).getTime();
        if (fromTime !== undefined && created < fromTime) { return false; }
        if (toTime !== undefined && created > toTime) { return false; }
        return true;
      })
      .filter((entry) => {
        if (!term) { return true; }
        const haystack = `${entry.action} ${entry.message} ${entry.entityReference || ''} ${entry.actor || ''}`.toLowerCase();
        return haystack.includes(term);
      });
  }

  loadEntries(): void {
    this.activityLogService.getEntries().subscribe((response) => this.entries = response.data);
  }

  clearFilters(): void {
    this.entityFilter = '';
    this.searchText = '';
    this.fromDate = '';
    this.toDate = '';
  }

  clearLog(): void {
    if (!window.confirm('Clear the local Admin activity log?')) {
      return;
    }
    this.activityLogService.clear().subscribe(() => this.loadEntries());
  }
}
