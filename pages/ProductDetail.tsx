
import React, { useState, useMemo } from 'react';
import { Product, ProductStatus } from '../types';
import { formatCurrency, ICONS } from '../constants';
import ProductCard from '../components/ProductCard';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts, onBack, onSelectProduct }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isSoldOut = product.status === ProductStatus.SOLD_OUT || product.stock === 0;

  const sameSellerProducts = useMemo(() => {
    return allProducts.filter(p => p.sellerPhone === product.sellerPhone && p.id !== product.id);
  }, [product, allProducts]);

  const handleChatSeller = () => {
    if (isSoldOut) return;
    const message = encodeURIComponent(`Jambo! I'm interested in "${product.name}" (${formatCurrency(product.price)}) from HarMarket. Is it still available?`);
    window.open(`https://wa.me/${product.sellerPhone}?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} for ${formatCurrency(product.price)} on HarMarket! Located in ${product.location}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard! Share it with your friends.");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <div className="bg-slate-50 animate-fadeIn flex-1 flex flex-col min-h-full">
      {/* Top Nav */}
      <div className="sticky top-0 z-[70] glass-effect px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-900 active:scale-90">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Product Details</span>
        <button onClick={handleShare} className="p-2 hover:bg-indigo-50 rounded-lg transition-all text-indigo-600 active:scale-90">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        </button>
      </div>

      <div className="max-w-3xl mx-auto pb-40 w-full flex-1">
        {/* Gallery */}
        <div className="relative aspect-square md:aspect-video bg-slate-200 overflow-hidden shadow-inner">
          <div 
            className="flex h-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
            style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
          >
            {product.images.map((img, idx) => (
              <img key={idx} src={img} alt="" className={`w-full h-full object-cover flex-shrink-0 ${isSoldOut ? 'grayscale' : ''}`} />
            ))}
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === idx ? 'w-8 bg-indigo-600 shadow-lg shadow-indigo-500/50' : 'w-2 bg-white/50 backdrop-blur-sm'}`}
                />
              ))}
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white px-8 py-3 rounded-2xl font-black text-slate-900 uppercase tracking-[0.3em] text-sm border-2 border-slate-900 transform -rotate-3 shadow-2xl">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-10 -mt-10 relative z-10 bg-white rounded-t-[3rem] shadow-2xl border-t border-slate-50">
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              <span className={`px-3 py-1 rounded-full border ${product.condition === 'New' ? 'text-blue-600 border-blue-100 bg-blue-50/50' : 'text-indigo-600 border-indigo-100 bg-indigo-50/50'}`}>{product.condition}</span>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <span>Listed {new Date(product.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
            <h1 className={`text-3xl font-black text-slate-900 tracking-tight leading-tight ${isSoldOut ? 'opacity-40 line-through' : ''}`}>{product.name}</h1>
            <p className="text-4xl font-black text-indigo-600 tracking-tighter">{formatCurrency(product.price)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <InfoBlock label="Pickup Point" value={product.location} icon={<ICONS.Location />} />
            <InfoBlock label="Category" value={product.category} icon={<CategoryIcon />} />
          </div>

          <div className="mb-12">
            <h2 className="text-[11px] font-black text-slate-900 mb-5 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-6 h-1 bg-indigo-500 rounded-full"></div>
              Product Details
            </h2>
            <p className="text-slate-600 leading-relaxed text-[15px] font-medium whitespace-pre-wrap bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">{product.description}</p>
          </div>

          {sameSellerProducts.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-6 h-1 bg-indigo-500 rounded-full"></div>
                Seller's Other items
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar snap-x">
                {sameSellerProducts.map(p => (
                  <div key={p.id} className="w-[200px] flex-shrink-0 snap-start">
                    <ProductCard product={p} onClick={onSelectProduct} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Bar - Floats above Tab Nav */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-50 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button 
            onClick={handleChatSeller}
            disabled={isSoldOut}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black transition-all shadow-2xl active:scale-95 text-sm uppercase tracking-[0.2em] ${
              isSoldOut 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-[#25D366] hover:bg-[#20bd5c] text-white shadow-green-500/25 ring-4 ring-white'
            }`}
          >
            {isSoldOut ? (
               <span>Sold Out</span>
            ) : (
              <>
                <ICONS.WhatsApp />
                <span>Secure on WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoBlock = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex flex-col gap-1.5 transition-colors hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm truncate">
      <div className="text-indigo-500 shrink-0">{icon}</div>
      <span className="truncate">{value}</span>
    </div>
  </div>
);

const CategoryIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
);

export default ProductDetail;
