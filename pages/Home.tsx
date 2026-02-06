
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { CATEGORIES, ICONS } from '../constants';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  products: Product[];
  isLoading: boolean;
  onSelectProduct: (p: Product) => void;
}

const Home: React.FC<HomeProps> = ({ products, isLoading, onSelectProduct }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="animate-fadeIn pb-10">
      <section className="px-6 pt-8 pb-4">
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/15 backdrop-blur-md rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Nakuru & Egerton Edition</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight leading-[1.1]">Find Great Deals <br/> Around You.</h1>
              <p className="text-indigo-50/80 text-sm font-medium max-w-[240px] leading-relaxed">
                Premium marketplace for Nakuru and Egerton University.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 py-4">
        <div className="bg-white rounded-[1.5rem] shadow-xl shadow-indigo-500/5 border border-indigo-50 p-1 flex items-center transition-all focus-within:ring-4 ring-indigo-500/5 focus-within:border-indigo-200">
          <div className="pl-5 text-slate-400"><ICONS.Search /></div>
          <input 
            type="text" 
            placeholder="Search phones, laptops, bikes..."
            className="flex-1 px-4 py-4 text-[15px] font-medium focus:outline-none bg-transparent placeholder-slate-400 text-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-indigo-50/50 py-3 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 border-transparent' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 mt-2 grid grid-cols-2 gap-4 pb-12">
        {isLoading && products.length === 0 ? (
          <div className="col-span-2 py-20 text-center font-bold text-slate-300 animate-pulse uppercase tracking-[0.2em] text-xs">Gathering items...</div>
        ) : filteredProducts.length === 0 ? (
           <div className="col-span-2 py-20 text-center font-bold text-slate-400 italic">No items matching your search.</div>
        ) : filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onClick={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};

export default Home;
