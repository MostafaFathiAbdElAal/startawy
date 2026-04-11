import { Package, Check, ArrowRight, TrendingUp, Calendar as CalendarIcon, Star } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { fulfillPayment } from "@/lib/payments/fulfillment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export default async function MyPlanPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
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
    // Clean up the URL
    redirect('/my-plan');
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userPayload.id as string) },
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
  const planName = subscription?.trialType === 'TRIAL' ? 'Free Trial' : (latestPayment?.amount === 99 ? 'Basic' : 'Premium');
  const isActive = subscription?.status === 'ACTIVE' && new Date() < new Date(subscription.endDate);

  const defaultPlans = [
    {
      id: 1,
      name: "Free Trial",
      price: "$0",
      period: "/forever",
      description: "Perfect for exploring our platform",
      features: [
        "Limited access to reports",
        "Basic AI chatbot access",
        "Limited consultations",
        "Community support",
      ],
      color: "gray",
      isCurrent: !isActive || planName === "Free Trial",
      recommended: false,
    },
    {
      id: 2,
      name: "Basic",
      price: "$99",
      period: "/month",
      description: "Ideal for growing startups",
      features: [
        "Full access to market reports",
        "Budget analysis tools",
        "AI advisory chatbot",
        "Request marketing research template",
        "Email support",
        "Monthly financial reviews",
      ],
      color: "teal",
      isCurrent: isActive && planName === "Basic",
      recommended: false,
    },
    {
      id: 3,
      name: "Premium",
      price: "$299",
      period: "/month",
      description: "Best for scaling businesses",
      features: [
        "All Basic features",
        "Private consultant sessions",
        "Financial performance dashboard",
        "One-year follow-up support",
        "Dedicated account manager",
        "24/7 priority support",
        "Quarterly strategy sessions",
      ],
      color: "gold",
      isCurrent: isActive && planName === "Premium",
      recommended: true,
    },
  ];

  const currentPlanDetails = defaultPlans.find(p => p.isCurrent) || defaultPlans[0];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Startawy Plan</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription and explore upgrade options</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-linear-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-6 h-6" />
              <span className="text-teal-100 text-sm font-medium">Current Plan</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{currentPlanDetails.name} Plan</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">{currentPlanDetails.price}</span>
              <span className="text-xl">{currentPlanDetails.period}</span>
            </div>
          </div>
          <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-white/20">
          <div>
            <p className="text-teal-100 text-sm mb-1">Started</p>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <p className="font-semibold">
                {subscription?.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-teal-100 text-sm mb-1">Next Billing</p>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <p className="font-semibold">
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-teal-100 text-sm mb-1">Sessions This Month</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <p className="font-semibold">1 / 5 Used</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link 
            href="/plans"
            className="px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
          >
            Upgrade Plan
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-semibold">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Plans</h2>
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
    </div>
  );
}
