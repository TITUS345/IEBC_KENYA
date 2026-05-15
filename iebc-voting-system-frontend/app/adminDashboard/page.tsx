'use client';

import React, { useState } from 'react';
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
  Search,
  Bell,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleForm } from '@/app/roles/page';
import ManageElections from '../election/elections/page';
import ElectionTypes from '../election/electionType/page';
import ElectionPositions from '../election/electionPosition/page';
import PartyManagementPage from '../election/electionParty/page';
import RegisterVoter from '../registration/registerVoter/page';
import RegisterCandidatePage from '../registration/registerCandidate/page';
import Link from 'next/link';

const DashboardOverview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-green-700/5 border-green-700/20 border-t-4 border-t-green-700 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Elections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">12</div>
          <p className="text-xs text-muted-foreground mt-1">4 starting this week</p>
        </CardContent>
      </Card>
      <Card className="bg-green-600/5 border-green-600/20 border-t-4 border-t-green-600 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Voters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">2.4M</div>
          <p className="text-xs text-muted-foreground mt-1">+12k since yesterday</p>
        </CardContent>
      </Card>
      <Card className="bg-yellow-500/5 border-yellow-500/20 border-t-4 border-t-yellow-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">148</div>
          <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>System Activity</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md mx-6 mb-6">
        <div className="text-center space-y-2">
          <BarChart3Icon className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Analytics visualization will be integrated here.</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

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
  voters: <RegisterVoter />,
  candidates: <RegisterCandidatePage/>,
  analytics: <PlaceholderView title="Analytics & Reports" description="Comprehensive data visualization for system performance and voting trends." />,
};

type ComponentKey = keyof typeof components;

export default function AdminDashboardPage() {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('overview');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50 text-foreground">
        {/* Sidebar */}
        <Sidebar className="border-r shadow-none">
          <SidebarHeader className="h-16 flex items-center justify-between px-6 border-b">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="grid h-10 w-10 place-items-center rounded-3xl bg-green-600 text-sm font-bold text-white transition-transform group-hover:scale-105">IEBC</div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 leading-none">IEBC Admin</span>
                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight font-medium">Management Portal</span>
              </div>
            </Link>
            <SidebarTrigger className="lg:hidden" />
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