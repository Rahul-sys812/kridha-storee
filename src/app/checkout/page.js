"use client";
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, ArrowLeft, ArrowRight, CreditCard,
  ShoppingBag, Loader2, AlertCircle, Banknote, Smartphone, Wallet
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const inputClass =
  'w-full border border-gray-200 rounded-sm px-4 py-3 text-brand-charcoal text-sm font-medium tracking-wide placeholder:text-gray-400 focus:outline-none focus:border-brand-gold transition-colors duration-300 bg-white';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { userInfo } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [formData, setFormData] = useState({
    firstName: userInfo?.name?.split(' ')[0] || '',
    lastName: userInfo?.name?.split(' ')[1] || '',
    email: userInfo?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const tax = Math.round(cartTotal * 0.18);
  const shipping = cartTotal > 999 ? 0 : 99;
  const finalTotal = cartTotal + tax + shipping;

  const saveOrder = async (paymentInfo = {}) => {
    const token = localStorage.getItem('kridha_token');
    await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          product: item._id || null,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku || '',
        })),
        shippingAddress: formData,
        subtotal: cartTotal,
        tax,
        shippingCost: shipping,
        total: finalTotal,
        paymentMethod: paymentInfo.method || 'COD',
        razorpayOrderId: paymentInfo.razorpayOrderId || '',
        razorpayPaymentId: paymentInfo.razorpayPaymentId || '',
        shiprocketOrderId: paymentInfo.shiprocketOrderId || '',
        awbCode: paymentInfo.awbCode || '',
        trackingUrl: paymentInfo.trackingUrl || '',
      }),
    });
  };

  const handleCOD = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const shipRes = await fetch('/api/shiprocket/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: { formData, cartItems, finalTotal },
          paymentId: 'COD',
        }),
      });
      const shipData = await shipRes.json();
      await saveOrder({
        method: 'COD',
        shiprocketOrderId: shipData.orderId || '',
        awbCode: shipData.awbCode || '',
        trackingUrl: shipData.trackingUrl || '',
      });
      clearCart();
      const params = new URLSearchParams({
        paymentId: 'COD',
        orderId: shipData.orderId || '',
        awb: shipData.awbCode || '',
        tracking: shipData.trackingUrl || '',
      });
      router.push(`/order-confirmation?${params.toString()}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRazorpay = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Payment gateway failed to load.');

      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal, receipt: `rcpt_${Date.now()}` }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Could not initiate payment.');

      await new Promise((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Kridha Luxe',
          description: 'Boutique Jewellery Order',
          order_id: orderData.orderId,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          theme: { color: '#C5A059' },
          handler: async (response) => {
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (!verifyData.verified) throw new Error('Payment verification failed.');

              const shipRes = await fetch('/api/shiprocket/create-shipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  order: { formData, cartItems, finalTotal },
                  paymentId: response.razorpay_payment_id,
                }),
              });
              const shipData = await shipRes.json();

              await saveOrder({
                method: 'ONLINE',
                razorpayOrderId: orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                shiprocketOrderId: shipData.orderId || '',
                awbCode: shipData.awbCode || '',
                trackingUrl: shipData.trackingUrl || '',
              });

              clearCart();
              const params = new URLSearchParams({
                paymentId: response.razorpay_payment_id,
                orderId: shipData.orderId || '',
                awb: shipData.awbCode || '',
                tracking: shipData.trackingUrl || '',
              });
              router.push(`/order-confirmation?${params.toString()}`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) =>
          reject(new Error(resp.error?.description || 'Payment failed.'))
        );
        rzp.open();
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentMethod === 'cod') handleCOD();
    else handleRazorpay();
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center justify-center space-y-10 px-4">
        <div className="w-20 h-20 bg-brand-cream/50 rounded-full flex items-center justify-center opacity-30">
          <ShoppingBag className="w-10 h-10 text-brand-gold" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">Empty Portfolio</span>
        <h2 className="text-4xl font-serif font-light text-brand-charcoal uppercase tracking-tighter text-center">
          Your Collection <br /> is Currently Empty
        </h2>
        <button onClick={() => router.push('/collections')} className="luxury-btn">
          Explore Collections
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream/10 min-h-screen pt-40 pb-32">
      <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-7xl">

        <div className="mb-16 space-y-6">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Collections', href: '/collections' }, { label: 'Checkout' }]} />
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-brand-gold transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Boutique
          </button>
          <h1 className="text-4xl md:text-7xl font-serif font-light text-brand-charcoal uppercase tracking-tighter leading-none">
            Checkout <br />
            <span className="italic font-bold text-brand-gold opacity-50 text-3xl md:text-5xl">Registry</span>
          </h1>
          <div className="w-16 h-[1px] bg-brand-gold/40"></div>
        </div>

        {error && (
          <div className="mb-10 flex items-center gap-4 bg-red-50 border border-red-100 text-red-500 px-6 py-4 rounded-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* LEFT — Form */}
          <div className="lg:col-span-7 space-y-16">

            {/* Section I — Delivery Info */}
            <section className="space-y-8">
              <div className="flex items-center gap-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-gold">I</span>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-charcoal">Delivery Details</h2>
              </div>
              <form id="checkout-form" onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">First Name</label>
                  <input required name="firstName" type="text" value={formData.firstName} onChange={handleInputChange}
                    placeholder="Enter your first name" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Last Name</label>
                  <input required name="lastName" type="text" value={formData.lastName} onChange={handleInputChange}
                    placeholder="Enter your last name" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Email Address</label>
                  <input required name="email" type="email" value={formData.email} onChange={handleInputChange}
                    placeholder="Enter your email address" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Phone Number</label>
                  <input required name="phone" type="tel" value={formData.phone} onChange={handleInputChange}
                    placeholder="Enter your phone number" className={inputClass} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Full Address</label>
                  <input required name="address" type="text" value={formData.address} onChange={handleInputChange}
                    placeholder="Enter your full address" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">City</label>
                  <input required name="city" type="text" value={formData.city} onChange={handleInputChange}
                    placeholder="Enter your city" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">State</label>
                  <input required name="state" type="text" value={formData.state} onChange={handleInputChange}
                    placeholder="Enter your state" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Pincode</label>
                  <input required name="zip" type="text" value={formData.zip} onChange={handleInputChange}
                    placeholder="Enter your pincode" className={inputClass} />
                </div>
              </form>
            </section>

            {/* Section II — Payment Method */}
            <section className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-gold">II</span>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-charcoal">Payment</h2>
              </div>
              <p className="text-[9px] text-gray-400 tracking-widest -mt-2">All transactions are secure and encrypted.</p>

              <div className="border border-gray-200 rounded-sm overflow-hidden divide-y divide-gray-200">

                {/* Option 1 — Pay with UPI, Cards, Net Banking */}
                <button type="button" onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full text-left p-4 transition-all duration-200 ${paymentMethod === 'razorpay' ? 'bg-brand-gold/5' : 'bg-white hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'razorpay' ? 'border-brand-gold' : 'border-gray-300'}`}>
                      {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-brand-charcoal">Pay with UPI, Cards, Net Banking, etc.</span>
                    {/* Card logos */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* UPI */}
                      <span className="px-1.5 py-0.5 bg-[#097939] rounded text-white text-[7px] font-black tracking-wide">UPI</span>
                      {/* RuPay */}
                      <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[#097939] text-[7px] font-black">RuPay</span>
                      {/* Visa */}
                      <span className="px-1.5 py-0.5 bg-[#1A1F71] rounded text-white text-[7px] font-black italic">VISA</span>
                      {/* MC */}
                      <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[7px] font-black">
                        <span className="text-[#EB001B]">●</span><span className="text-[#F79E1B]">●</span>
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold">+more</span>
                    </div>
                  </div>
                  {/* Expanded info when selected */}
                  {paymentMethod === 'razorpay' && (
                    <div className="mt-3 ml-9 space-y-3">
                      <p className="text-[10px] text-gray-500">You'll be redirected to Razorpay to complete your purchase securely.</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'GPay', bg: 'bg-white border border-gray-200', color: 'text-[#4285F4] font-black' },
                          { label: 'PhonePe', bg: 'bg-[#5f259f]', color: 'text-white font-bold' },
                          { label: 'Paytm', bg: 'bg-[#00BAF2]', color: 'text-white font-bold' },
                          { label: 'VISA', bg: 'bg-[#1A1F71]', color: 'text-white font-black italic' },
                          { label: 'Mastercard', bg: 'bg-white border border-gray-200', color: 'text-[#EB001B] font-black' },
                          { label: 'RuPay', bg: 'bg-[#097939]', color: 'text-white font-bold' },
                          { label: 'Amex', bg: 'bg-[#2E77BC]', color: 'text-white font-bold' },
                          { label: 'Net Banking', bg: 'bg-gray-100 border border-gray-200', color: 'text-gray-700 font-bold' },
                          { label: 'EMI', bg: 'bg-gray-100 border border-gray-200', color: 'text-gray-700 font-bold' },
                        ].map((p) => (
                          <span key={p.label} className={`px-2.5 py-1 rounded text-[8px] tracking-wide ${p.bg} ${p.color}`}>
                            {p.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>

                {/* Option 2 — Cash on Delivery */}
                <button type="button" onClick={() => setPaymentMethod('cod')}
                  className={`w-full text-left p-4 transition-all duration-200 ${paymentMethod === 'cod' ? 'bg-brand-gold/5' : 'bg-white hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'cod' ? 'border-brand-gold' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />}
                    </div>
                    <span className="flex-1 text-sm font-medium text-brand-charcoal">Cash on Delivery (COD)</span>
                    <Banknote className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="mt-2 ml-9 text-[10px] text-gray-500">Pay in cash when your order is delivered to your doorstep.</p>
                  )}
                </button>

              </div>

              <div className="flex items-center gap-2 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold opacity-60" />
                <span className="text-[9px] text-gray-400 tracking-widest">256-bit SSL encrypted · Your data is safe</span>
              </div>
            </section>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-brand-charcoal p-10 rounded-sm shadow-2xl sticky top-32 space-y-10 border border-brand-gold/10">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/50 border-b border-white/10 pb-6">Order Summary</h2>
              <div className="space-y-8 max-h-[350px] overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center group">
                    <div className="w-20 h-20 bg-white/5 rounded-sm overflow-hidden flex-shrink-0 border border-white/10 p-1 group-hover:border-brand-gold transition-colors duration-700">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black">× {item.quantity}</p>
                    </div>
                    <div className="text-[11px] font-bold text-brand-gold tracking-widest shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 pt-10 border-t border-white/10">
                {[
                  { label: 'Subtotal', value: `₹${cartTotal.toLocaleString()}`, gold: false },
                  { label: 'GST (18%)', value: `₹${tax.toLocaleString()}`, gold: false },
                  { label: 'Delivery', value: shipping === 0 ? 'FREE' : `₹${shipping}`, gold: shipping === 0 },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em]">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={row.gold ? 'text-brand-gold' : 'text-white'}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-end pt-10 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">Total</span>
                <div className="text-right">
                  <div className="text-4xl font-serif font-bold text-brand-gold tracking-wider">₹{finalTotal.toLocaleString()}</div>
                  <div className="text-[8px] text-gray-500 uppercase tracking-[0.3em] mt-2 italic">Incl. all taxes</div>
                </div>
              </div>
              <button form="checkout-form" type="submit" disabled={isProcessing}
                className="luxury-btn w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </span>
                ) : paymentMethod === 'cod' ? (
                  <span className="flex items-center justify-center gap-3">
                    Place Order (COD) <ArrowRight className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Pay ₹{finalTotal.toLocaleString()} <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
              <div className="flex items-center justify-center gap-3 pt-4 opacity-30">
                <ShieldCheck className="w-3 h-3 text-white" />
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white">
                  {paymentMethod === 'cod' ? 'Pay on Delivery · Safe & Secure' : 'SSL Encrypted · Powered by Razorpay'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
