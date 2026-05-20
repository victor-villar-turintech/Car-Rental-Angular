export type RewardTransactionType = 'Earned' | 'Redeemed' | 'Adjusted' | 'Reversed';

export interface RewardAccount {
  customerEmail: string;
  pointsBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  updatedAt: string;
}

export interface RewardTransaction {
  transactionId: number;
  customerEmail: string;
  type: RewardTransactionType;
  points: number;
  bookingReference?: string;
  message: string;
  createdAt: string;
}
