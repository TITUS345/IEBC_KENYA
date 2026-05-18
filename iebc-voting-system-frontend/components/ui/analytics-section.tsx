'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    Users, UserCheck, Landmark, Vote as VoteIcon, 
    Calendar, Trophy, Timer, TrendingUp,
    RefreshCcw, Clock, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
    LabelList
} from 'recharts';

interface TimeLeftState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsSection() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        voters: 0,
        candidates: [], // Ensure candidates is an array
        parties: 0,
        elections: [],
        votes: []
    });
    const [timeLeft, setTimeLeft] = useState<TimeLeftState | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

    const fetchData = async () => {
        try {
            const [votersRes, candidatesRes, partiesRes, electionsRes, votesRes] = await Promise.all([
                axios.get(`${apiUrl}/api/voter/getAllVoters`),
                axios.get(`${apiUrl}/api/candidate/getAllCandidates`),
                axios.get(`${apiUrl}/api/party/getAllParties`),
                axios.get(`${apiUrl}/api/elections/getAllElections`),
                axios.get(`${apiUrl}/api/vote-casting/getAllVotes`)
            ]);

            setData({
                voters: votersRes.data.length,
                candidates: candidatesRes.data,
                parties: partiesRes.data.length,
                elections: electionsRes.data,
                votes: votesRes.data
            });
        } catch (error) {
            console.error("Analytics fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Live sync every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Find the closest upcoming election for the countdown
    const nextElection = useMemo<any>(() => {
        return data.elections
            .filter((e: any) => e.status === 'Upcoming' || e.status === 'Scheduled')
            .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
    }, [data.elections]);

    useEffect(() => {
        if (!nextElection || !nextElection.startDate) return; // Ensure startDate exists
        const timer = setInterval(() => {
            const diff = +new Date(nextElection.startDate) - +new Date();
            if (diff <= 0) {
                setTimeLeft(null);
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [nextElection]);

    // Data Processing for Charts
    const electionStatusData = useMemo(() => {
        const counts = data.elections.reduce((acc: any, curr: any) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [data.elections]);

    const liveResults = useMemo(() => {
        const active = data.elections.find((e: any) => e.status === 'Ongoing');
        if (!active) return [];
        
        return data.candidates
            .filter((c: any) => c.electionId === active.id)
            .map((c: any) => ({
                name: c.fullname,
                votes: data.votes.filter((v: any) => v.candidateId === c.id && v.electionId === active.id).length
            }))
            .sort((a: any, b: any) => b.votes - a.votes)
            .slice(0, 5); // Show top 5
    }, [data.elections, data.candidates, data.votes]);

    const completedWinners = useMemo(() => {
        return data.elections
            .filter((e: any) => e.status === 'Completed')
            .map((e: any) => {
                const electionVotes = data.votes.filter((v: any) => v.electionId === e.id);
                const candidatesInElection = data.candidates.filter((c: any) => c.electionId === e.id);
                let winner = { fullname: 'No Candidate', votes: 0 };
                candidatesInElection.forEach((c: any) => {
                    const count = electionVotes.filter((v: any) => v.candidateId === c.id).length;
                    if (count > (winner.votes || -1)) {
                        winner = { ...c, votes: count };
                    }
                });
                return { electionName: e.electionName, winner };
            }).slice(-2); // Show last 2
    }, [data.elections, data.votes, data.candidates]);

    if (loading) return (
        <div className="flex justify-center py-20">
            <RefreshCcw className="animate-spin text-green-600 h-8 w-8" />
        </div>
    );

    return (
        <section className="py-12 px-4 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Election Analytics</h2>
                    <p className="text-slate-500">Real-time data and transparency metrics</p>
                </div>
                <Badge variant="outline" className="flex gap-2 items-center px-3 py-1 bg-white shadow-sm border-green-200 text-green-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Sync Active
                </Badge>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Registered Voters', value: data.voters.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Candidates', value: data.candidates.length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Political Parties', value: data.parties, icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Votes Casted', value: data.votes.length.toLocaleString(), icon: VoteIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Countdown & Winners Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 text-white overflow-hidden border-none shadow-xl relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Timer size={120} />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Clock className="text-green-400" />
                            {nextElection ? 'Election Countdown' : 'No Upcoming Elections'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {nextElection ? `Next: ${nextElection.electionName}` : 'All scheduled elections have concluded.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        {timeLeft ? (
                            <div className="flex gap-4 md:gap-8 justify-center md:justify-start">
                                {Object.entries(timeLeft).map(([unit, value]) => (
                                    <div key={unit} className="text-center"> {/* Explicitly convert value to string */}
                                        <div className="text-3xl md:text-5xl font-black bg-white/10 rounded-lg p-3 w-16 md:w-24 border border-white/10">{value}</div>
                                        <div className="text-[10px] uppercase tracking-widest mt-2 text-slate-400 font-bold">{unit}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-slate-400 py-4">
                                <AlertCircle />
                                <span>Check the registry for new scheduled dates soon.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Winners</CardTitle>
                        <CardDescription>Final results from completed pools</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {completedWinners.length > 0 ? completedWinners.map((w: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{w.electionName}</p>
                                    <p className="font-bold text-slate-800">{w.winner.fullname}</p>
                                </div>
                                <CheckCircle2 className="ml-auto text-green-600 h-4 w-4" />
                            </div>
                        )) : (
                            <p className="text-sm text-slate-400 italic">No winners declared yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Vote Tally Bar Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="text-blue-500 h-5 w-5" />
                                    Live Vote Tally
                                </CardTitle>
                                <CardDescription>Top candidates in the ongoing election</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {liveResults.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={liveResults} layout="vertical" margin={{ left: 40, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="votes" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                                            <LabelList dataKey="votes" position="right" fontSize={12} fontWeight="bold" fill="#64748b" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2 italic">
                                    <VoteIcon className="h-10 w-10 opacity-20" />
                                    No ongoing election results to display
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Election Status Pie Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Election Distribution</CardTitle>
                        <CardDescription>Breakdown of elections by current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={electionStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {electionStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}