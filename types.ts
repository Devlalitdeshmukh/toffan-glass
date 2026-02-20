
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city?: string;
  mobile?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  specifications: any; // Can be string[] or Record<string, string>
  imageUrls?: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  userId?: string;
  status: 'COMING_SOON' | 'WORKING' | 'COMPLETED';
  startDate: string;
  completionDate: string;
  description: string;
  cityName: string;
  cityId: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  siteId: string;
  customerId?: string;
  productName?: string;
  amount: number;
  paidAmount?: number;
  balanceAmount?: number;
  status: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
  paymentDate: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  billNumber?: string;
}

export interface ContentPage {
  id: string;
  pageName: string;
  title: string;
  content: string;
  metaDescription?: string;
  images?: { imageUrl: string; caption: string }[];
  isActive: boolean;
  createdAt: string;
}
