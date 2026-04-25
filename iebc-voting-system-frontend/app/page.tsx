'use client';

import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/ui/site-header';

export default function Home() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />

        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start">
          <Sidebar
            side="left"
            variant="sidebar"
            collapsible="icon"
            className="order-2 w-full rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm lg:order-1 lg:w-80 lg:flex-none"
          >
            <SidebarHeader className="mb-4 px-2">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Navigation
              </div>
            </SidebarHeader>
            <SidebarContent className="space-y-3 px-2">
              <SidebarMenu className="space-y-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">Home</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/auth/signIn">Sign In</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/auth/signUp">Sign Up</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/registration/registerVoter">Register to Vote</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto rounded-3xl bg-slate-100 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Fast, secure and accessible voting</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Sign in, register and verify voter details from one responsive dashboard.
              </p>
            </SidebarFooter>
          </Sidebar>

          <main className="order-1 flex-1 rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-200/40 lg:order-2 lg:p-10">
            <section className="space-y-6 text-center sm:text-left">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-700">IEBC Kenya</p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  Secure voter registration and biometric verification for Kenya
                </h1>
                <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                  A modern voter registration system built to support transparent elections, secure identity verification and citizen participation at scale.
                </p>
              </div>

              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
                <Link
                  href="/auth/signIn"
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Access Portal
                </Link>
                <Link
                  href="/auth/signUp"
                  className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Create Account
                </Link>
                <Link
                  href="/registration/registerVoter"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Register to Vote
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Biometric Identity</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Capture face embeddings during registration for secure voter identity verification without storing sensitive raw images.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Transparent Process</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Keep registration workflows simple and auditable, with clear steps for voters and election administrators.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Mobile-ready UI</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Responsive landing page and sidebar navigation ensure the platform works smoothly on phones and tablets.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Platform benefits</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Everything needed to register voters safely and transparently.</h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-slate-600">
                  Secure registration, biometric verification, and easy voter onboarding all in one responsive system designed for Kenyan election administration.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-slate-100 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold text-slate-900">IEBC Voting System</p>
            <p>Secure voter registration, biometric verification, and election transparency for Kenya.</p>
          </div>
          <p>© {new Date().getFullYear()} IEBC Voting System. All rights reserved.</p>
        </div>
      </footer>
    </SidebarProvider>
  );
}
