
import { supabase, isSupabaseConfigured } from './supabase';
import { Product, User } from '../types';

/**
 * Maps database rows to the Product type used in the frontend
 */
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: p.price,
  category: p.category,
  condition: p.condition,
  status: p.status,
  stock: p.stock,
  location: p.location,
  description: p.description,
  images: p.images || [],
  createdAt: p.created_at,
  sellerPhone: p.seller_phone
});

/**
 * Maps frontend Product data to the snake_case format expected by the database
 */
const mapToSupabase = (p: any) => ({
  name: p.name,
  price: p.price,
  category: p.category,
  condition: p.condition,
  status: p.status,
  stock: p.stock,
  location: p.location,
  description: p.description,
  images: p.images,
  seller_phone: p.sellerPhone
});

export const productDB = {
  async getAll(): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  async add(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([mapToSupabase(product)])
      .select()
      .single();
    
    if (error) throw error;
    return mapProduct(data);
  },

  async update(id: string, updates: Partial<Product>): Promise<void> {
    const sbUpdates: any = {};
    if (updates.name) sbUpdates.name = updates.name;
    if (updates.price) sbUpdates.price = updates.price;
    if (updates.category) sbUpdates.category = updates.category;
    if (updates.condition) sbUpdates.condition = updates.condition;
    if (updates.status) sbUpdates.status = updates.status;
    if (updates.stock !== undefined) sbUpdates.stock = updates.stock;
    if (updates.location) sbUpdates.location = updates.location;
    if (updates.description) sbUpdates.description = updates.description;
    if (updates.images) sbUpdates.images = updates.images;
    if (updates.sellerPhone) sbUpdates.seller_phone = updates.sellerPhone;

    const { error } = await supabase
      .from('products')
      .update(sbUpdates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadMedia(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('listings')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};

export const authDB = {
  async getProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) return null;
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
      is_approved: data.role === 'admin',
      avatar: data.avatar_url || `https://ui-avatars.com/api/?name=${data.username || data.email}&background=059669&color=fff`
    };
  },

  async signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  }
};
