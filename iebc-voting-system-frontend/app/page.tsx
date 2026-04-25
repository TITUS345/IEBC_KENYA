'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SiteHeader } from '@/components/ui/site-header';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-slate-950 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:justify-between lg:border-r lg:border-slate-200 lg:px-6 lg:py-8 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-full flex-col justify-between px-6 py-8 lg:px-0 lg:py-0">
          <div className="space-y-8">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-blue-700 text-base font-bold text-white">IEBC</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">IEBC Kenya</p>
                  <p className="text-xs text-slate-500">Secure digital voting platform</p>
                </div>
              </Link>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Navigation</p>
              <nav className="space-y-2">
                <Link
                  href="/"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                >
                  Home
                </Link>
                <Link
                  href="/auth/signIn"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signUp"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                >
                  Create Account
                </Link>
                <Link
                  href="/registration/registerVoter"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                >
                  Register to Vote
                </Link>
              </nav>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 text-sm leading-6 text-slate-300">
              <p className="font-semibold text-white">Fast, secure voting</p>
              <p className="mt-3">
                Secure voter onboarding with biometric verification and audit-ready workflows for Kenyan election administration.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <div className="flex min-h-screen flex-1 flex-col lg:ml-0">
        <SiteHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-950 to-blue-900 text-white shadow-2xl shadow-slate-900/20">
              <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.25fr_0.95fr] lg:px-12 lg:py-16">
                <div className="space-y-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">IEBC Kenya</p>
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    Secure voter registration and biometric verification built for modern elections
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                    A modern platform for transparent voter registration, secure identity verification, and streamlined election administration across Kenya.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Link
                      href="/auth/signIn"
                      className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      Access Portal
                    </Link>
                    <Link
                      href="/auth/signUp"
                      className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Create Account
                    </Link>
                    <Link
                      href="/registration/registerVoter"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Register to Vote
                    </Link>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-8 text-slate-100 backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Platform snapshot</p>
                  <div className="mt-6 space-y-5">
                    <div className="rounded-3xl bg-slate-950/70 p-5">
                      <p className="font-semibold text-white">Biometric Identity</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Capture face embeddings during registration for secure voter identity verification without storing raw images.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/70 p-5">
                      <p className="font-semibold text-white">Transparent Process</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Audit-ready workflows for registration and election administration with clear, modern UX.
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/70 p-5">
                      <p className="font-semibold text-white">Mobile-ready</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        A responsive interface that adapts to phones, tablets and desktop operations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Built for Kenya</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Designed to support secure voter registration and biometric verification with local election needs in mind.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Modern UX</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Clear navigation, actionable buttons and a polished layout improve usability for voters and administrators.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Secure workflows</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Biometric onboarding, role-based access, and election transparency help build trust across the voting process.
                </p>
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t border-slate-200 bg-slate-100 py-6">
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
