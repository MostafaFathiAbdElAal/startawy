import { Lock, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { CheckoutForm } from "@/components/payments/CheckoutForm";
import { prisma } from "@/lib/prisma";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  // Decide what are we paying for
  const isPlanPayment = !!resolvedParams.plan;
  const isConsultationPayment = !!resolvedParams.consultantId;
  
  let itemName = "Subscription Plan";
  let amount = 0;
  let returnTo = "/";
  const details = [];
  let metadata = {};

  if (isPlanPayment) {
    const planName = resolvedParams.plan as string;
    itemName = `${planName} Plan`;
    returnTo = "/my-plan";
    
    // Quick default lookup
    if (planName === "Basic") amount = 99;
    if (planName === "Premium") amount = 299;
    
    // Try to get real from DB
    const dbPkg = await prisma.package.findFirst({ where: { type: planName } });
    if (dbPkg) amount = dbPkg.price;
    
    details.push({ label: "Package", value: planName });
    details.push({ label: "Billing", value: "Monthly" });
    
    metadata = { type: 'subscription', planName };
    
  } else if (isConsultationPayment) {
    const consultantId = parseInt(resolvedParams.consultantId as string, 10);
    const date = resolvedParams.date as string;
    const time = resolvedParams.time as string;
    amount = parseFloat(resolvedParams.amount as string) || 150;
    returnTo = resolvedParams.returnTo as string || "/my-sessions";
    
    // Attempt to lookup consultant name
    let consultantName = "Consultant";
    if (!isNaN(consultantId)) {
      const dbCons = await prisma.consultant.findUnique({ where: { id: consultantId }, include: { user: true } });
      if (dbCons) consultantName = dbCons.user.name;
    }
    
    itemName = `Session with ${consultantName}`;
    details.push({ label: "Consultant", value: consultantName });
    if (date) details.push({ label: "Date", value: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
    if (time) details.push({ label: "Time", value: time });
    
    metadata = { type: 'consultation', consultantId, date, time };
  } else {
    // Fallback
    itemName = "Unknown Item";
    amount = 0;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-teal-50/20 to-blue-50/20 dark:from-slate-950 dark:via-teal-900/10 dark:to-blue-900/10 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <Link href="javascript:history.back()" className="font-medium">Back</Link>
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-2">Complete Your Payment</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Secure payment powered by Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-linear-to-br from-teal-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-teal-400/30">
                    <span className="text-teal-100">{detail.label}</span>
                    <span className="font-semibold text-right">{detail.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-4xl font-bold">
                    ${amount}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">What&apos;s Included:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-teal-200 shrink-0 mt-0.5" />
                    <span className="text-teal-50">{itemName}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="lg:col-span-3">
            <CheckoutForm 
              itemName={itemName} 
              amount={amount} 
              returnTo={returnTo} 
              metadata={metadata}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
