'use client';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 lg:left-80 bg-white border-t-4 border-t-green-600 py-3 lg:py-6">
      <div className="flex w-full flex-col gap-2 px-4 text-sm text-slate-600 sm:gap-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden lg:block">
          <p className="font-semibold text-slate-900">IEBC Voting System</p>
          <p>Secure voter registration, biometric verification, and election transparency for Kenya.</p>
        </div>
        <p>© {new Date().getFullYear()} IEBC Voting System. All rights reserved.</p>
      </div>
    </footer>
  );
}
