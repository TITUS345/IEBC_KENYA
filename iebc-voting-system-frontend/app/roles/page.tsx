'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import axios from "axios"

// 1. Define the Schema with specific allowed values to match your C# Enums
const RoleSchema = z.object({
    Name: z.enum(["User","Admin", "Voter", "Candidate", "IEBCOfficial"], {
        // Use 'error' or 'message' instead of 'invalid_type_error'
        error: "Please select a valid role",
    }),
    Status: z.enum(["Active", "Inactive"], {
        error: "Please select a status",
    })
})

type RoleFormData = z.infer<typeof RoleSchema>

export default function RolePage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // 2. Initialize React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<RoleFormData>({
        resolver: zodResolver(RoleSchema),
        defaultValues: {
            Name: "User",
            Status: "Active"
        }
    })

    // 3. Handle Submission
    const onSubmit = async (data: RoleFormData) => {
        setLoading(true)
        setMessage(null)
        try {
            // Update the URL to match your .NET Port
            const response = await axios.post("https://localhost:7260/api/roles", data)
            setMessage({ type: 'success', text: `Successfully created role: ${data.Name}` })
            reset() // Clear form on success
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || "Failed to create role. Check if it already exists." 
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex w-full min-h-screen bg-gray-100 items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">System Role Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* ROLE NAME SELECT */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role Name</label>
                            <select 
                                {...register("Name")}
                                className={`w-full p-2 border rounded-md bg-white ${errors.Name ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="User">User</option>
                                <option value="Voter">Voter</option>
                                <option value="Admin">Admin</option>
                                <option value="Candidate">Candidate</option>
                                <option value="IEBCOfficial">IEBCOfficial</option>
                            </select>
                            {errors.Name && <p className="text-xs text-red-500">{errors.Name.message}</p>}
                        </div>

                        {/* STATUS SELECT */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Initial Status</label>
                            <select 
                                {...register("Status")}
                                className={`w-full p-2 border rounded-md bg-white ${errors.Status ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            {errors.Status && <p className="text-xs text-red-500">{errors.Status.message}</p>}
                        </div>

                        {/* FEEDBACK MESSAGE */}
                        {message && (
                            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                        >
                            {loading ? "Processing..." : "Create Role"}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}