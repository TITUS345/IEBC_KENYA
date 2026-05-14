'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { 
  Card, CardContent, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Calendar, Clock, Globe, Award, ListFilter, FilterX, ArrowRight
} from "lucide-react"
import Link from 'next/link'

interface Election {
  id: number;
  electionName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  electionType?: string;
  electionPosition?: string;
}

export default function ExistingElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007"

  useEffect(() => {
    fetchElections()
  }, [])

  const fetchElections = async () => {
    setFetching(true)
    try {
      const response = await axios.get(`${apiUrl}/api/elections/getAllElections`)
      setElections(response.data)
    } catch (error) {
      console.error("Error fetching elections:", error)
      toast.error("Unable to load election directory. Please check your connection.")
    } finally {
      setFetching(false)
    }
  }

  const filteredElections = elections.filter(e => 
    e.electionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.electionType && e.electionType.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Hero Section */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-green-700 border-green-200 bg-white font-semibold uppercase tracking-wider">
              Electoral Calendar
            </Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
              Active & Scheduled <span className="text-green-600">Elections</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Stay informed about the democratic process. View the full list of ongoing, upcoming, and past elections. 
              Review timelines and participation requirements for each electoral event.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 space-y-10">
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search elections by name, status or type..." 
              className="pl-10 h-12 bg-white shadow-sm border-slate-200 rounded-xl focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <ListFilter className="h-4 w-4" />
            Showing {filteredElections.length} {filteredElections.length === 1 ? 'Election' : 'Elections'}
          </div>
        </div>

        {/* Elections Grid */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredElections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FilterX className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No elections found</h3>
            <p className="text-slate-500">Try searching for a different term.</p>
            <Button variant="link" onClick={() => setSearchTerm("")} className="text-green-600 mt-2">
              View all elections
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <Card key={election.id} className="group flex flex-col h-full overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <div className="h-1.5 bg-green-600" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <Badge variant="secondary" className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        election.status === 'Ongoing' ? 'bg-green-100 text-green-700 border-green-200' :
                        election.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {election.status}
                    </Badge>
                  </div>
                  <CardTitle className="pt-4 text-xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                    {election.electionName}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{election.electionType || "Standard Poll"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {new Date(election.startDate).toLocaleDateString('en-KE')} - {new Date(election.endDate).toLocaleDateString('en-KE')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {election.description || "Official election event scheduled by the Independent Electoral and Boundaries Commission."}
                  </p>
                </CardContent>

                <CardFooter className="bg-slate-50/30 p-4 border-t mt-auto">
                   {election.status === 'Ongoing' ? (
                     <Button asChild variant="ghost" className="w-full justify-between group/btn text-green-600 hover:text-green-700 hover:bg-green-50">
                       <Link href="/election/voteCasting">
                        Cast Your Vote
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                       </Link>
                     </Button>
                   ) : (
                     <div className={`w-full flex items-center gap-3 p-3 rounded-xl border ${
                       election.status === 'Upcoming' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-500'
                     }`}>
                       <Clock className={`h-5 w-5 shrink-0 ${election.status === 'Upcoming' ? 'text-amber-600' : 'text-slate-400'}`} />
                       <div className="text-[11px] leading-tight">
                         <span className="font-bold block uppercase tracking-wide mb-0.5">{election.status === 'Upcoming' ? 'Voting Opens Soon' : 'Election Closed'}</span>
                         {election.status === 'Upcoming' ? `Please wait until ${new Date(election.startDate).toLocaleDateString('en-KE', { dateStyle: 'long' })} to cast your vote.` : 'The voting period for this election has ended.'}
                       </div>
                     </div>
                   )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}