export type RentalLocationType = 'branch' | 'airport' | 'terminal' | 'station' | 'hotel';

export interface RentalLocation {
  id: number;
  name: string;
  type: RentalLocationType;
  address?: string;
  city: string;
  postcode?: string;
  isActive: boolean;
}
