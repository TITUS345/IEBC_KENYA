'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import {
  HomeIcon,
  UsersIcon,
  ListTreeIcon,
  CalendarDaysIcon,
  LandmarkIcon,
  UserCheckIcon,
  UserPlusIcon,
  SettingsIcon,
  BarChart3Icon,
  Loader2,
  Search,
  Bell,
  ShieldCheck,
  LogOut,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleForm } from '@/app/roles/page';
import { AnalyticsSection } from '@/components/ui/analytics-section';
import ManageElections from '../election/elections/page';
import ElectionTypes from '../election/electionType/page';
import ElectionPositions from '../election/electionPosition/page';
import PartyManagementPage from '../election/electionParty/page';
import RegisterVoter from '../registration/registerVoter/page';
import UserManagementPage from '../auth/manageUser/page';
import RegisterCandidatePage from '../registration/registerCandidate/page';
import Link from 'next/link';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    activeElections: 0,
    totalVoters: 0,
    totalCandidates: 0,
    totalParties: 0
  });
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [votersRes, candidatesRes, partiesRes, electionsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/voter/getAllVoters`),
          axios.get(`${apiUrl}/api/candidate/getAllCandidates`),
          axios.get(`${apiUrl}/api/party/getAllParties`),
          axios.get(`${apiUrl}/api/elections/getAllElections`)
        ]);

        setStats({
          totalVoters: votersRes.data.length,
          totalCandidates: candidatesRes.data.length,
          totalParties: partiesRes.data.length,
          activeElections: electionsRes.data.filter((e: any) => e.status === 'Ongoing').length
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      <p className="text-sm text-slate-400 font-medium italic">Generating insights...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-green-700/5 border-green-700/20 border-t-4 border-t-green-700 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none">Active Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.activeElections}</div>
            <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold">Ongoing live events</p>
          </CardContent>
        </Card>
        <Card className="bg-green-600/5 border-green-600/20 border-t-4 border-t-green-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none">Registered Voters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.totalVoters.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold italic font-mono">Live Registry Count</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-600/5 border-blue-600/20 border-t-4 border-t-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.totalCandidates}</div>
            <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold">Verified applicants</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest leading-none">Political Parties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.totalParties}</div>
            <p className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold italic font-mono">Registered Entities</p>
          </CardContent>
        </Card>
      </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2 px-6 pt-4">
          <RefreshCcw className="h-4 w-4 text-green-600" />
          Real-time Election Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-1 overflow-hidden">
           <AnalyticsSection />
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

const PlaceholderView = ({ title, description }: { title: string, description: string }) => (
  <div className="p-1 border rounded-xl bg-card border-t-8 border-t-green-700 shadow-lg">
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
      <div className="h-[400px] rounded-lg border-2 border-dashed flex items-center justify-center">
        <p className="text-sm text-muted-foreground italic">Management UI for {title} (Delete/Update operations)</p>
      </div>
    </div>
  </div>
);

const components = {
  overview: <DashboardOverview />,
  roles: <RoleForm />,
  electionParties: <PartyManagementPage/>,
  electionPositions: <ElectionPositions/>,
  elections: <ManageElections/>,
  electionTypes: <ElectionTypes/>,
  manageUsers: <UserManagementPage />,
  voters: <RegisterVoter />,
  candidates: <RegisterCandidatePage/>,
  analytics: <div className="p-1 border rounded-xl bg-card border-t-8 border-t-green-700 shadow-lg overflow-hidden"><AnalyticsSection /></div>,
};

type ComponentKey = keyof typeof components;

export default function AdminDashboardPage() {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('overview');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50 text-foreground">
        {/* Sidebar */}
        <Sidebar className="border-r shadow-none" showCloseButton={false}>
          <SidebarHeader className="h-16 flex items-center gap-2 px-2 border-b shrink-0 overflow-hidden group-data-[state=collapsed]:justify-center">
            {/* Sidebar toggle visible only on mobile inside the sidebar drawer */}
            <SidebarTrigger className="text-slate-600 hover:bg-slate-100 h-9 w-9 shrink-0 md:hidden" />
            <SidebarSeparator orientation="vertical" className="h-4 mr-0 md:hidden" />
            <Link href="/" className="flex items-center gap-2 group overflow-hidden shrink-0">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-green-600 text-[10px] font-bold text-white transition-transform group-hover:scale-105 shrink-0">IEBC</div>
              <div className="flex flex-col group-data-[state=collapsed]:hidden min-w-0">
                <span className="text-xs font-bold text-slate-900 leading-none truncate">Admin Portal</span>
                <span className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-tighter truncate font-medium">Management</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveComponent('overview')}
                  isActive={activeComponent === 'overview'}
                  tooltip="Overview"
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarGroup>
                <SidebarGroupLabel>User Management</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('manageUsers')} isActive={activeComponent === 'manageUsers'}>
                    <UsersIcon className="h-5 w-5" />
                    <span>Manage Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('roles')} isActive={activeComponent === 'roles'}>
                    <UsersIcon className="h-5 w-5" />
                    <span>Manage Roles</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('voters')} isActive={activeComponent === 'voters'}>
                    <UserCheckIcon className="h-5 w-5" />
                    <span>Manage Voters</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('candidates')} isActive={activeComponent === 'candidates'}>
                    <UserPlusIcon className="h-5 w-5" />
                    <span>Manage Candidates</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('elections')} isActive={activeComponent === 'elections'}>
                    <CalendarDaysIcon className="h-5 w-5" />
                    <span>Manage Elections</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('electionParties')} isActive={activeComponent === 'electionParties'}>
                    <LandmarkIcon className="h-5 w-5" />
                    <span>Election Parties</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('electionPositions')} isActive={activeComponent === 'electionPositions'}>
                    <ListTreeIcon className="h-5 w-5" />
                    <span>Positions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('electionTypes')} isActive={activeComponent === 'electionTypes'}>
                    <SettingsIcon className="h-5 w-5" />
                    <span>Election Types</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Insights</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setActiveComponent('analytics')} isActive={activeComponent === 'analytics'}>
                    <BarChart3Icon className="h-5 w-5" />
                    <span>Analytics & Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
             <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
               <Link href="/">
                 <LogOut className="h-4 w-4 rotate-180" />
                 <span>Exit Dashboard</span>
               </Link>
             </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-8 bg-background border-b shrink-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <SidebarSeparator orientation="vertical" className="h-6" />
              <h2 className="text-lg font-semibold capitalize">
                {activeComponent.replace(/([A-Z])/g, ' $1')}
              </h2>
            </div>

            <div className="flex items-center gap-4 max-w-md w-full justify-end">
              <div className="relative w-full hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search settings..."
                  className="pl-8 h-9 w-full md:w-[300px] lg:w-[400px]"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9 border cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-green-700/10 text-green-700 font-bold">AD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              {components[activeComponent]}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}