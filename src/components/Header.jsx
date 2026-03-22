"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X, Heart, MapPin, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFilter } from '../context/FilterContext';
import { menuCategoryNames } from '../data/categories';import logoImg from '@/images/logo/logo.png';
import logoWhiteImg from '@/images/logo/logo-2.png';

const logo = logoImg.src;
const logoWhite = logoWhiteImg.src;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const { userInfo, logout, wishlist } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { searchQuery, setSearchQuery, setActiveCategory } = useFilter();
  const pathname = usePathname();
  const router = useRouter();

  // Pincode modal state
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [savedPincode, setSavedPincode] = useState('');
  const [savedCity, setSavedCity] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState(null); // null | 'ok' | 'invalid'
  const pincodeRef = useRef(null);

  const handlePincodeUpdate = async () => {
    if (!/^\d{6}$/.test(pincodeInput)) { setPincodeResult('invalid'); return; }
    setPincodeChecking(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincodeInput}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Name || '';
        setSavedPincode(pincodeInput);
        setSavedCity(city);
        setPincodeResult('ok');
        setTimeout(() => setPincodeOpen(false), 900);
      } else {
        setPincodeResult('invalid');
      }
    } catch {
      // fallback — accept pincode without city
      setSavedPincode(pincodeInput);
      setSavedCity('');
      setPincodeResult('ok');
      setTimeout(() => setPincodeOpen(false), 900);
    }
    setPincodeChecking(false);
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (!searchInputRef.current?.closest('div')?.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setActiveCategory('All');
    if (pathname !== '/collections') {
      router.push('/collections');
    }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  // On homepage with dark hero, use white text until scrolled
  const isHero = pathname === '/' && !scrolled;

  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50 animate__animated animate__fadeInDown">
      {/* Announcement Bar */}
      <div className="bg-brand-charcoal text-white py-2 overflow-hidden border-b border-white/10 relative w-full">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex whitespace-nowrap"
        >
          <p className="text-[10px] md:text-[12px] font-light italic uppercase tracking-[0.3em] px-4">
            ✨ Limited Edition: Get 0% Making Charges on Silver Jewellery | Complimentary Boutique Delivery on all orders above ₹999 ✨
          </p>
          <p className="text-[10px] md:text-[12px] font-light italic uppercase tracking-[0.3em] px-4">
            ✨ Limited Edition: Get 0% Making Charges on Silver Jewellery | Complimentary Boutique Delivery on all orders above ₹999 ✨
          </p>
          <p className="text-[10px] md:text-[12px] font-light italic uppercase tracking-[0.3em] px-4">
            ✨ Limited Edition: Get 0% Making Charges on Silver Jewellery | Complimentary Boutique Delivery on all orders above ₹999 ✨
          </p>
        </motion.div>
      </div>

      <header className={`transition-all duration-700 border-b ${scrolled ? 'bg-white/90 backdrop-blur-xl border-gray-100 py-1.5 shadow-lg' : 'bg-transparent border-transparent py-3'}`}>
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          
          {/* Single Row: Logo + Pincode | Nav Links | Icons */}
          <div className="flex items-center justify-between gap-3 lg:gap-6">
            
            {/* Left: Hamburger + Logo + Pincode */}
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <button className="lg:hidden p-1 hover:text-brand-gold transition-colors" style={{color: isHero ? 'rgba(255,255,255,0.85)' : undefined}} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/" className="flex-shrink-0 transition-transform duration-500 hover:scale-105">
                <img src={isHero ? logoWhite : logo} alt="Kridha Luxe" className="h-14 md:h-16 lg:h-18 w-auto object-contain transition-all duration-500" />
              </Link>
              {/* Where to Deliver — desktop only */}
              <button
                onClick={() => { setPincodeOpen(true); setPincodeResult(null); }}
                className={`hidden lg:flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-full transition-all duration-300 group
                  ${isHero 
                    ? 'text-white/80 hover:text-white hover:bg-white/10' 
                    : 'text-brand-charcoal hover:text-brand-gold hover:bg-gray-50 border border-transparent hover:border-gray-200'
                  }`}
              >
                <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0 group-hover:scale-110 transition-transform" strokeWidth={2} />
                <div className="text-left">
                  <p className={`text-[7px] font-bold uppercase tracking-[0.2em] leading-none ${isHero ? 'text-white/50' : 'text-gray-400'}`}>Where to Deliver?</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] leading-none mt-0.5">
                    {savedPincode ? `${savedPincode}${savedCity ? ` · ${savedCity}` : ''}` : 'Update Pincode'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Center: Nav Links — desktop only */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-8">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'Our Heritage' },
                { href: '/collections', label: 'Collections' },
                { href: '/gifting', label: 'The Gift Edit' },
                { href: '/contact', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className={`text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-brand-gold relative group whitespace-nowrap ${
                  pathname === href ? 'text-brand-gold' : isHero ? 'text-white/90' : 'text-brand-charcoal'
                }`}>
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">

              {/* Search — expands inline on desktop, prompt on mobile */}
              <div className="flex items-center">
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`hidden lg:flex overflow-hidden items-center gap-2 px-3 py-1.5 rounded-full border mr-2 ${
                        isHero
                          ? 'border-white/30 bg-white/10'
                          : 'border-gray-200 bg-gray-50 shadow-sm'
                      }`}
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder='Search...'
                        className={`w-full bg-transparent text-[11px] font-medium tracking-wide focus:outline-none ${
                          isHero ? 'text-white placeholder:text-white/40' : 'text-brand-charcoal placeholder:text-gray-400'
                        }`}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="flex-shrink-0">
                          <X className={`w-3 h-3 ${isHero ? 'text-white/50' : 'text-gray-300'} hover:text-brand-gold transition-colors`} />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  className={`flex items-center group hover:text-brand-gold transition-all ${isHero ? 'text-white/80' : 'text-brand-charcoal'}`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      const input = prompt("Search jewellery:");
                      if (input !== null) { setSearchQuery(input); setActiveCategory('All'); if (pathname !== '/collections') router.push('/collections'); }
                    } else {
                      setSearchOpen(v => !v);
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }
                  }}
                >
                  {searchOpen
                    ? <X className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                    : <Search className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                  }
                </button>
              </div>

              {/* User */}
              <div className="hidden lg:flex relative group/user items-center cursor-pointer">
                <Link href={mounted && userInfo ? "/profile" : "/login"} className={`flex items-center group hover:text-brand-gold transition-all ${isHero ? 'text-white/80' : 'text-brand-charcoal'}`}>
                  <User className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                </Link>
                {mounted && userInfo && (
                  <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 z-50">
                    <div className="bg-white shadow-xl border border-gray-50 p-4 w-32 text-left space-y-3">
                      <Link href="/profile" className="block text-[9px] font-bold uppercase tracking-widest text-brand-charcoal hover:text-brand-gold">Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left text-[9px] font-bold uppercase tracking-widest text-brand-gold">Logout</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className={`flex items-center group hover:text-brand-gold transition-all relative ${isHero ? 'text-white/80' : 'text-brand-charcoal'}`}>
                <Heart className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                {mounted && wishlist?.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </Link>

              {/* Cart */}
              <button onClick={() => setIsCartOpen(true)} className={`flex items-center group hover:text-brand-gold transition-all relative ${isHero ? 'text-white/80' : 'text-brand-charcoal'}`}>
                <ShoppingBag className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
                {mounted && cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-brand-charcoal text-white text-[7px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Menu - Truly outside of the animated wrapper to avoid containing block issues */}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 bg-white z-[70] lg:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <img src={logo} alt="Kridha Luxe" className="h-16 w-auto" />
                <button onClick={() => setIsOpen(false)} className="p-2 bg-brand-cream rounded-full"><X className="w-5 h-5 text-brand-charcoal" /></button>
              </div>
              <div className="space-y-6">
                 <Link href="/" onClick={() => setIsOpen(false)} className="block text-2xl font-serif uppercase tracking-tight text-brand-charcoal hover:text-brand-gold transition-colors">Home</Link>
                 <Link href="/about" onClick={() => setIsOpen(false)} className="block text-2xl font-serif uppercase tracking-tight text-brand-charcoal hover:text-brand-gold transition-colors">Our Heritage</Link>
                 <Link href="/collections" onClick={() => setIsOpen(false)} className="block text-2xl font-serif uppercase tracking-tight text-brand-charcoal hover:text-brand-gold transition-colors">Collections</Link>
                 <Link href="/gifting" onClick={() => setIsOpen(false)} className="block text-2xl font-serif uppercase tracking-tight text-brand-charcoal hover:text-brand-gold transition-colors">The Gift Edit</Link>
                 <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-2xl font-serif uppercase tracking-tight text-brand-charcoal hover:text-brand-gold transition-colors">Contact Us</Link>
                 <div className="pt-8 border-t border-gray-100 flex flex-col gap-6">
                    <Link href={mounted && userInfo ? "/profile" : "/login"} onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-widest text-brand-charcoal flex items-center gap-2">
                       <User className="w-4 h-4" /> {mounted && userInfo ? userInfo.name.split(' ')[0] : 'Login / Register'}
                    </Link>
                    <Link href="/wishlist" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-widest text-brand-charcoal flex items-center gap-2">
                       <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pincode Modal */}
      <AnimatePresence>
        {pincodeOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPincodeOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80]"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[90px] md:top-[110px] left-4 md:left-auto md:ml-[200px] z-[90] bg-white shadow-2xl border border-gray-100 rounded-sm w-[calc(100vw-2rem)] md:w-[340px] p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-charcoal">Enter Pincode</h3>
                </div>
                <button onClick={() => setPincodeOpen(false)} className="p-1 text-gray-400 hover:text-brand-charcoal transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
                Enter your delivery pincode to check availability and estimated delivery date
              </p>

              {/* Input row */}
              <div className="flex items-center gap-3">
                <input
                  ref={pincodeRef}
                  autoFocus
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={e => { setPincodeInput(e.target.value.replace(/\D/g, '')); setPincodeResult(null); }}
                  onKeyDown={e => e.key === 'Enter' && handlePincodeUpdate()}
                  placeholder="Enter Delivery Pincode"
                  className="flex-1 border border-gray-200 focus:border-brand-gold rounded-sm px-4 py-3 text-[11px] font-bold tracking-widest text-brand-charcoal placeholder:text-gray-300 focus:outline-none transition-colors"
                />
                <button
                  onClick={handlePincodeUpdate}
                  disabled={pincodeChecking}
                  className="h-11 px-5 bg-brand-gold text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-brand-charcoal transition-colors disabled:opacity-60 flex items-center gap-2 rounded-sm flex-shrink-0"
                >
                  {pincodeChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update'}
                </button>
              </div>

              {/* Result */}
              {pincodeResult === 'invalid' && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">Please enter a valid 6-digit pincode</p>
              )}
              {pincodeResult === 'ok' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest">Pincode updated successfully</p>
                    {savedCity && <p className="text-[10px] font-bold text-brand-charcoal mt-0.5">{savedCity} — {savedPincode}</p>}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
