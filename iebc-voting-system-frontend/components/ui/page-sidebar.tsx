'use client';

import Link from 'next/link';
import { X, LogIn, UserPlus } from 'lucide-react';
import { SignUpForm } from '@/app/auth/signUp/page';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 transform bg-white border-r border-slate-200 shadow-2xl shadow-slate-900/5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-green-600 text-base font-bold text-white">IEBC</div>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] p-0 border-none bg-transparent overflow-y-auto max-h-[90vh]">
                    <div className="p-1">
                      {/* Using SignUpForm as the current implementation for the account portal */}
                      <SignUpForm />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <UserPlus className="mr-2 h-4 w-4" /> Create Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] p-0 border-none bg-transparent overflow-y-auto max-h-[90vh]">
                    <div className="p-1">
                      <SignUpForm />
                    </div>
                  </DialogContent>
                </Dialog>
                <Link
                  href="/registration/registerVoter"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Register to Vote
                </Link>
                <Link
                  href="/registration/registerCandidate"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Register as Candidate
                </Link>
                <Link
                  href="/election/voteCasting"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cast Your Vote
                </Link>
                <Link 
                  href="/election/electionPosition"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Election Positions
                </Link>
                <Link
                  href="/election/electionType"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Election Types
                </Link>
                <Link
                  href="/election/elections"
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Elections
                </Link>
              </nav>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-900">Fast, secure voting</p>
            <p className="mt-3">
              Cast your vote and exercise your rights.
            </p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}
