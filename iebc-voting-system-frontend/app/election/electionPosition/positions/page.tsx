'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Briefcase, Info, ListFilter, FilterX
} from "lucide-react"

interface ElectionPosition {
  id: number;
  position: string;
  description?: string;
  requirements?: string;
  category?: string;
}

export default function ElectionPositionsDirectoryPage() {
  const [positions, setPositions] = useState<ElectionPosition[]>([])
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007"

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    setFetching(true)
    try {
      const response = await axios.get(`${apiUrl}/api/election-position/getAllPositions`)
      setPositions(response.data)
    } catch (error) {
      console.error("Error fetching positions:", error)
      toast.error("Unable to load elective positions. Please check your connection.")
    } finally {
      setFetching(false)
    }
  }

  const filteredPositions = positions.filter(pos => 
    pos.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pos.category && pos.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      {/* Hero Section */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-green-700 border-green-200 bg-white font-semibold uppercase tracking-wider">
              Governance Framework
            </Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
              Elective <span className="text-green-600">Positions</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Browse the official registry of elective offices in Kenya. Understand the roles, 
              responsibilities, and jurisdictional scope of each position before participating in the electoral process.
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
              placeholder="Search by position title or category..." 
              className="pl-10 h-12 bg-white shadow-sm border-slate-200 rounded-xl focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <ListFilter className="h-4 w-4" />
            Showing {filteredPositions.length} {filteredPositions.length === 1 ? 'Position' : 'Positions'}
          </div>
        </div>

        {/* Positions Grid */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FilterX className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No positions found</h3>
            <p className="text-slate-500">Try searching for a different title.</p>
            <Button variant="link" onClick={() => setSearchTerm("")} className="text-green-600 mt-2">
              View all positions
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPositions.map((pos) => (
              <Card key={pos.id} className="group flex flex-col h-full overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <div className="h-1.5 bg-green-600" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                    {pos.category && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold tracking-tighter">
                        {pos.category}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="pt-4 text-xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                    {pos.position}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {pos.description || "Official elective position defined under the Constitution of Kenya and statutory electoral laws."}
                  </p>
                  
                  {pos.requirements && (
                    <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Info className="h-4 w-4 text-green-400 mt-0.5" />
                      <div className="text-xs text-slate-600">
                        <span className="font-bold block mb-1">Key Requirement:</span>
                        {pos.requirements}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}