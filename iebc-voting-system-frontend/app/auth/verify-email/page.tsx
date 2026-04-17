'use client'

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage(){
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("Verifying your email...");
    const [isVerifying, setIsVerifying] = useState(false);

    const verifyEmail = async () => {
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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? `${window.location.protocol}//${window.location.hostname}:5007`;
            const response = await axios.get(`${apiUrl}/api/auth/confirm-email`, {
                params: { token, email },
                timeout: 10000,
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
        verifyEmail();
    }, [searchParams]);

    return (
        <div className="p-20 text-center">
            <p className="text-xl font-bold">{status}</p>
            <button 
                onClick={verifyEmail} 
                disabled={isVerifying}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {isVerifying ? 'Verifying...' : 'Retry Verification'}
            </button>
        </div>
    )
}
