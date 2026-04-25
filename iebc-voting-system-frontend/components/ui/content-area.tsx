'use client';

import { ReactNode } from 'react';

interface ContentAreaProps {
  children: ReactNode;
}

export function ContentArea({ children }: ContentAreaProps) {
  return (
    <main className="flex-1 overflow-y-auto pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}
