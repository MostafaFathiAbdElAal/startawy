import { Check } from "lucide-react";
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
      "Budget analysis tools",
      "AI advisory chatbot",
      "Request marketing research template",
      "Email support",
    ],
    notIncluded: [
      "Private consultant sessions",
      "Financial performance dashboard",
      "One-year follow-up support",
    ],
    color: "teal",
    popular: true,
  },
  {
    name: "Premium",
    price: "$299",
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
    popular: false,
  },
];

export default async function PlansPage() {
  const dbPackages = await prisma.package.findMany();

  // If DB has packages, map them. Otherwise use realistic defaults.
  const plans = dbPackages.length > 0 ? dbPackages.map((pkg) => {
    // Attempt to match with default visual styles based on package type
    const basePlan = defaultPlans.find(p => p.name.toLowerCase() === pkg.type.toLowerCase()) || defaultPlans[1];
    
    return {
      ...basePlan,
      name: pkg.type,
      price: `$${pkg.price}`,
      period: `/${pkg.duration.toLowerCase()}`,
      description: pkg.description || basePlan.description,
    };
  }) : defaultPlans;

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
              <Link
                href={`/payment?plan=${encodeURIComponent(plan.name)}`}
                className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 block text-center ${
                  plan.popular
                    ? "bg-linear-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md hover:shadow-lg"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {plan.price === "$0" ? "Get Started" : "Subscribe Now"}
              </Link>

              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                  What&apos;s Included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={`not-${i}`} className="flex items-start gap-3 opacity-40">
                      <div className="w-5 h-5 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-gray-400 dark:text-gray-500 text-xs">✕</span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-through">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="max-w-3xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need a custom plan?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Contact our sales team for enterprise solutions and custom pricing tailored to your needs.
        </p>
        <button className="px-8 py-3 bg-white dark:bg-slate-900 border-2 border-teal-500 text-teal-600 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all font-semibold">
          Contact Sales
        </button>
      </div>

      {/* Money Back Guarantee */}
      <div className="max-w-3xl mx-auto mt-12 bg-linear-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">30-Day Money-Back Guarantee</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Try any paid plan risk-free. If you&apos;re not satisfied within the first 30 days,
          we&apos;ll refund your payment—no questions asked.
        </p>
      </div>
    </div>
  );
}
