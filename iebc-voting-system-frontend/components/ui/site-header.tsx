import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface SiteHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function SiteHeader({ sidebarOpen, setSidebarOpen }: SiteHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-200/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3 ml-1">
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

        <div className="flex flex-wrap items-start ml-auto gap-3">
          <Link
            href="/auth/signIn"
            className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-600 transition hover:border-green-300 hover:bg-green-50"
          >
            Sign In
          </Link>
          <Button asChild size="sm" className="rounded-full px-4 py-2 bg-green-600 hover:bg-green-700">
            <Link href="/auth/signUp">Create Account</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

