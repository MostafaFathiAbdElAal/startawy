"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, FileText } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

type ConsultantProps = {
  id: number;
  name: string;
  title: string;
  avatar: string;
  specialization: string;
  rating: number;
  sessionsCompleted: number;
  hourlyRate: number;
};

export function BookingForm({ consultant }: { consultant: ConsultantProps }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate dynamic available dates for the next 7 days starting from tomorrow
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const availableTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: consultant.hourlyRate,
          itemName: `Session with ${consultant.name}`,
          returnTo: "/my-sessions",
          metadata: {
            type: 'consultation',
            consultantId: consultant.id,
            date: selectedDate,
            time: selectedTime,
            notes: notes
          }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to initiate booking");
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[BOOKING_ERROR]", error);
      setIsProcessing(false);
      showToast({
        type: "error",
        title: "Booking Failed",
        message: error.message || "Something went wrong while initiating your booking."
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Schedule Your Session
      </h2>

      <div className="space-y-8">
        {/* Date Selection */}
        <div>
          <label className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Select a Date
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableDates.map((date) => {
              const dateObj = new Date(date);
              const dayName = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const dayNumber = dateObj.getDate();
              const monthName = dateObj.toLocaleDateString("en-US", {
                month: "short",
              });

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedDate === date
                      ? "border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                      : "border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 bg-white dark:bg-slate-800"
                  }`}
                >
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {dayName}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dayNumber}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {monthName}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Select a Time
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {availableTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                disabled={!selectedDate}
                className={`py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                  selectedTime === time
                    ? "border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                    : "border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {time}
              </button>
            ))}
          </div>
          {!selectedDate && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Please select a date first
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific topics or questions you&apos;d like to discuss..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Help your consultant prepare by sharing what you&apos;d like to focus on
          </p>
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Booking Summary
            </h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <strong className="text-gray-900 dark:text-white">Consultant:</strong> {consultant.name}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Date:</strong>{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Time:</strong> {selectedTime}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Duration:</strong> 1 Hour
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Rate:</strong> ${consultant.hourlyRate}/session
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handleBookSession}
            disabled={!selectedDate || !selectedTime || isProcessing}
            className="flex-1 px-8 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Confirm & Pay"
            )}
          </button>
          <button 
            type="button"
            onClick={() => router.back()}
            disabled={isProcessing}
            className="px-8 py-4 border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
