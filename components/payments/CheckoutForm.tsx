"use client";

import { useState } from "react";
import { Lock, CreditCard, ShieldCheck } from "lucide-react";

type CheckoutProps = {
  itemName: string;
  amount: number;
  returnTo: string;
  metadata?: Record<string, string | number>;
};

export function CheckoutForm({ itemName, amount, returnTo, metadata }: CheckoutProps) {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName,
          amount,
          returnTo,
          metadata
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Payment failed");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setProcessing(false);
      alert("Could not initialize payment. Please try again.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800 relative z-10 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secure Checkout</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Powered by Stripe</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border-2 border-teal-500 bg-teal-50/30 dark:bg-teal-900/10">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
              <div>
                <p className="font-semibold text-teal-900 dark:text-teal-100">Ready to complete your payment?</p>
                <p className="text-sm text-teal-700/70 dark:text-teal-400/70 mt-1">
                  You will be redirected to Stripe&apos;s secure payment page to complete your transaction safely.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white mb-1">Your privacy matters</p>
              <p>We never store your card details. All processing is handled by Stripe.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-linear-to-r from-teal-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-[1.01] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing...
                </>
              ) : (
                `Complete Payment for $${amount}`
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            By clicking the button, you will be redirected to Stripe to finalize your purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
