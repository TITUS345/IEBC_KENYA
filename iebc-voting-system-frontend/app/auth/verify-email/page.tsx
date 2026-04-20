'use client'

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("Verifying your email...");
    const [isVerifying, setIsVerifying] = useState(false);

    const verifyEmail = async (signal?: AbortSignal) => {
        if (isVerifying) return;
        setIsVerifying(true);

        const token = searchParams.get("token");
        const email = searchParams.get("email");
        if (!token || !email) {
            setStatus("Invalid verification link.");
            toast.error("Invalid link.");
            setIsVerifying(false);
            return;
        }

        try {
            const apiUrl = `/api/auth/confirm-email`;
            console.log(`[VERIFY-DEBUG]: Calling ${apiUrl} for ${email}`);
            const response = await axios.get(apiUrl, {
                params: { token, email },
                signal,
                timeout: 30000, // Increase to 30s
            });
            if (response.status === 200) {
                setStatus("Email verified successfully! Redirecting...");
                toast.success("Email verified successfully!");
                router.push("/auth/signIn");
            } else {
                setStatus("Verification failed. Link may be invalid or expired.");
                toast.error("Verification failed.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setStatus("Verification failed. Link may be invalid or expired.");
            toast.error("Verification failed.");
        } finally {
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        verifyEmail(controller.signal);

        return () => controller.abort();
    }, [searchParams]); // Re-verify if URL parameters change

    return (
        <div className="p-20 text-center">
            <p className="text-xl font-bold">{status}</p>
            <button 
                onClick={() => verifyEmail()} 
                disabled={isVerifying}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {isVerifying ? 'Verifying...' : 'Retry Verification'}
            </button>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center"><p className="text-xl font-bold">Loading...</p></div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
