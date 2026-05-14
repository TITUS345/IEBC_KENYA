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
  Search, Layers, ListFilter, FilterX
} from "lucide-react"

interface ElectionType {
  id: number;
  type: string;
  description: string;
}

export default function ExistingElectionTypesPage() {
  const [electionTypes, setElectionTypes] = useState<ElectionType[]>([])
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007"

  useEffect(() => {
    fetchElectionTypes()
  }, [])

  const fetchElectionTypes = async () => {
    setFetching(true)
    try {
      const response = await axios.get(`${apiUrl}/api/election-type/getAllElectionTypes`)
      setElectionTypes(response.data)
    } catch (error) {
      console.error("Error fetching election types:", error)
      toast.error("Unable to load election categories. Please check your connection.")
    } finally {
      setFetching(false)
    }
  }

  const filteredTypes = electionTypes.filter(type => 
    type.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Hero Section */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-green-700 border-green-200 bg-white font-semibold uppercase tracking-wider">
              Electoral Standards
            </Badge>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
              Election <span className="text-green-600">Categories</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Explore the various types of elections managed by the Commission. 
              Understand the specific legal frameworks and procedural requirements for General, By-elections, and Referenda.
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
              placeholder="Search election categories..." 
              className="pl-10 h-12 bg-white shadow-sm border-slate-200 rounded-xl focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <ListFilter className="h-4 w-4" />
            Showing {filteredTypes.length} {filteredTypes.length === 1 ? 'Category' : 'Categories'}
          </div>
        </div>

        {/* Election Types Grid */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FilterX className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No categories found</h3>
            <p className="text-slate-500">Try searching for a different term.</p>
            <Button variant="link" onClick={() => setSearchTerm("")} className="text-green-600 mt-2">
              View all categories
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTypes.map((type) => (
              <Card key={type.id} className="group flex flex-col h-full overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <div className="h-1.5 bg-green-600" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors duration-300">
                      <Layers className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="pt-4 text-xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                    {type.type}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {type.description || "Official election category defined by the electoral legal framework of Kenya."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}