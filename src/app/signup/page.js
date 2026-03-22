"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, UserPlus, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/Breadcrumb';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Security keys do not match. Please verify.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'The sanctuary could not process your application at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-20 bg-brand-cream/20 flex items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[140px] -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-32 left-4 md:left-12 z-10">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Sign Up' }]} />
      </div>
      <div className="max-w-md w-full space-y-12 relative z-10 animate__animated animate__fadeIn">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-xl mb-4 border border-brand-cream animate__animated animate__zoomIn">
            <UserPlus className="w-6 h-6 text-brand-gold" strokeWidth={1.5} />
          </div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.5em] text-brand-gold">
            Apply for Membership
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-light text-brand-charcoal uppercase tracking-tighter leading-none">
            Join the <br /> <span className="italic font-bold">Circle</span>
          </h2>
          <div className="w-16 h-[1px] bg-brand-gold/40 mx-auto"></div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] text-center border border-red-100 animate__animated animate__shakeX">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={submitHandler}>
          <div className="space-y-8">
            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-1 mb-2 block">Full Name</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-sm px-4 py-3 bg-white focus-within:border-brand-gold transition-colors">
                  <User className="w-4 h-4 text-gray-300 group-focus-within:text-brand-gold transition-colors shrink-0" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-brand-charcoal font-medium focus:outline-none text-sm placeholder:text-gray-400" 
                    placeholder="Enter your full name" 
                  />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-1 mb-2 block">Email Address</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-sm px-4 py-3 bg-white focus-within:border-brand-gold transition-colors">
                  <Mail className="w-4 h-4 text-gray-300 group-focus-within:text-brand-gold transition-colors shrink-0" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-brand-charcoal font-medium focus:outline-none text-sm placeholder:text-gray-400" 
                    placeholder="Enter your email address" 
                  />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-1 mb-2 block">Password</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-sm px-4 py-3 bg-white focus-within:border-brand-gold transition-colors">
                  <Lock className="w-4 h-4 text-gray-300 group-focus-within:text-brand-gold transition-colors shrink-0" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-brand-charcoal font-medium focus:outline-none text-sm placeholder:text-gray-400" 
                    placeholder="Create a password" 
                  />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 ml-1 mb-2 block">Confirm Password</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-sm px-4 py-3 bg-white focus-within:border-brand-gold transition-colors">
                  <ShieldCheck className="w-4 h-4 text-gray-300 group-focus-within:text-brand-gold transition-colors shrink-0" />
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-brand-charcoal font-medium focus:outline-none text-sm placeholder:text-gray-400" 
                    placeholder="Confirm your password" 
                  />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="luxury-btn w-full h-14 flex items-center justify-center gap-4 group disabled:opacity-50 mt-4"
          >
            {loading ? 'PROCESSING APPLICATION...' : 'CREATE ACCOUNT'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
          </button>
        </form>

        <div className="text-center pt-10 border-t border-brand-cream">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">
            ALREADY PART OF THE CIRCLE?{' '}
            <Link href="/login" className="text-brand-gold hover:text-brand-charcoal transition-all ml-2 underline underline-offset-4">
               SIGN IN
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
