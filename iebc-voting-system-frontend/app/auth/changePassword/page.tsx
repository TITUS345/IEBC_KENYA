'use client'

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007"

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // Assuming the JWT token is stored in localStorage after sign in
      const token = localStorage.getItem("token")
      
      const response = await axios.post(`${apiUrl}/api/auth/change-password`, 
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      toast.success(response.data.message || "Password updated successfully.")
      reset()
    } catch (error: any) {
        if (error.response?.status === 401) {
            toast.error("Unauthorized: Please sign in again.")
        } else {
            const errorMsg = error.response?.data?.errors?.[0] || "Failed to change password. Ensure your current password is correct."
            toast.error(errorMsg)
        }
    } finally {
      setLoading(false)
    }
  }

  return (
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-3xl font-bold text-slate-800">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Security Settings
          </CardTitle>
          <CardDescription className="text-slate-500">
            Regularly updating your password helps keep your voting account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3 pt-4">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...register("currentPassword")}
                disabled={loading}
                className="h-10"
              />
              {errors.currentPassword && <p className="text-xs text-red-500 font-medium">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="newPassword">New Security Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 pr-10"
                  {...register("newPassword")}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-500 font-medium">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-3 pb-4">
              <Label htmlFor="confirmPassword">Verify New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-10"
                {...register("confirmPassword")}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-11 text-lg font-semibold transition-all shadow-md" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : "Update Security Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
  )
}

export default function ChangePasswordPage() {
  return (
    <div className="flex w-full min-h-screen bg-slate-50 items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
