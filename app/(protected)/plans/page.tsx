import { Metadata } from "next";
import { Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Service Plans",
};

import Link from "next/link";
import { prisma } from "@/lib/prisma";

const defaultPlans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "/forever",
    description: "Perfect for getting started",
    features: [
      "Limited access to reports",
      "Basic AI chatbot access",
      "Limited consultations",
    ],
    notIncluded: [
      "Full market reports",
      "Budget analysis tools",
      "Private consultant sessions",
      "Follow-up support",
    ],
    color: "gray",
    popular: false,
  },
  {
    name: "Basic",
    price: "$99",
    period: "/month",
    description: "Great for growing startups",
    features: [
      "Full access to market reports",
      "AI advisory chatbot",
      "Request marketing research template",
    ],
    notIncluded: [
      "Budget analysis tools",
      "Private consultant sessions",
      "Financial performance dashboard",
      "One-year follow-up support",
    ],
    color: "teal",
    popular: false,
  },
  {
    name: "Premium",
    price: "$200",
    period: "/month",
    description: "For serious entrepreneurs",
    features: [
      "All Basic features",
      "Private consultant sessions",
      "Financial performance dashboard",
      "One-year follow-up support",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom financial modeling",
    ],
    notIncluded: [],
    color: "purple",
    popular: true,
  },
];

import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

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
    isIncluded: (color: string) => color === 'purple' || color === 'gold' || color === 'gray',
  },
  {
    key: "budget",
    label: () => "Budget Analysis Tools",
    isIncluded: (color: string) => color === 'purple' || color === 'gold',
  },
  {
    key: "dashboard",
    label: () => "Financial Performance Dashboard",
    isIncluded: (color: string) => color === 'purple' || color === 'gold',
  },
  {
    key: "modeling",
    label: () => "Custom Financial Modeling",
    isIncluded: (color: string) => color === 'purple' || color === 'gold',
  },
  {
    key: "manager",
    label: () => "Dedicated Account Manager",
    isIncluded: (color: string) => color === 'purple' || color === 'gold',
  },
  {
    key: "support",
    label: () => "24/7 Priority Support",
    isIncluded: (color: string) => color === 'purple' || color === 'gold',
  }
];

export default async function PlansPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: {
      founder: {
        include: {
          payments: {
            where: { subscription: { isNot: null } },
            include: { subscription: true },
            orderBy: { transDate: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  const latestPayment = user?.founder?.payments?.[0];
  const subscription = latestPayment?.subscription;
  const isActive = subscription?.status === 'ACTIVE' && new Date() < new Date(subscription.endDate);
  
  const currentPlanName = (() => {
    if (!isActive) return 'Free Trial';
    const typeLower = latestPayment?.paymentType?.toLowerCase() || '';
    if (typeLower.includes('pro') || typeLower.includes('premium') || (latestPayment?.amount || 0) >= 200) {
      return 'Premium';
    }
    if (typeLower.includes('basic') || typeLower.includes('standard') || (latestPayment?.amount || 0) === 99) {
      return 'Basic';
    }
    return 'Free Trial';
  })();


  const dbPackages = await prisma.package.findMany();

  // If DB has packages, map them. Otherwise use realistic defaults.
  const plans = (dbPackages.length > 0 ? dbPackages.map((pkg) => {
    // Attempt to match with default visual styles based on package type robustly
    const typeLower = pkg.type.toLowerCase();
    const basePlan = defaultPlans.find(p => {
      const pNameLower = p.name.toLowerCase();
      if (typeLower.includes('premium') || typeLower.includes('pro')) {
        return pNameLower.includes('premium');
      }
      if (typeLower.includes('basic') || typeLower.includes('standard')) {
        return pNameLower.includes('basic');
      }
      if (typeLower.includes('free')) {
        return pNameLower.includes('free');
      }
      return false;
    }) || defaultPlans[1];
    
    const isPremium = typeLower.includes('premium') || typeLower.includes('pro');
    const isBasic = typeLower.includes('basic') || typeLower.includes('standard');
    
    // Treat Premium, Pro and Subscription as equivalent
    const isPremiumMatch = (currentPlanName.toLowerCase().includes('premium') || currentPlanName.toLowerCase() === 'pro' || currentPlanName.toLowerCase() === 'subscription') && isPremium;
    const isBasicMatch = (currentPlanName.toLowerCase().includes('basic') || currentPlanName.toLowerCase() === 'standard') && isBasic;
    const isFreeMatch = (currentPlanName.toLowerCase().includes('free') || currentPlanName.toLowerCase().includes('trial')) && (!isPremium && !isBasic);
    const isActivePlanMatch = isPremiumMatch || isBasicMatch || isFreeMatch || (currentPlanName.toLowerCase() === typeLower);
    
    return {
      ...basePlan,
      name: pkg.type,
      price: `$${pkg.price}`,
      period: `/${pkg.duration.toLowerCase()}`,
      description: pkg.description || basePlan.description,
      isCurrent: isActive && isActivePlanMatch
    };
  }) : defaultPlans.map(p => ({
    ...p,
    isCurrent: (p.name.toLowerCase() === currentPlanName.toLowerCase())
  })));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select the perfect plan for your startup&apos;s needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
              plan.popular ? "border-teal-500 dark:border-teal-500 relative" : "border-gray-200 dark:border-slate-800"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="bg-linear-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold py-2 text-center">
                ⭐ MOST POPULAR
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
              </div>

              {/* Subscribe Button */}
              {plan.isCurrent ? (
                <div className="w-full py-4 px-6 rounded-2xl font-black transition-all mb-8 block text-center bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 select-none">
                  Current Active Plan
                </div>
              ) : (
                <Link
                  href={`/payment?plan=${encodeURIComponent(plan.name)}`}
                  className={`w-full py-4 px-6 rounded-2xl font-black transition-all mb-8 block text-center shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transform-gpu will-change-transform ${
                    plan.popular
                      ? "bg-linear-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {plan.price === "$0" ? "Get Started" : "Subscribe Now"}
                </Link>
              )}

              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                  Features & Capabilities:
                </h4>
                <ul className="space-y-3">
                  {systemFeatures.map((feature, i) => {
                    const included = feature.isIncluded(plan.color);
                    const labelText = feature.label(plan.color);

                    return (
                      <li 
                        key={i} 
                        className={`flex items-start gap-3 transition-all ${
                          included ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        {included ? (
                          <div className="w-5 h-5 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <span className={`text-sm leading-relaxed ${
                          included 
                            ? 'text-gray-750 dark:text-gray-300 font-bold' 
                            : 'text-gray-500 dark:text-gray-500 font-medium line-through decoration-gray-300 dark:decoration-slate-800'
                        }`}>
                          {labelText}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
