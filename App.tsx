
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AIChatPage from './pages/AIChatPage';
import { Product, User } from './types';
import { supabase } from './services/supabase';
import { productDB, authDB } from './services/dbService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shop' | 'chat' | 'profile' | 'admin'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productDB.getAll();
      setAllProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial Auth Check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await authDB.getProfile(session.user.id);
        setUser(profile);
      }
      setIsLoading(false);
    };

    checkUser();
    fetchProducts();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await authDB.getProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProducts]);

  const handleSelectProduct = (product: Product) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const handleTabChange = (tab: 'shop' | 'chat' | 'profile' | 'admin') => {
    setSelectedProduct(null);
    setActiveTab(tab);
    window.scrollTo(0, 0);
    // Refresh products in background when switching tabs to keep things fresh
    if (tab === 'shop' || tab === 'admin') fetchProducts();
  };

  const renderContent = () => {
    if (isLoading && allProducts.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-indigo-400 uppercase tracking-widest text-xs">Initializing Market...</p>
        </div>
      );
    }

    if (selectedProduct) {
      return (
        <ProductDetail 
          product={selectedProduct} 
          onBack={handleBack} 
          onSelectProduct={handleSelectProduct}
          allProducts={allProducts}
        />
      );
    }

    switch (activeTab) {
      case 'shop':
        return <Home products={allProducts} isLoading={isLoading && allProducts.length === 0} onSelectProduct={handleSelectProduct} />;
      case 'profile':
        return <Profile user={user} onAuthChange={setUser} />;
      case 'admin':
        return user?.role === 'admin' 
          ? <AdminDashboard products={allProducts} onRefresh={fetchProducts} /> 
          : <Profile user={user} onAuthChange={setUser} />;
      case 'chat':
        return <AIChatPage products={allProducts} onSelectProduct={handleSelectProduct} />;
      default:
        return <Home products={allProducts} isLoading={isLoading && allProducts.length === 0} onSelectProduct={handleSelectProduct} />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Layout activeTab={activeTab} setActiveTab={handleTabChange} user={user}>
        {renderContent()}
      </Layout>
    </div>
  );
};

export default App;
