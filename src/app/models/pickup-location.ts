export interface PickupLocationOption {
  id: string;
  label: string;
  type: 'Branch' | 'Airport';
  airport?: string;
  terminal?: string;
  surcharge: number;
}
