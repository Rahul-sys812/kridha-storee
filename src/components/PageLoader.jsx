"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-brand-cream/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="space-y-4 text-center">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-brand-gold/20 animate-ping" />
          <div className="absolute inset-1 rounded-full border-2 border-brand-gold animate-spin" style={{ borderTopColor: 'transparent' }} />
        </div>
        <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-brand-gold">Loading</p>
      </div>
    </div>
  );
}
