import { Metadata } from "next";
import { Package, Check, ArrowRight, TrendingUp, Calendar as CalendarIcon, Star, X } from "lucide-react";

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

const systemFeatures = [
  {
    key: "reports",
    label: (color: string) => color === 'gray' ? "Limited Access to Reports" : "Full Access to Market Reports",
    isIncluded: () => true,
  },
  {
    key: "chatbot",
    label: (color: string) => color === 'gray' ? "Basic AI Chatbot Access" : "Full AI Advisory Chatbot",
    isIncluded: () => true,
  },
  {
    key: "templates",
    label: (color: string) => color === 'gray' ? "Marketing Research Templates" : "Request Marketing Templates",
    isIncluded: (color: string) => color !== 'gray',
  },
  {
    key: "consultations",
    label: (color: string) => color === 'gray' ? "Limited Consultations" : "Private Consultant Sessions",
    isIncluded: (color: string) => color === 'gold' || color === 'gray',
  },
  {
    key: "budget",
    label: () => "Budget Analysis Tools",
    isIncluded: (color: string) => color === 'gold',
  },
  {
    key: "dashboard",
    label: () => "Financial Performance Dashboard",
    isIncluded: (color: string) => color === 'gold',
  },
  {
    key: "modeling",
    label: () => "Custom Financial Modeling",
    isIncluded: (color: string) => color === 'gold',
  },
  {
    key: "manager",
    label: () => "Dedicated Account Manager",
    isIncluded: (color: string) => color === 'gold',
  },
  {
    key: "support",
    label: () => "24/7 Priority Support",
    isIncluded: (color: string) => color === 'gold',
  }
];

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

        // If it's a Premium or PRO plan, redirect to consultant selection
        const planNameLower = session.metadata?.planName?.toLowerCase() || '';
        if (planNameLower.includes('premium') || planNameLower.includes('pro')) {
           redirect('/select-consultant');
        }
        
        // Successfully verified and fulfilled
        redirect('/my-plan?success=true');
      } else {
        console.warn(`[MY-PLAN] Session ${sessionId} is not paid (status: ${session.payment_status})`);
        redirect('/my-plan?error=unpaid');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) throw error;
      console.error("[MY-PLAN] Session verification failed:", error);
      redirect('/my-plan?error=verification_failed');
    }
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
    if (!isActive) return 'Free Trial';
    if (latestPayment?.paymentType) return latestPayment.paymentType;
    const amount = latestPayment?.amount || 0;
    if (amount >= 200) return 'Premium';
    if (amount >= 99) return 'Basic';
    return 'Free Trial';
  })();


  const dbPackages = await prisma.package.findMany({
    orderBy: { price: 'asc' }
  });

  const defaultPlans = dbPackages.map(pkg => {
    const typeLower = pkg.type.toLowerCase();
    const isPremium = typeLower.includes('premium') || typeLower.includes('pro');
    const isBasic = typeLower.includes('basic') || typeLower.includes('standard');
    
    // Treat Premium, Pro and Subscription as equivalent
    const isPremiumMatch = (planName.toLowerCase().includes('premium') || planName.toLowerCase() === 'pro' || planName.toLowerCase() === 'subscription') && isPremium;
    const isBasicMatch = (planName.toLowerCase().includes('basic') || planName.toLowerCase() === 'standard') && isBasic;
    const isFreeMatch = (planName.toLowerCase().includes('free') || planName.toLowerCase().includes('trial')) && (!isPremium && !isBasic);
    const isActivePlanMatch = isPremiumMatch || isBasicMatch || isFreeMatch || (planName.toLowerCase() === typeLower);

    return {
      id: pkg.id,
      name: pkg.type,
      price: `$${pkg.price}`,
      period: `/${pkg.duration}`,
      description: isPremium ? "Strategic Growth Blueprint" : (isBasic ? "Foundation Scaling Plan" : "Exploratory Trial Access"),
      features: (pkg.description || "").split(',').filter(f => f.trim()).map(f => f.trim()),
      color: isPremium ? "gold" : (isBasic ? "teal" : "gray"),
      isCurrent: isActive ? isActivePlanMatch : (pkg.price === 0),
      recommended: isPremium
    };
  });

  // Ensure we have a "Free Trial" fallback if database is empty or doesn't have $0 plan
  let currentPlanDetails = defaultPlans.find(p => p.isCurrent);
  
  if (!currentPlanDetails) {
    if (!isActive) {
       // Mock Free Trial if not in DB
       currentPlanDetails = {
         id: 0,
         name: "Free Trial",
         price: "$0",
         period: "/month",
         description: "Exploratory Trial Access",
         features: ["Basic Analytics", "Community Access"],
         color: "gray",
         isCurrent: true,
         recommended: false
       };
    } else {
       currentPlanDetails = defaultPlans[0];
    }
  }

  const colorGradients: Record<string, string> = {
    gray: "from-[#B8B8B8] to-[#989898]",
    teal: "from-teal-500 to-emerald-600",
    gold: "from-amber-400 via-amber-500 to-orange-600",
  };

  const currentGradient = colorGradients[currentPlanDetails.color] || colorGradients.teal;
  const isGray = currentPlanDetails.color === 'gray';
  const currentTextColor = isGray ? "text-slate-900" : "text-white";
  const badgeClass = isGray ? "bg-slate-900/10 text-slate-900/90 border-slate-900/20" : "bg-white/10 text-white/90 border-white/5";
  const iconClass = isGray ? "text-slate-900/80" : "text-white/80";
  const textMutedClass = isGray ? "text-slate-900/60" : "text-white/60";
  const borderClass = isGray ? "border-slate-900/10" : "border-white/10";

  return (
    <>
      {/* Current Plan Card */}
      <div className={`bg-linear-to-br ${currentGradient} rounded-[24px] sm:rounded-[32px] shadow-2xl p-6 sm:p-10 ${currentTextColor} mb-10 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Package className="w-48 h-48 sm:w-64 sm:h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${badgeClass}`}>
                <Package className={`w-4 h-4 ${iconClass}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Membership</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                {currentPlanDetails.name} {currentPlanDetails.color === 'gold' ? "Blueprint" : (currentPlanDetails.color === 'teal' ? "Plan" : "Trial")}
              </h2>
            </div>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter">{currentPlanDetails.price}</span>
              <span className="text-xl sm:text-2xl font-medium opacity-80">{currentPlanDetails.period}</span>
            </div>
          </div>
          <div className={`px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border shadow-lg ${isActive ? (isGray ? "bg-slate-900/10 text-slate-900 border-slate-900/20" : "bg-white/20 text-white border-white/30") : "bg-red-400/20 text-red-100 border-red-400/30"}`}>
            {isActive ? "Status: Active" : "Status: Inactive"}
          </div>
        </div>

        <div className={`relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b ${borderClass}`}>
          <div className="flex flex-col items-center md:items-start">
            <p className={`${textMutedClass} text-[10px] uppercase font-black tracking-widest mb-2`}>Activation Date</p>
            <div className="flex items-center gap-2">
              <CalendarIcon className={`w-4 h-4 ${iconClass}`} />
              <p className="font-bold text-lg leading-none">
                {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString('en-GB') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <p className={`${textMutedClass} text-[10px] uppercase font-black tracking-widest mb-2`}>Next Billing</p>
            <div className="flex items-center gap-2">
              <CalendarIcon className={`w-4 h-4 ${iconClass}`} />
              <p className="font-bold text-lg leading-none">
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-GB') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <p className={`${textMutedClass} text-[10px] uppercase font-black tracking-widest mb-2`}>Resource Usage</p>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${iconClass}`} />
              <p className="font-bold text-lg leading-none">Unlimited Access</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/plans"
            className={`flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl hover:scale-105 active:scale-[0.98] transition-[transform,shadow,background-color,border-color] duration-300 font-black shadow-xl ${isGray ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
          >
            Manage Subscription
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/my-payments"
            className={`flex-1 inline-flex items-center justify-center px-8 py-4 rounded-2xl transition-[transform,shadow,background-color,border-color] duration-300 font-black border active:scale-[0.98] ${isGray ? "bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 border-slate-900/10" : "bg-black/10 hover:bg-black/20 text-white border-white/10"}`}
          >
            View Billing History
          </Link>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-12">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-6 text-center md:text-left tracking-tight">System Upgrade Options</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {defaultPlans.map((plan) => {
            const gradient = colorGradients[plan.color] || colorGradients.teal;

            return (
              <div
                key={plan.id}
                className={`flex flex-col h-full bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border-0 transition-all duration-500 transform hover:-translate-y-2 ${plan.isCurrent
                    ? "ring-4 ring-teal-500/20 relative"
                    : "border border-slate-100 dark:border-slate-800 hover:shadow-2xl relative"
                  }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="flex items-center gap-1.5 px-6 py-2 bg-linear-to-r from-amber-400 to-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl whitespace-nowrap">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`bg-linear-to-br ${gradient} p-8 sm:p-10 text-white rounded-t-[32px] relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-[-20deg]"></div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">{plan.name}</h3>
                  <p className="text-xs opacity-90 mb-8 font-bold tracking-wide border-l-2 border-white/30 pl-3 uppercase">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                    <span className="text-lg font-medium opacity-80">{plan.period}</span>
                  </div>
                </div>

                <div className="p-8 sm:p-10 flex-1 flex flex-col">
                  <div className="mb-10">
                    <h4 className="font-black text-slate-400 mb-6 text-[10px] uppercase tracking-[0.2em]">
                      Features & Capabilities
                    </h4>
                    <ul className="space-y-4">
                      {systemFeatures.map((feature, index) => {
                        const included = feature.isIncluded(plan.color);
                        const labelText = feature.label(plan.color);

                        return (
                          <li 
                            key={index} 
                            className={`flex items-start gap-4 transition-all ${
                              included ? 'opacity-100 group/item' : 'opacity-40 group/item'
                            }`}
                          >
                            {included ? (
                              <div className={`mt-0.5 p-1 rounded-full ${
                                plan.color === 'gold' 
                                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' 
                                  : 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400'
                              } transition-all`}>
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="mt-0.5 p-1 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-600 transition-all">
                                <X className="w-3.5 h-3.5" strokeWidth={3} />
                              </div>
                            )}
                            <span className={`text-sm transition-colors ${
                              included 
                                ? 'text-slate-700 dark:text-slate-300 font-bold group-hover/item:text-slate-900 dark:group-hover/item:text-white' 
                                : 'text-slate-400 dark:text-slate-500 font-medium line-through decoration-slate-300 dark:decoration-slate-800'
                            }`}>
                              {labelText}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    {plan.isCurrent ? (
                      <div className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-center text-xs uppercase tracking-widest border-2 border-dashed border-slate-200 dark:border-slate-700">
                        Current Membership
                      </div>
                    ) : (
                      <Link
                        href={`/payment?plan=${encodeURIComponent(plan.name)}`}
                        className={`block w-full text-center px-6 py-5 rounded-2xl transition-[transform,shadow,background-color,border-color] duration-300 shadow-xl hover:shadow-2xl font-black text-sm uppercase tracking-widest transform-gpu will-change-transform ${plan.color === 'gold'
                            ? "bg-linear-to-r from-amber-400 to-orange-500 text-white hover:scale-105"
                            : "bg-linear-to-r from-teal-500 to-emerald-600 text-white hover:scale-105"
                          }`}
                      >
                        {plan.id > currentPlanDetails.id 
                          ? (plan.color === 'gold' ? "Upgrade Blueprint" : "Upgrade Plan") 
                          : "Switch Plan"}
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
