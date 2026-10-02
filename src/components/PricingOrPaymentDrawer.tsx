'use client';

import React, { useState, useEffect } from 'react';

interface PricingOrPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Plan = 'credits_10' | 'pro_monthly';
type Gateway = 'razorpay' | 'paypal';
type Status = 'idle' | 'loading' | 'success' | 'error';

const PLANS = {
  credits_10: {
    id: 'credits_10',
    title: '10 Premium Scans',
    price: '$4.99',
    priceInr: '₹399',
    description: 'Perfect for a single job hunt. Non-expiring credits.',
    features: ['10 Deep AI Scans', 'Formatting Risk Analysis', 'Priority Queue', 'Save Results for 30 Days'],
  },
  pro_monthly: {
    id: 'pro_monthly',
    title: 'Pro Monthly',
    price: '$12.00',
    priceInr: '₹999',
    description: 'Unlimited scans and advanced market insights.',
    features: ['Unlimited AI Scans', 'Market Missing-Keywords Data', 'Cover Letter Generation', 'Email Support'],
  },
};

export default function PricingOrPaymentDrawer({ isOpen, onClose }: PricingOrPaymentDrawerProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('credits_10');
  const [gateway, setGateway] = useState<Gateway>('razorpay');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Lock body scroll and handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 300);
    }
  }, [isOpen]);

  // Dynamically load Razorpay SDK
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      if (gateway === 'razorpay') {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          throw new Error('Failed to load payment gateway. Please check your connection.');
        }

        // In a real app, you would fetch this order configuration from your /api/create-order route
        // const res = await fetch('/api/create-order', { method: 'POST', body: JSON.stringify({ plan: selectedPlan }) });
        // const orderDetails = await res.json();

        // Simulated API Delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
          amount: selectedPlan === 'credits_10' ? 39900 : 99900, // paise
          currency: 'INR',
          name: 'ATS Scanner Pro',
          description: PLANS[selectedPlan].title,
          image: '/apple-icon.png',
          // order_id: orderDetails.id, // Replace with actual order ID from backend
          handler: function (response: any) {
            // Verify signature on backend here via /api/verify-payment
            setStatus('success');
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#3B82F6', // Blue-500
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setStatus('error');
          setErrorMessage(response.error.description || 'Payment failed. Please try again.');
        });
        rzp.open();
        
        // Reset loading state so user can click again if they close the modal
        setStatus('idle');

      } else if (gateway === 'paypal') {
        // PayPal Logic: usually redirect to PayPal hosted checkout or load PayPal JS SDK buttons
        // Simulated API Delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        throw new Error('PayPal integration is currently in sandbox mode. Please use Razorpay.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full glass-card-elevated sm:rounded-l-3xl p-6 sm:p-8 overflow-y-auto transform transition-transform duration-300 animate-slide-in-right shadow-2xl shadow-blue-900/20 border-l border-white/10">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in pb-20">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black font-syne text-white mb-3">Payment Successful!</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Your account has been upgraded. You can now access all premium features and deep scans.
            </p>
            <button onClick={onClose} className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold">
              Return to Scanner
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="mb-8 pr-8">
              <span className="badge mb-3 inline-flex">Upgrade</span>
              <h2 id="drawer-title" className="text-2xl font-black font-syne text-white mb-2">
                Unlock Premium Insights
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Get past the applicant tracking systems with deep AI formatting checks and tailored missing-keyword analysis.
              </p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-4 mb-8">
              {Object.values(PLANS).map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as Plan)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    selectedPlan === plan.id 
                      ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-bold text-white font-syne">{plan.title}</h3>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">{plan.price}</span>
                      <span className="text-xs text-slate-500 block">or {plan.priceInr}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{plan.description}</p>
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="mt-auto">
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Payment Method
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGateway('razorpay')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      gateway === 'razorpay'
                        ? 'bg-blue-500/10 border-blue-500/40 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm font-semibold">Razorpay / UPI</span>
                  </button>
                  <button
                    onClick={() => setGateway('paypal')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      gateway === 'paypal'
                        ? 'bg-blue-500/10 border-blue-500/40 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm font-semibold">PayPal</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="flex items-start gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-300 leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={status === 'loading'}
                className="btn-primary w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing Securely...
                  </>
                ) : (
                  <>
                    Pay {gateway === 'razorpay' ? PLANS[selectedPlan].priceInr : PLANS[selectedPlan].price}
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-slate-500 text-center mt-4">
                Secure checkout provided by {gateway === 'razorpay' ? 'Razorpay' : 'PayPal'}. Cancel anytime.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure TypeScript knows about Razorpay on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}