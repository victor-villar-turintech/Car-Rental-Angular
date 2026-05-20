export type ActivityEntityType = 'Admin' | 'Booking' | 'Payment' | 'Vehicle' | 'Extra' | 'Customer' | 'System';
export type ActivitySeverity = 'Info' | 'Success' | 'Warning' | 'Danger';

export interface ActivityLogEntry {
  id: number;
  action: string;
  entityType: ActivityEntityType;
  entityReference?: string;
  message: string;
  severity: ActivitySeverity;
  createdAt: string;
  actor?: string;
}
