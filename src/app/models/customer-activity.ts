export type CustomerActivityType =
  | 'Registered'
  | 'LoggedIn'
  | 'LoggedOut'
  | 'ProfileUpdated'
  | 'BookingCreated'
  | 'BookingCancelled'
  | 'PaymentCompleted'
  | 'RefundIssued'
  | 'PasswordResetRequested'
  | 'DiscountApplied'
  | 'RewardsEarned'
  | 'RewardsAdjusted'
  | 'RewardsRedeemed';

export interface CustomerActivity {
  activityId: number;
  customerId?: number;
  customerEmail: string;
  activityType: CustomerActivityType;
  message: string;
  entityReference?: string;
  createdAt: string;
  metadata?: any;
}
