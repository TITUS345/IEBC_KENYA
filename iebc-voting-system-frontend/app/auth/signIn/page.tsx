'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight, Link, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const LoginSchema=z.object({
    email:z.string().email("Invalid email address"),
    password:z.string().min(1,"Password is required")
});

type SignInFormData=z.infer<typeof LoginSchema>

export default function SignInPage(){
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
            
            const apiUrl = process.env.services__api__http__0 || "http://localhost:5007";
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

    
    return(
        <div className=" flex w-full min-h-screen bg-slate-50 items-center justify-center p-6">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-600 ">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-3xl font-bold text-slate-800">Sign In</CardTitle>
                        <Link href="/auth/login">
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-slate-500 text-sm">Sign in to your account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <Input id="email" type="email "{...register("email")} placeholder="john@example.com"
                            className={errors.email ? "text-red-500":""}/>
                            {errors.email && <p className="text-xl text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-4 pt-8 pb-8">
                            <Input id="password" type="password" {...register("password")} placeholder="••••••••"
                            className={errors.password ? "border-red-500":""}/>
                            {errors.password && <p className="text-xl text-red-500">{errors.password.message}</p>}
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

        </div>
    )
}