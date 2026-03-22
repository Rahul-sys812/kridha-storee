"use client";
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import heroImage from '@/images/hero-img/hero-image.jpg';

export default function HeroBanner() {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Skeleton while image loads */}
      {!imgLoaded && (
        <div className="w-full bg-brand-cream/60 animate-pulse" style={{ aspectRatio: '16/9', minHeight: 300 }} />
      )}

      <img
        src={heroImage.src}
        alt="Kridha Luxe"
        onLoad={() => setImgLoaded(true)}
        className={`w-full h-auto block transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
      />

      {imgLoaded && (
        <>
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-[6%] left-6 md:left-12 z-10 hidden md:block">
            <Link
              href="/collections"
              className="group inline-flex items-center gap-2 md:gap-3 h-10 md:h-12 lg:h-14 px-5 md:px-8 lg:px-10 bg-white/15 backdrop-blur-sm border border-white/50 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-brand-gold hover:border-brand-gold transition-all duration-500 shadow-lg whitespace-nowrap"
            >
              Shop Collection
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-500 flex-shrink-0" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
