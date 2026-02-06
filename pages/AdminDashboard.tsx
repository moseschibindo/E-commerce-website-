
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCategory, ProductCondition, ProductStatus } from '../types';
import { productDB } from '../services/dbService';
import { formatCurrency, KENYA_LOCATIONS } from '../constants';

interface AdminDashboardProps {
  products: Product[];
  onRefresh: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.ELECTRONICS);
  const [condition, setCondition] = useState<ProductCondition>(ProductCondition.NEW);
  const [status, setStatus] = useState<ProductStatus>(ProductStatus.AVAILABLE);
  const [stock, setStock] = useState('1');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [description, setDescription] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [sellerPhone, setSellerPhone] = useState('254700000000');

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (val.trim()) {
      const filtered = KENYA_LOCATIONS.filter(l => 
        l.toLowerCase().includes(val.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setLocationSuggestions(KENYA_LOCATIONS);
      setShowSuggestions(true);
    }
  };

  const selectSuggestion = (val: string) => {
    setLocation(val);
    setShowSuggestions(false);
  };

  const addMediaUrl = () => {
    if (!currentUrl.trim()) return;
    if (!currentUrl.startsWith('http')) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setMediaUrls(prev => [...prev, currentUrl.trim()]);
    setCurrentUrl('');
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mediaUrls.length === 0) {
      alert("Please provide at least one image or video URL.");
      return;
    }
    if (!location.trim()) {
      alert("Please provide a location.");
      return;
    }

    setLoading(true);
    try {
      await productDB.add({
        name,
        price: parseFloat(price),
        category,
        condition,
        status,
        stock: parseInt(stock),
        location,
        description,
        images: mediaUrls,
        sellerPhone
      });
      // Instant transition
      await onRefresh();
      setShowForm(false);
      resetForm();
    } catch (err) {
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(''); 
    setPrice(''); 
    setDescription(''); 
    setMediaUrls([]); 
    setLocation('');
    setCurrentUrl('');
    setCategory(ProductCategory.ELECTRONICS);
    setStock('1');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this listing from HarMarket?')) {
      await productDB.delete(id);
      onRefresh();
    }
  };

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === ProductStatus.AVAILABLE ? ProductStatus.SOLD_OUT : ProductStatus.AVAILABLE;
    await productDB.update(product.id, { status: newStatus });
    onRefresh();
  };

  return (
    <div className="px-6 py-8 animate-fadeIn max-w-6xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 font-medium">Manage and list products on HarMarket.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className={`px-8 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
            showForm ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 text-white hover:bg-black'
          }`}
        >
          {showForm ? 'Cancel' : 'New Listing'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="animate-slideUp bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-indigo-500/10 border border-indigo-50 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mb-8">Basic Information</h2>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Product Name</label>
              <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-semibold text-slate-900" placeholder="e.g. iPhone 13 Pro Max" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Price (KES)</label>
                <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-bold text-blue-600" type="number" placeholder="45000" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Stock</label>
                <input className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-bold text-slate-900" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Category</label>
                <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-semibold text-slate-900" value={category} onChange={e => setCategory(e.target.value as ProductCategory)}>
                  {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Condition</label>
                <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-semibold text-slate-900" value={condition} onChange={e => setCondition(e.target.value as ProductCondition)}>
                  {Object.values(ProductCondition).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1 relative" ref={suggestionsRef}>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Location (Write or Pick)</label>
              <div className="relative">
                <input 
                  autoComplete="off"
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-semibold text-slate-900" 
                  placeholder="e.g. Egerton Campus, Nakuru..." 
                  value={location} 
                  onChange={e => handleLocationChange(e.target.value)}
                  onFocus={() => {
                    if (locationSuggestions.length === 0) setLocationSuggestions(KENYA_LOCATIONS);
                    setShowSuggestions(true);
                  }}
                />
              </div>
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-[110%] bg-white border border-indigo-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto no-scrollbar animate-fadeIn">
                  {locationSuggestions.map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectSuggestion(s)}
                      className="px-6 py-3.5 hover:bg-indigo-50 cursor-pointer font-semibold text-slate-700 text-sm transition-colors border-b border-slate-50 last:border-0"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4">Full Description</label>
              <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-medium text-slate-700 h-32 resize-none" placeholder="Details about RAM, Storage, issues, warranty etc." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mb-8">Media URLs</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-500/5 outline-none font-semibold text-slate-900 text-sm" 
                  placeholder="Paste Storage URL (Image/Video)" 
                  value={currentUrl} 
                  onChange={e => setCurrentUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMediaUrl())}
                />
                <button 
                  type="button"
                  onClick={addMediaUrl}
                  className="px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95"
                >
                  Add
                </button>
              </div>
              <p className="px-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Provide URLs from your Supabase Storage buckets</p>
            </div>

            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mediaUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-indigo-100 group shadow-sm bg-slate-100">
                    {url.toLowerCase().match(/\.(mp4|webm|ogg)$/) || url.includes('video') ? (
                       <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} className="w-full h-full object-cover" alt="" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                       <button 
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-8">
              <button 
                type="submit"
                disabled={loading} 
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Publishing Listing...' : 'Push to HarMarket'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-indigo-500/5 border border-indigo-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-indigo-50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50/50">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-300">No products listed yet.</td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-indigo-50/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-indigo-50 shrink-0">
                          {p.images[0]?.toLowerCase().match(/\.(mp4|webm|ogg)$/) ? (
                             <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                          ) : (
                             <img src={p.images[0]} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="font-bold text-blue-600 text-sm">{formatCurrency(p.price)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-semibold text-slate-500 truncate block max-w-[120px]">{p.location}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(p)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          p.status === ProductStatus.AVAILABLE 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(p.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all group mx-auto">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
