"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';
import ProductCard from './ProductCard';

const PRICE_PRESETS = [
  { label: 'All Prices', min: 0, max: 0 },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹800', min: 500, max: 800 },
  { label: '₹800 – ₹1000', min: 800, max: 1000 },
  { label: 'Above ₹1000', min: 1000, max: 0 },
];

export default function ProductGrid() {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useAuth();
  const { activeCategory, searchQuery } = useFilter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    const params = new URLSearchParams();
    if (!activeCategory || activeCategory === 'All') params.set('limit', '8');
    if (activeCategory && activeCategory !== 'All') params.set('category', activeCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (priceRange.min > 0) params.set('minPrice', priceRange.min);
    if (priceRange.max > 0) params.set('maxPrice', priceRange.max);
    setLoading(true);
    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory, searchQuery, priceRange]);

  return (
    <section className="py-24 bg-brand-cream/20" id="product-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">

        {/* Section Header */}
        <div className="text-center mb-12 space-y-6">
          <span className="text-[12px] font-bold uppercase tracking-[0.6em] text-brand-gold animate__animated animate__fadeIn">
            Boutique Highlights
          </span>
          <h2 className="text-4xl md:text-7xl font-serif font-light text-brand-charcoal uppercase tracking-tighter animate__animated animate__fadeInUp">
            Exquisite <span className="italic font-bold text-brand-gold">Masterpieces</span>
          </h2>
          <div className="w-16 h-[1px] bg-brand-gold mx-auto animate__animated animate__zoomIn"></div>
        </div>

        {/* Price Range Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
          {PRICE_PRESETS.map((preset) => {
            const isActive = priceRange.min === preset.min && priceRange.max === preset.max;
            return (
              <button
                key={preset.label}
                onClick={() => setPriceRange({ min: preset.min, max: preset.max })}
                className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-gold text-white border-brand-gold shadow-md'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-brand-cream/60 rounded-sm" />
                  <div className="h-3 bg-brand-cream/60 rounded w-3/4" />
                  <div className="h-3 bg-brand-cream/40 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  addToCart={addToCart}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em]">No products found in this range</p>
              <button
                onClick={() => setPriceRange({ min: 0, max: 0 })}
                className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em] border-b border-brand-gold pb-1 hover:tracking-[0.5em] transition-all"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="mt-20 text-center animate__animated animate__fadeInUp">
          <Link
            href="/collections"
            className="group inline-flex items-center gap-4 h-14 px-12 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-brand-gold transition-all duration-500 shadow-lg hover:shadow-xl"
          >
            View All Collections
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
