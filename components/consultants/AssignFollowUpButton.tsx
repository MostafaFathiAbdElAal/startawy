'use client';

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { UserCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AssignFollowUpButtonProps {
    consultantId: number;
    consultantName: string;
    isCurrentlyAssigned: boolean;
}

export default function AssignFollowUpButton({ consultantId, consultantName, isCurrentlyAssigned }: AssignFollowUpButtonProps) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleAssign = async () => {
        if (isCurrentlyAssigned) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/founder/follow-up', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consultantId })
            });

            const result = await res.json();

            if (result.success) {
                showToast({
                    type: "success",
                    title: "Consultant Assigned",
                    message: `${consultantName} is now your follow-up consultant for 1 year.`
                });
                router.push('/dashboard');
                router.refresh();
            } else {
                showToast({
                    type: "error",
                    title: "Assignment Failed",
                    message: result.error || "Could not assign consultant."
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Error",
                message: "An unexpected error occurred."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleAssign}
            disabled={loading || isCurrentlyAssigned}
            className={`flex-1 px-4 py-3 rounded-xl transition-all font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                isCurrentlyAssigned 
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                : "bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700"
            }`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    <UserCheck className="w-4 h-4" />
                    {isCurrentlyAssigned ? "Your Consultant" : "Select for 1-Year Follow-up"}
                </>
            )}
        </button>
    );
}
