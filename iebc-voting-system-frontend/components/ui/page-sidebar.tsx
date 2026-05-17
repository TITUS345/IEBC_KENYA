'use client';

import Link from 'next/link';
import { 
  X, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, // Added for Admin Dashboard link
  UserCheck,
  Users, 
  Landmark, 
  Vote, 
  Briefcase, 
  Layers, 
  Calendar, 
  ShieldCheck 
} from 'lucide-react';
import { SignUpForm } from '@/app/auth/signUp/page';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import RegisterCandidatePage from '@/app/registration/registerCandidate/page';
import RegisterVoter from '@/app/registration/registerVoter/page';
import CastVotePage from '@/app/election/voteCasting/page';
import { RoleForm } from '@/app/roles/page';
import PartiesDirectoryPage from '@/app/election/electionParty/parties/page';
import ElectionPositionsDirectoryPage from '@/app/election/electionPosition/positions/page';
import ExistingElectionsPage from '@/app/election/elections/existingElections/page';
import ExistingElectionTypesPage from '@/app/election/electionType/existingElectionTypes/page';
import { SignInForm } from '@/app/auth/signIn/page';

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
        <div className="flex h-full flex-col justify-between px-6 py-8 lg:px-8 lg:py-10">
          <div className="flex flex-1 flex-col min-h-0 space-y-8">
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

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 no-scrollbar">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Navigation</p>
              <nav className="mt-4 space-y-2">
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Home
                </Link>
                <Link
                  href="/adminDashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-none sm:max-w-lg lg:max-w-xl">
                    <DialogHeader className="p-4 bg-white rounded-t-xl border-b">
                      <DialogTitle>Sign In to Your Account</DialogTitle>
                      <DialogDescription>
                        Enter your credentials to access the voting system.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-1 overflow-y-auto max-h-[80vh]">
                      <SignInForm />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <UserPlus className="mr-2 h-4 w-4" /> Create Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-none sm:max-w-xl lg:max-w-2xl">
                    <DialogHeader className="p-4 bg-white rounded-t-xl border-b">
                      <DialogTitle>Create Your Account</DialogTitle>
                      <DialogDescription>
                        Register your details for the IEBC Voting System.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-1 overflow-y-auto max-h-[80vh]">
                      <SignUpForm />
                    </div>
                  </DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <UserCheck className="mr-2 h-4 w-4" /> Register as Candidate
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto">
                    <SheetHeader className="p-4 bg-white rounded-t-xl border-b">
                      <SheetTitle>Register as Candidate</SheetTitle>
                      <SheetDescription>
                        Provide your details to register as a candidate for elective positions.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-1">
                      <RegisterCandidatePage />
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <Users className="mr-2 h-4 w-4" /> Register to Vote
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto">
                    <SheetHeader className="p-4 bg-white rounded-t-xl border-b">
                      <SheetTitle>Register to Vote</SheetTitle>
                      <SheetDescription>
                        Complete your biometric registration to participate in upcoming elections.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-1">
                      <RegisterVoter />
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <Landmark className="mr-2 h-4 w-4" /> Political Parties
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto">
                    <SheetHeader className="p-4 bg-white rounded-t-xl border-b">
                      <SheetTitle>Political Parties</SheetTitle>
                      <SheetDescription>
                        View information regarding registered political parties.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-1">
                      <PartiesDirectoryPage />
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <Vote className="mr-2 h-4 w-4" /> Cast Your Vote
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto">
                    <SheetHeader className="p-4 bg-white rounded-t-xl border-b">
                      <SheetTitle>Cast Your Vote</SheetTitle>
                      <SheetDescription>
                        Securely cast your vote for the active elections.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-1">
                      <CastVotePage />
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <Briefcase className="mr-2 h-4 w-4" /> Election Positions
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto">
                    <SheetHeader className="p-4 bg-white rounded-t-xl border-b">
                      <SheetTitle>Election Positions</SheetTitle>
                      <SheetDescription>
                        View available elective positions.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-1">
                      <ElectionPositionsDirectoryPage/>
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <Layers className="mr-2 h-4 w-4" /> Election Types
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto">
                    <SheetHeader className="p-4 bg-white rounded-t-xl border-b">
                      <SheetTitle>Election Types</SheetTitle>
                      <SheetDescription>
                        Manage and view different categories of elections.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-1">
                      <ExistingElectionTypesPage/>
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <Calendar className="mr-2 h-4 w-4" /> Elections
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto">
                    <SheetHeader className="p-4 bg-white rounded-t-xl border-b">
                      <SheetTitle>Elections</SheetTitle>
                      <SheetDescription>
                        Overview of active and scheduled elections.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-1">
                      <ExistingElectionsPage />
                    </div>
                  </SheetContent>
                </Sheet>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" className="flex h-auto w-full items-center justify-start rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <ShieldCheck className="mr-2 h-4 w-4" /> Roles
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-none max-w-md">
                    <DialogHeader className="p-4 bg-white rounded-t-xl border-b">
                      <DialogTitle>Roles</DialogTitle>
                      <DialogDescription>
                        Manage system user roles and access permissions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-1 overflow-y-auto max-h-[80vh]">
                      <RoleForm />
                    </div>
                  </DialogContent>
                </Dialog>
              </nav>
            </div>
          </div>

          <div className="mt-8 shrink-0 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
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
