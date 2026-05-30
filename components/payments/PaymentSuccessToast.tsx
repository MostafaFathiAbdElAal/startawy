"use client";

import { useEffect } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { useRouter, useSearchParams } from "next/navigation";

export function PaymentSuccessToast() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      showToast({
        type: "success",
        title: "Payment Successful",
        message: "Your subscription has been updated successfully.",
      });

      // Remove the parameters from the URL without triggering a hard reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else if (searchParams.get("error")) {
      const errorType = searchParams.get("error");
      let message = "An error occurred during payment verification.";
      if (errorType === "unpaid") {
        message = "The payment session is not marked as paid.";
      } else if (errorType === "verification_failed") {
        message = "Could not verify your payment session with Stripe.";
      }
      
      showToast({
        type: "error",
        title: "Payment Failed",
        message: message,
      });

      // Remove the parameters from the URL without triggering a hard reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams, showToast, router]);

  return null;
}
