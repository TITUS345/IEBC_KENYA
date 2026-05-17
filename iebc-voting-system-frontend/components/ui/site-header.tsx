"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SignInForm } from "@/app/auth/signIn/page"
import { SignUpForm } from "@/app/auth/signUp/page"

interface SiteHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function SiteHeader({ sidebarOpen, setSidebarOpen }: SiteHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-200/20">
      <div className="flex w-full flex-col gap-2 px-4 py-2 sm:gap-3 sm:py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3 ">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {!sidebarOpen && (
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-green-600 text-base font-bold text-white">IEBC</div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">IEBC Kenya</p>
                <p className="text-xs text-slate-500">Secure digital voting platform</p>
              </div>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-600 transition hover:border-green-300 hover:bg-green-50"
              >
                Sign In
              </Button>
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
              <Button size="sm" className="rounded-full px-4 py-2 bg-green-600 hover:bg-green-700">
                Create Account
              </Button>
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
        </div>
      </div>
    </header>
  )
}
