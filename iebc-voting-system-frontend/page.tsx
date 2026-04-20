'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyToken = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) setStatus('success');
        else setStatus('error');
      } catch (err) {
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === 'loading' && <p>Verifying your email, please wait...</p>}
      {status === 'success' && <p className="text-green-600">Email verified successfully!</p>}
      {status === 'error' && <p className="text-red-600">Verification failed or request timed out.</p>}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Initializing verification...</div>}>
      <VerificationContent />
    </Suspense>
  );
}