export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerSession {
  customerId: number;
  email: string;
  firstName: string;
  lastName: string;
  loggedInAt: string;
}
