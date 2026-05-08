'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Loader2, Plus, Pencil, Trash2, FileText, X, AlertCircle 
} from "lucide-react"

const MAX_FILE_SIZE = 52428800; // 50 MB

const PartySchema = z.object({
  partyName: z.string().min(2, "Party name is required"),
  partyLeader: z.string().min(2, "Party leader name is required"),
  logoFile: z.any().optional().refine(
    (file) => !file || (file instanceof File && file.type.startsWith("image/")),
    "Logo must be an image file"
  ).refine(
    (file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE),
    "Logo file size must be less than 50MB."
  ),
  manifestoFile: z.any().optional().refine(
    (file) => !file || (file instanceof File && file.type === "application/pdf"), 
    "Manifesto must be a PDF file"
  ).refine(
    (file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE),
    `Manifesto file size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
  )
})

type PartyFormData = z.infer<typeof PartySchema>

export default function PartyManagementPage() {
  const [parties, setParties] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007"

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<PartyFormData>({
    resolver: zodResolver(PartySchema)
  })

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
      toast.error("Failed to load political parties")
    } finally {
      setFetching(false)
    }
  }

  const onSubmit = async (data: PartyFormData) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("PartyName", data.partyName)
      formData.append("PartyLeader", data.partyLeader)
      if (data.manifestoFile) {
        formData.append("ManifestoFile", data.manifestoFile)
      }
      if (data.logoFile) {
        formData.append("LogoFile", data.logoFile)
      }

      if (editingId) {
        await axios.put(`${apiUrl}/api/party/updateParty/${editingId}`, formData)
        toast.success("Party details updated successfully")
      } else {
        await axios.post(`${apiUrl}/api/party/addParty`, formData)
        toast.success("New political party registered")
      }

      reset()
      setEditingId(null)
      setShowForm(false)
      fetchParties()
    } catch (error: any) {
      const msg = error.response?.data || "Operation failed"
      toast.error(typeof msg === 'string' ? msg : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (party: any) => {
    setEditingId(party.id)
    setValue("partyName", party.partyName)
    setValue("partyLeader", party.partyLeader)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this party from the system?")) return

    try {
      await axios.delete(`${apiUrl}/api/party/deleteParty/${id}`)
      toast.success("Party removed successfully")
      fetchParties()
    } catch (error) {
      toast.error("Failed to delete party")
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-10 space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-tight">Political Parties</h1>
          <p className="text-slate-500">Official registry of competing political organizations</p>
        </div>
        <Button 
          onClick={() => {
            setEditingId(null)
            reset()
            setShowForm(!showForm)
          }}
          className={showForm ? "bg-slate-500" : "bg-green-700 hover:bg-green-800 shadow-lg"}
        >
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "Register Party"}
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-2xl border-t-8 border-t-green-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{editingId ? "Modify Party Details" : "New Party Registration"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Party Name</Label>
                  <Input {...register("partyName")} placeholder="Full official name" />
                  {errors.partyName && <p className="text-red-500 text-xs">{errors.partyName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Party Leader</Label>
                  <Input {...register("partyLeader")} placeholder="Chairperson / Flag Bearer" />
                  {errors.partyLeader && <p className="text-red-500 text-xs">{errors.partyLeader.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Party Logo (Image)</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setValue("logoFile", file, { shouldValidate: true })
                  }}
                />
                {errors.logoFile && <p className="text-red-500 text-xs">{String(errors.logoFile.message)}</p>}
              </div>

              <div className="space-y-2">
                <Label>Manifesto Document (PDF)</Label>
                <Input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setValue("manifestoFile", file, { shouldValidate: true })
                  }}
                />
                <p className="text-xs text-slate-400">Upload the latest version of the party's policy document.</p>
                {errors.manifestoFile && <p className="text-red-500 text-xs">{String(errors.manifestoFile.message)}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 h-12 text-lg font-bold">
                {loading ? <Loader2 className="animate-spin mr-2" /> : editingId ? "SAVE CHANGES" : "COMPLETE REGISTRATION"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {fetching ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-slate-50 h-48 border-none" />
          ))
        ) : parties.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed flex flex-col items-center">
            <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-400 font-medium">No parties currently registered in the system.</p>
          </div>
        ) : (
          parties.map((party) => (
            <Card key={party.id} className="hover:shadow-xl transition-all border-l-4 border-l-green-600">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-2">
                  {party.partyLogoPath ? (
                    <img src={`${apiUrl}${party.partyLogoPath}`} alt="Logo" className="w-12 h-12 object-contain rounded border bg-white" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded border flex items-center justify-center text-[10px] text-slate-400">NO LOGO</div>
                  )}
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(party)} className="hover:bg-blue-50">
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(party.id)} className="hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">PL</div>
                  <span className="text-sm font-medium text-slate-600">{party.partyLeader}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                {party.manifestoPdfPath ? (
                  <a 
                    href={`${apiUrl}${party.manifestoPdfPath}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 p-2 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    VIEW MANIFESTO
                  </a>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No document attached</p>
                )}
              </CardContent>
              <CardFooter className="pt-0 text-[10px] text-slate-400 font-mono uppercase">
                ID: {party.id} • {new Date(party.createdAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}