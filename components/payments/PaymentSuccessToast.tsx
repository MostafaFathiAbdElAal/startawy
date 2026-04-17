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

      // Remove the ?success=true from the URL without triggering a hard reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams, showToast, router]);

  return null;
}
