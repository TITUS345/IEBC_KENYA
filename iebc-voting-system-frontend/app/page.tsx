'use client';

import Link from 'next/link';
import SignUpPage from './auth/signUp/page';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-blue-900 mb-4 text-center">
        IEBC Kenya Voting System
      </h1>
      <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
        Welcome to the official digital voting platform. Please sign in to cast your vote securely.
      </p>
      <div className='flex flex-row g-4'>
        <Link 
        href="/auth/signIn"
        className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors mb-8"
      >
        Access Portal
      </Link>
      <Link 
        href="/registration/registerVoter"
        className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors mb-8"
      >
        Access Portal
      </Link>
        
      </div>
      <SignUpPage />
    </div>
  );
}
