"use client";

import * as z from "zod";
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

// Updated Schema with stronger validation
const SignUpSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  sirname: z.string().min(2, "sirname is required"),
  nationalIdNo: z.string().min(5, "Enter a valid National ID"),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        reset
    } = useForm<SignUpFormData>({
        resolver: zodResolver(SignUpSchema),
    });

    const onSubmit = async (data: SignUpFormData) => {
        setLoading(true);
        try {
            // Note: Ensure port matches your running .NET API
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";
            const response = await axios.post(`${apiUrl}/api/auth/register`, data);
            toast.success("Voter account created successfully!");
            router.push("/auth/signIn");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Registration failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
 
  return (
    <div className="flex w-full min-h-screen bg-slate-50 items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold text-slate-800">Registration</CardTitle>
            <Link href="/auth/login">
                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </div>
          <p className="text-slate-500 text-sm">Register your details for the IEBC Voting System</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Name Section - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...register("firstName")} placeholder="John" 
                        className={errors.firstName ? 'border-red-500' : ''}/>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...register("lastName")} placeholder="Doe"
                        className={errors.lastName ? 'border-red-500' : ''}/>
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sirname">Surname</Label>
                    <Input id="sirname" {...register("sirname")} placeholder="Smith"
                        className={errors.sirname ? 'border-red-500' : ''}/>
                    {errors.sirname && <p className="text-red-500 text-xs mt-1">{errors.sirname.message}</p>}
                </div>
            </div>

            {/* Identification & Contact - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nationalIdNo">National ID Number</Label>
                    <Input id="nationalIdNo" {...register("nationalIdNo")} placeholder="12345678"
                        className={errors.nationalIdNo ? 'border-red-500' : ''}/>
                    {errors.nationalIdNo && <p className="text-red-500 text-xs mt-1">{errors.nationalIdNo.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" {...register("phoneNumber")} placeholder="0712345678"
                        className={errors.phoneNumber ? 'border-red-500' : ''}/>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                </div>
            </div>

            {/* Credentials Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="john@example.com"
                        className={errors.email ? 'border-red-500' : ''}/>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Security Password</Label>
                    <Input id="password" type="password" {...register("password")} placeholder="••••••••"
                        className={errors.password ? 'border-red-500' : ''}/>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-green-600 hover:bg-green-700 h-11 text-lg font-semibold transition-all shadow-md">
                {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                ) : (
                    <><UserPlus className="mr-2 h-5 w-5" /> Create Voter Account</>
                )}
            </Button>

          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t bg-slate-50/50 p-4">
            <p className="text-xs text-slate-400 text-center">
                By registering, you agree to the IEBC Terms of Service and Privacy Policy. 
                Keep your credentials secure.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}