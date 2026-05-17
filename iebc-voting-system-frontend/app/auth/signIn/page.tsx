'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import ForgotPasswordPage from "../forgotPassword/page";
import { SignUpForm } from "../signUp/page";

const LoginSchema=z.object({
    email:z.string().email("Invalid email address"),
    password:z.string().min(1,"Password is required")
});

type SignInFormData=z.infer<typeof LoginSchema>

export function SignInForm() {
    const [loading, setLoading]=useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState:{errors},
    }=useForm<SignInFormData>({
        resolver:zodResolver(LoginSchema)
    });

    const onSubmit=async(data:SignInFormData)=>{
        setLoading(true);
        try {
            
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";
            const response = await axios.post(`${apiUrl}/api/auth/signIn`, data);
            toast.message("Successfully logged in")
            //router.push("/")
        } catch (error:unknown) {
            if(axios.isAxiosError(error)){
                toast.error(`Error: ${error.response?.data.error || "Sign In failed"}`);
            }else{
                toast.error("An unexpected error occured.")
            }
            
        }finally{
            setLoading(false)
        }

    }

    
    return (
        <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-green-600">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl font-bold text-slate-800">Sign In</CardTitle>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none sm:max-w-xl lg:max-w-2xl">
                            <SignUpForm />
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-slate-500 text-sm">Sign in to your account</p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <Input id="email" type="email" {...register("email")} placeholder="john@example.com"
                        className={errors.email ? "text-red-500":""}/>
                        {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2 pt-6 pb-8">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="link" size="sm" className="px-0 text-green-600 hover:text-green-700 h-auto font-semibold">
                                        Forgot password?
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md lg:max-w-lg border-none bg-transparent shadow-none p-0">
                                    <Suspense fallback={<div className="flex justify-center p-12 bg-white rounded-2xl shadow-xl"><Loader2 className="h-10 w-10 animate-spin text-green-600" /></div>}>
                                        <ForgotPasswordPage />
                                    </Suspense>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Input id="password" type="password" {...register("password")} placeholder="••••••••"
                        className={errors.password ? "border-red-500":""}/>
                        {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-700 h-11 text-lg font-semibold transition-all shadow-md"
                    >
                        {
                            loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Verifying...</>):
                            (<>Sign In</>)
                        }
                    </Button>
                </form>
            </CardContent>
            <CardFooter>footer</CardFooter>
        </Card>
    )
}

export default function SignInPage(){
    return(
        <div className=" flex w-full min-h-screen bg-slate-50 items-center justify-center p-6">
            <SignInForm />
        </div>
    )
}