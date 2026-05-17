'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SignInForm } from "@/app/auth/signIn/page"
import { SignUpForm } from "@/app/auth/signUp/page"
import RegisterVoter from "@/app/registration/registerVoter/page"

export function HeroSection() {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-950 to-green-900 text-white shadow-2xl shadow-slate-900/20">
      <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.25fr_0.95fr] lg:px-12 lg:py-16">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-green-300">IEBC Kenya</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Secure voter registration and biometric verification built for modern elections
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            A modern platform for transparent voter registration, secure identity verification, and streamlined election administration across Kenya.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600">
                  Access Portal
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 border-none sm:max-w-lg lg:max-w-xl">
                <DialogHeader className="p-4 bg-white rounded-t-xl border-b">
                  <DialogTitle>Sign In to Your Account</DialogTitle>
                  <DialogDescription>Enter your credentials to access the voting system.</DialogDescription>
                </DialogHeader>
                <div className="p-1 overflow-y-auto max-h-[80vh]">
                  <SignInForm />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
                  Create Account
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 border-none sm:max-w-xl lg:max-w-2xl">
                <DialogHeader className="p-4 bg-white rounded-t-xl border-b">
                  <DialogTitle>Create Your Account</DialogTitle>
                  <DialogDescription>Register your details for the IEBC Voting System.</DialogDescription>
                </DialogHeader>
                <div className="p-1 overflow-y-auto max-h-[80vh]">
                  <SignUpForm />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                  Register to Vote
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 border-none sm:max-w-4xl lg:max-w-5xl">
                <DialogHeader className="p-4 bg-white rounded-t-xl border-b">
                  <DialogTitle>Voter Registry</DialogTitle>
                  <DialogDescription>
                    Enroll and manage eligible voters with biometric security.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 overflow-y-auto max-h-[85vh]">
                  <RegisterVoter />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-8 text-slate-100 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-green-200">Platform snapshot</p>
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
