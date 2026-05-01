'use client';

import { useToast } from "@/components/providers/ToastProvider";
import { useCallback } from "react";

export function useSafeFetch() {
    const { showToast } = useToast();

    const safeFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
        try {
            const response = await fetch(input, init);

            if (response.status === 503) {
                showToast({
                    type: 'warning',
                    title: 'Server Busy',
                    message: 'The system is experiencing high traffic. Please try again shortly.',
                    duration: 5000
                });
            }

            return response;
        } catch (error) {
            // Handle network errors if needed
            console.error("Fetch error:", error);
            throw error;
        }
    }, [showToast]);

    return { safeFetch };
}
