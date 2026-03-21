'use client';

import React, { useRef, useEffect, useState } from 'react';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    error?: boolean;
}

export default function OTPInput({ value, onChange, length = 6, error = false }: OTPInputProps) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const [prevValue, setPrevValue] = useState(value);

    // Sync state with value prop when it changes externally (e.g., reset)
    if (value !== prevValue) {
        const valArray = value.split('').slice(0, length);
        const newOtp = new Array(length).fill('');
        valArray.forEach((char, i) => {
            newOtp[i] = char;
        });
        setOtp(newOtp);
        setPrevValue(value);
    }

    useEffect(() => {
        // Auto-focus first field on mount
        if (inputs.current[0]) {
            inputs.current[0].focus();
        }
    }, [length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const char = e.target.value.slice(-1); // Only take the last character
        if (!/^\d*$/.test(char)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);
        
        const combined = newOtp.join('');
        onChange(combined);

        // Move focus forward
        if (char && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // Focus previous if current is empty
                inputs.current[index - 1]?.focus();
                
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                onChange(newOtp.join(''));
            } else {
                // Clear current
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                onChange(newOtp.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, length);
        if (!/^\d+$/.test(data)) return;

        const newOtp = data.split('');
        const fullOtp = [...new Array(length)].map((_, i) => newOtp[i] || '');
        setOtp(fullOtp);
        onChange(fullOtp.join(''));

        // Focus the last filled input or the last input
        const nextIndex = Math.min(data.length, length - 1);
        inputs.current[nextIndex]?.focus();
    };

    return (
        <div className="flex justify-between gap-2 sm:gap-4" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
                <input
                    key={idx}
                    ref={(el) => { inputs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all outline-none
                        ${error 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
                        }
                    `}
                />
            ))}
        </div>
    );
}
