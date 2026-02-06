
import React from 'react';
import { Product, ProductCondition, ProductStatus } from '../types';
import { formatCurrency, ICONS } from '../constants';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const isSoldOut = product.status === ProductStatus.SOLD_OUT || product.stock === 0;

  return (
    <div 
      onClick={() => onClick(product)}
      className={`group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer ${isSoldOut ? 'opacity-90' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isSoldOut ? 'grayscale contrast-75' : ''}`}
        />
        
        {/* Condition Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm ${
            product.condition === ProductCondition.NEW 
              ? 'bg-blue-50 text-blue-700 border-blue-100' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
          }`}>
            {product.condition}
          </span>
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1.5 bg-white text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] rounded-lg shadow-xl transform -rotate-6 border border-slate-200">
              Sold Out
            </span>
          </div>
        )}

        {/* Stock Warning */}
        {!isSoldOut && product.stock <= 3 && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-1 bg-indigo-600 text-white text-[8px] font-bold uppercase tracking-wider rounded shadow-sm">
              {product.stock} left
            </span>
          </div>
        )}
      </div>
      
      <div className="p-3.5 space-y-1">
        <h3 className={`font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors text-sm ${isSoldOut ? 'line-through opacity-50' : ''}`}>
          {product.name}
        </h3>
        <p className="text-lg font-bold text-blue-600 leading-none">
          {formatCurrency(product.price)}
        </p>
        
        <div className="pt-2 flex items-center justify-between text-slate-400 text-[10px]">
          <div className="flex items-center gap-1 font-semibold">
            <div className="text-blue-500 scale-90"><ICONS.Location /></div>
            <span className="truncate max-w-[60px] uppercase tracking-wider">{product.location.split(',')[0]}</span>
          </div>
          <span className="font-bold text-slate-300 uppercase tracking-tighter">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
