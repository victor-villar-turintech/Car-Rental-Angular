import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivityEntityType, ActivityLogEntry, ActivitySeverity } from '../models/activity-log-entry';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly storageKey = 'rent-a-car-demo-activity-log';

  getEntries(): Observable<ListResponseModel<ActivityLogEntry>> {
    return of({ success: true, message: 'Activity log loaded.', data: this.loadEntries() });
  }

  record(action: string, entityType: ActivityEntityType, message: string, options?: { entityReference?: string; severity?: ActivitySeverity; actor?: string }): void {
    const entries = this.loadEntries();
    const entry: ActivityLogEntry = {
      id: Math.max(...entries.map((item) => item.id || 0), 0) + 1,
      action,
      entityType,
      entityReference: options?.entityReference,
      message,
      severity: options?.severity || 'Info',
      actor: options?.actor || 'local-demo',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(this.storageKey, JSON.stringify([entry, ...entries].slice(0, 250)));
  }

  clear(): Observable<ResponseModel> {
    localStorage.removeItem(this.storageKey);
    return of({ success: true, message: 'Activity log cleared.' });
  }

  private loadEntries(): ActivityLogEntry[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
