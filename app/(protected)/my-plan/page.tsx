import { Metadata } from "next";
import { Package, Check, ArrowRight, TrendingUp, Calendar as CalendarIcon, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "My Startawy Plan",
};

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { fulfillPayment } from "@/lib/payments/fulfillment";
import { PaymentSuccessToast } from "@/components/payments/PaymentSuccessToast";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

import { Suspense } from "react";
import { MyPlanSkeleton } from "@/components/plans/MyPlanSkeleton";

export default async function MyPlanPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  return (
    <div className="p-4 sm:p-8">
      {/* Toast Notifier for Payment Success */}
      <PaymentSuccessToast />

      {/* Header - Renders immediately */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">My Startawy Plan</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">Manage your subscription and explore upgrade options</p>
      </div>

      {/* Main Content with Suspense and Skeleton */}
      <Suspense fallback={<MyPlanSkeleton />}>
        <PlanContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function PlanContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) {
    redirect('/login');
  }

  // Handle Synchronous Verification after payment
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id as string;

  if (sessionId) {
    try {
      console.log(`[MY-PLAN] Verifying session: ${sessionId}`);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' || session.status === 'complete') {
        await fulfillPayment(session);
        console.log(`[MY-PLAN] Payment verified and fulfilled for session ${sessionId}`);
      }
    } catch (error) {
      console.error("[MY-PLAN] Session verification failed:", error);
    }
    // Add success parameter for the toast, and the new param will bust the cache
    redirect('/my-plan?success=true');
  }

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { founder: true }
  });

  if (!user || user.type !== 'FOUNDER' || !user.founder) {
    return <div className="p-8 text-center text-red-500">Access denied. Founders only.</div>;
  }

  // Fetch highest active subscription
  const latestPayment = await prisma.payment.findFirst({
    where: { 
      founderId: user.founder.id,
      subscription: { isNot: null }
    },
    orderBy: { transDate: 'desc' },
    include: { subscription: true }
  });

  const subscription = latestPayment?.subscription;
  const isActive = subscription?.status === 'ACTIVE' && new Date() < new Date(subscription.endDate);
  
  // Standardized plan name logic
  const planName = (() => {
    if (!isActive || (latestPayment?.amount || 0) === 0) return 'Free Trial';
    if ((latestPayment?.amount || 0) >= 299) return 'Premium';
    if ((latestPayment?.amount || 0) === 99) return 'Basic';
    return 'Free Trial';
  })();


  const dbPackages = await prisma.package.findMany({
    orderBy: { price: 'asc' }
  });

  const defaultPlans = dbPackages.map(pkg => {
    const isPremium = pkg.price >= 299;
    const isBasic = pkg.price === 99;
    
    return {
      id: pkg.id,
      name: pkg.type,
      price: `$${pkg.price}`,
      period: `/${pkg.duration}`,
      description: pkg.type === 'Premium' ? "Best for scaling businesses" : (pkg.type === 'Basic' ? "Ideal for growing startups" : "Perfect for exploring our platform"),
      features: pkg.description.split(',').map(f => f.trim()),
      color: isPremium ? "gold" : (isBasic ? "teal" : "gray"),
      isCurrent: isActive ? (planName === pkg.type) : (pkg.price === 0),
      recommended: isPremium
    };
  });

  const currentPlanDetails = defaultPlans.find(p => p.isCurrent) || defaultPlans[0];

  return (
    <>
      {/* Current Plan Card */}
      <div className="bg-linear-to-br from-teal-500 to-emerald-600 rounded-[24px] sm:rounded-[32px] shadow-2xl p-6 sm:p-10 text-white mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Package className="w-48 h-48 sm:w-64 sm:h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5">
                <Package className="w-4 h-4 text-teal-100" />
                <span className="text-teal-50 text-xs font-black uppercase tracking-widest">Current Plan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{currentPlanDetails.name} Plan</h2>
            </div>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter">{currentPlanDetails.price}</span>
              <span className="text-xl sm:text-2xl font-medium opacity-80">{currentPlanDetails.period}</span>
            </div>
          </div>
          <div className={`px-6 py-2 rounded-full text-xs font-black tracking-[0.2em] uppercase border shadow-lg ${isActive ? "bg-emerald-400/20 text-emerald-100 border-emerald-400/30" : "bg-red-400/20 text-red-100 border-red-400/30"}`}>
            {isActive ? "Active Subscription" : "Inactive Subscription"}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-teal-100/60 text-[10px] uppercase font-black tracking-widest mb-2">Started On</p>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-200" />
              <p className="font-bold text-lg leading-none">
                {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('en-GB') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <p className="text-teal-100/60 text-[10px] uppercase font-black tracking-widest mb-2">Next Billing</p>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-200" />
              <p className="font-bold text-lg leading-none">
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-GB') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <p className="text-teal-100/60 text-[10px] uppercase font-black tracking-widest mb-2">Usage Tracker</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-200" />
              <p className="font-bold text-lg leading-none">1 / 5 Used</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/plans"
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-teal-600 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all font-black shadow-xl shadow-teal-900/10"
          >
            Upgrade Plan
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-black border border-white/10 active:scale-[0.98]">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-12">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-6 text-center md:text-left tracking-tight">Available Premium Plans</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {defaultPlans.map((plan) => {
            const colorMap: Record<string, string> = {
              gray: "from-gray-500 to-gray-600",
              teal: "from-teal-500 to-teal-600",
              gold: "from-[#BF953F] via-[#FCF6BA] to-[#B38728]",
            };
            const gradient = colorMap[plan.color] || colorMap.teal;

            return (
              <div 
                key={plan.id} 
                className={`flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-0 transition-all duration-300 transform hover:-translate-y-1 ${
                  plan.isCurrent 
                    ? "ring-2 ring-teal-500 relative" 
                    : "border border-gray-100 dark:border-slate-800 hover:shadow-2xl relative"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-linear-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className={`bg-linear-to-r ${gradient} p-8 text-white rounded-t-3xl relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-[-20deg]"></div>
                  <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm opacity-90 mb-6 font-medium tracking-wide border-l-2 border-white/30 pl-3">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                    <span className="text-lg font-medium opacity-80">{plan.period}</span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-[0.2em] opacity-50">
                      Top Features
                    </h4>
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 group/item">
                          <div className={`mt-0.5 p-0.5 rounded-full ${plan.color === 'gold' ? 'bg-amber-100 text-amber-600' : 'bg-teal-50 text-teal-600'} dark:bg-slate-800 transition-colors`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    {plan.isCurrent ? (
                      <button className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-gray-500 rounded-2xl font-bold cursor-not-allowed border-2 border-dashed border-gray-200 dark:border-slate-700">
                        Current Active Plan
                      </button>
                    ) : (
                      <Link
                        href={`/payment?plan=${encodeURIComponent(plan.name)}`}
                        className={`block w-full text-center px-6 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-base ${
                          plan.color === 'gold'
                          ? "bg-linear-to-r from-[#BF953F] to-[#B38728] text-white hover:opacity-90"
                          : "bg-linear-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                        }`}
                      >
                        {plan.id > currentPlanDetails.id ? "Upgrade Now" : "Switch Plan"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
