"use client";
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import heroImage from '@/images/hero-img/hero-image.jpg';

export default function HeroBanner() {
  return (
    // Pull up to sit behind the fixed header (announcement bar ~36px + nav ~54px = ~90px mobile, ~100px desktop)
    <div className="relative w-full overflow-hidden">

      {/* Image wrapper — on mobile enforce a min height so it's not tiny */}
      <div className="relative w-full min-h-[320px] sm:min-h-0">
        <img
          src={heroImage.src}
          alt="Kridha Luxe"
          className="w-full h-auto block min-h-[320px] sm:min-h-0 object-cover object-center sm:object-fill"
        />

        {/* Top gradient — keeps nav/logo readable */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

        {/* Bottom gradient — softens button area */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

        {/* Shop Collection button */}
        <div className="absolute bottom-[8%] left-[5%] z-10">
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 md:gap-3 h-10 md:h-12 lg:h-14 px-5 md:px-8 lg:px-10 bg-white/15 backdrop-blur-sm border border-white/50 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-brand-gold hover:border-brand-gold transition-all duration-500 shadow-lg whitespace-nowrap"
          >
            Shop Collection
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform duration-500 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
