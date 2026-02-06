
import { Product, User, ProductCategory, ProductCondition, ProductStatus } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'keshomarket_products',
  USER: 'keshomarket_user',
  USERS_LIST: 'keshomarket_users_all'
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'HP EliteBook 840 G5 - Core i7',
    price: 45000,
    category: ProductCategory.ELECTRONICS,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    stock: 2,
    location: 'Egerton Main Campus',
    description: 'Perfect for students. 16GB RAM, 512GB SSD. Very clean and well maintained. Battery lasts 4+ hours.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString(),
    timeSincePurchase: '1 year',
    isFeatured: true,
    sellerPhone: '254712345678'
  },
  {
    id: '2',
    name: 'Study Desk & Swivel Chair',
    price: 8500,
    category: ProductCategory.FURNITURE,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    stock: 1,
    location: 'Njoro Town',
    description: 'Selling as I am moving out. Very sturdy wooden desk and a comfortable adjustable chair.',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f816b1a22a?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString(),
    timeSincePurchase: '6 months',
    isFeatured: true,
    sellerPhone: '254722334455'
  },
  {
    id: '3',
    name: 'Mountain Bike - 21 Speed',
    price: 12000,
    category: ProductCategory.OTHER,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    stock: 1,
    location: 'Egerton Gate',
    description: 'Great for commuting around campus. New tires recently fitted. Smooth shifting.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString(),
    timeSincePurchase: '2 years',
    isFeatured: true,
    sellerPhone: '254733445566'
  },
  {
    id: '4',
    name: 'Samsung 32" LED Smart TV',
    price: 15500,
    category: ProductCategory.ELECTRONICS,
    condition: ProductCondition.USED,
    status: ProductStatus.AVAILABLE,
    stock: 1,
    location: 'Nakuru CBD',
    description: 'Slightly used, works perfectly. YouTube and Netflix pre-installed.',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800'],
    createdAt: new Date().toISOString(),
    sellerPhone: '254700000000'
  }
];

export const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
  const products = getStoredProducts();
  const newProduct: Product = {
    ...product,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  const updated = [newProduct, ...products];
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  return newProduct;
};

export const updateProduct = (updatedProduct: Product) => {
  const products = getStoredProducts();
  const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
};

export const deleteProduct = (id: string) => {
  const products = getStoredProducts();
  const updated = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
};

export const getActiveUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
};

export const loginMock = (email: string, pass: string): User => {
  const user: User = {
    id: 'u1',
    email,
    role: email.includes('admin') ? 'admin' : 'user',
    is_approved: email.includes('admin'),
    avatar: `https://ui-avatars.com/api/?name=${email}&background=059669&color=fff`,
    preferredCategories: []
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const logoutMock = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};
