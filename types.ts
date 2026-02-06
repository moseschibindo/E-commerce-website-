
export enum ProductCondition {
  NEW = 'New',
  USED = 'Used'
}

export enum ProductCategory {
  ELECTRONICS = 'Electronics',
  FURNITURE = 'Furniture',
  VEHICLES = 'Vehicles',
  CLOTHING = 'Clothing',
  OTHER = 'Other'
}

export enum ProductStatus {
  AVAILABLE = 'Available',
  SOLD_OUT = 'Sold Out'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  condition: ProductCondition;
  status: ProductStatus;
  stock: number;
  location: string;
  description: string;
  images: string[];
  createdAt: string;
  timeSincePurchase?: string;
  isFeatured?: boolean;
  sellerPhone: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  role: 'admin' | 'user';
  is_approved: boolean;
  avatar?: string;
  preferredCategories?: ProductCategory[];
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
