'use client';

import Link from 'next/link';

export function HeroSection() {
  return (
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
  );
}
