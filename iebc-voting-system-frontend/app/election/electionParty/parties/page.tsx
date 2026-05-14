'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, Search, FileText, Landmark, User, Calendar, ExternalLink, FilterX
} from "lucide-react"

interface PoliticalParty {
  id: number;
  partyName: string;
  partyLeader: string;
  partyLogoPath?: string;
  manifestoPdfPath?: string;
  createdAt: string;
}

export default function PartiesDirectoryPage() {
  const [parties, setParties] = useState<PoliticalParty[]>([])
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007"

  useEffect(() => {
    fetchParties()
  }, [])

  const fetchParties = async () => {
    setFetching(true)
    try {
      const response = await axios.get(`${apiUrl}/api/party/getAllParties`)
      setParties(response.data)
    } catch (error) {
      console.error("Error fetching parties:", error)
      toast.error("Unable to load the parties directory. Please try again later.")
    } finally {
      setFetching(false)
    }
  }

  const filteredParties = parties.filter(party => 
    party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.partyLeader.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-green-700 border-green-200 bg-white font-semibold uppercase tracking-wider">
              Official Registry
            </Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
              Political Parties <span className="text-green-600">Directory</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Explore the registered political organizations of Kenya. Review their leadership, 
              official symbols, and core policy frameworks to make an informed decision.
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
              placeholder="Search by party name or leader..." 
              className="pl-10 h-12 bg-white shadow-sm border-slate-200 rounded-xl focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Showing {filteredParties.length} {filteredParties.length === 1 ? 'Party' : 'Parties'}
          </p>
        </div>

        {/* Parties Grid */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse h-80 rounded-2xl" />
            ))}
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FilterX className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No parties found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
            <Button variant="link" onClick={() => setSearchTerm("")} className="text-green-600 mt-2">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredParties.map((party) => (
              <Card key={party.id} className="group overflow-hidden rounded-2xl border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
                <div className="h-2 bg-green-600" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-green-50 transition-colors duration-300">
                      {party.partyLogoPath ? (
                        <img 
                          src={`${apiUrl}${party.partyLogoPath}`} 
                          alt={`${party.partyName} Logo`} 
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <Landmark className="w-16 h-16 text-slate-300 p-2" />
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-mono text-[10px]">
                      REG #{party.id.toString().padStart(3, '0')}
                    </Badge>
                  </div>
                  <div className="pt-4 space-y-1">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                      {party.partyName}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-slate-700">{party.partyLeader}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Registered on {new Date(party.createdAt).toLocaleDateString('en-KE', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </div>
                </CardContent>

                <CardFooter className="bg-slate-50/50 p-4 border-t flex flex-col gap-3">
                  {party.manifestoPdfPath ? (
                    <Button 
                      asChild
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                      <a 
                        href={`${apiUrl}${party.manifestoPdfPath}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Read Manifesto
                        <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                      </a>
                    </Button>
                  ) : (
                    <div className="w-full py-2.5 text-center text-sm font-medium text-slate-400 bg-slate-100 rounded-xl border border-slate-200">
                      No Manifesto Available
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