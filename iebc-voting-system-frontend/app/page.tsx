'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/page-sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { ContentArea } from '@/components/ui/content-area';
import { Footer } from '@/components/ui/footer';
import { HeroSection } from '@/components/ui/hero-section';
import { FeaturesSection } from '@/components/ui/features-section';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-row min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 lg:ml-80">
        <div className="fixed top-0 left-0 right-0 z-50 lg:left-80">
          <SiteHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <ContentArea>
          <HeroSection />
          <FeaturesSection />
        </ContentArea>

        <Footer />
      </div>
    </div>
  );
}
