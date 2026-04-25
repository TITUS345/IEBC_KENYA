import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-200/20">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
        <SidebarTrigger className="rounded-full border border-slate-200 bg-white p-2 shadow-sm shadow-slate-100 sm:hidden" />

        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-3xl bg-blue-700 text-base font-bold text-white">IEBC</div>
          <div>
            <p className="text-base font-semibold text-slate-900">IEBC Kenya</p>
            <p className="text-xs text-slate-500">Secure digital voting platform</p>
          </div>
        </div>

        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <Link href="/auth/signIn" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign In
          </Link>
          <Button asChild size="sm" className="rounded-full px-4 py-2">
            <Link href="/auth/signUp">Create Account</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
