'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { SiteHeader } from './site-header';

interface ContentAreaProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: ReactNode;
}

export function ContentArea({ sidebarOpen, setSidebarOpen, children }: ContentAreaProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white border-r border-slate-200 shadow-2xl shadow-slate-900/5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col justify-between overflow-hidden px-6 py-8 lg:px-8 lg:py-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-blue-700 text-base font-bold text-white">IEBC</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">IEBC Kenya</p>
                  <p className="text-xs text-slate-500">Secure digital voting platform</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden lg:block">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-blue-700 text-base font-bold text-white">IEBC</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">IEBC Kenya</p>
                  <p className="text-xs text-slate-500">Secure digital voting platform</p>
                </div>
              </Link>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Navigation</p>
              <nav className="mt-4 space-y-2">
                <Link
                  href="/"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Home
                </Link>
                <Link
                  href="/auth/signIn"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signUp"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Create Account
                </Link>
                <Link
                  href="/registration/registerVoter"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Register to Vote
                </Link>
              </nav>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-900">Fast, secure voting</p>
            <p className="mt-3">
              Secure voter onboarding with biometric verification and audit-ready workflows for Kenyan election administration.
            </p>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-col flex-1 lg:ml-80">
        <div className="fixed top-0 left-0 right-0 z-50 lg:left-80">
          <SiteHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <main className="flex-1 overflow-y-auto pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-50 lg:left-80 bg-slate-100 border-t border-slate-200 py-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-slate-900">IEBC Voting System</p>
              <p>Secure voter registration, biometric verification, and election transparency for Kenya.</p>
            </div>
            <p>© {new Date().getFullYear()} IEBC Voting System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

