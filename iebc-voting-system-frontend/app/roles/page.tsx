'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
    Loader2, Plus, Trash2, Edit, ShieldCheck, 
    X, AlertCircle, CheckCircle2 
} from "lucide-react"

interface Role {
    id: string;
    name: string;
    status: string;
    createdAt: string;
}

const RoleSchema = z.object({
    Name: z.enum(["User", "Admin", "Voter", "Candidate", "IEBCOfficial"], {
        message: "Please select a valid role",
    }),
    Status: z.enum(["Active", "Inactive"], {
        message: "Please select a status",
    })
})

type RoleFormData = z.infer<typeof RoleSchema>

export function RoleForm() {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm<RoleFormData>({
        resolver: zodResolver(RoleSchema),
        defaultValues: {
            Name: "User",
            Status: "Active"
        }
    })

    const fetchRoles = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${apiUrl}/api/Roles/getAllRoles`)
            setRoles(response.data)
        } catch (error) {
            console.error("Error fetching roles:", error)
            toast.error("Failed to load system roles")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const onSubmit = async (data: RoleFormData) => {
        setSubmitting(true)
        try {
            if (editingId) {
                await axios.put(`${apiUrl}/api/Roles/updateRole/${editingId}`, data)
                toast.success("Role updated successfully")
            } else {
                await axios.post(`${apiUrl}/api/Roles`, data)
                toast.success("Role created successfully")
            }
            closeForm()
            fetchRoles()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This may affect user access permissions.")) return
        try {
            await axios.delete(`${apiUrl}/api/Roles/deleteRole/${id}`)
            toast.success("Role removed from system")
            fetchRoles()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete role")
        }
    }

    const startEdit = (role: Role) => {
        setEditingId(role.id)
        setValue("Name", role.name as any)
        setValue("Status", role.status as any)
        setIsFormOpen(true)
    }

    const closeForm = () => {
        setIsFormOpen(false)
        setEditingId(null)
        reset()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">System Roles</h2>
                    <p className="text-sm text-muted-foreground">Manage user classifications and access levels</p>
                </div>
                {!isFormOpen && (
                    <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" /> Add New Role
                    </Button>
                )}
            </div>

            {isFormOpen && (
                <Card className="border-t-4 border-t-blue-600 shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">{editingId ? "Edit Role Configuration" : "Define New Access Role"}</CardTitle>
                        <Button variant="ghost" size="icon-sm" onClick={closeForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Role Classification</Label>
                                <select 
                                    {...register("Name")}
                                    className="w-full h-9 px-3 py-1 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="User">User</option>
                                    <option value="Voter">Voter</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Candidate">Candidate</option>
                                    <option value="IEBCOfficial">IEBCOfficial</option>
                                </select>
                                {errors.Name && <p className="text-[10px] text-red-500">{errors.Name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500">Operational Status</Label>
                                <select 
                                    {...register("Status")}
                                    className="w-full h-9 px-3 py-1 text-sm border rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                {errors.Status && <p className="text-[10px] text-red-500">{errors.Status.message}</p>}
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
                                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                                    {submitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                    {editingId ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                            <p className="text-sm text-slate-400 font-medium">Synchronizing roles...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <AlertCircle className="h-16 w-16 text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">No active roles detected</h3>
                            <p className="text-slate-500 text-sm mt-1">Initialize system security by adding your first role.</p>
                            <Button variant="link" onClick={() => setIsFormOpen(true)} className="text-green-600 mt-4 font-semibold">
                                <Plus className="w-4 h-4 mr-1" /> Get Started
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{role.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={role.status === "Active" ? "default" : "secondary"} className={role.status === "Active" ? "bg-green-500/10 text-green-600 border-none px-2 py-0 text-[10px]" : "px-2 py-0 text-[10px]"}>
                                                    {role.status}
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 font-mono">Established: {new Date(role.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon-sm" variant="ghost" onClick={() => startEdit(role)} className="hover:bg-blue-50 hover:text-blue-600">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(role.id)} className="hover:bg-red-50 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function RolePage() {
    return (
        <div className="max-w-4xl mx-auto py-10">
            <RoleForm />
        </div>
    )
}