'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader2, UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const CandidateRegistrationSchema= z.object({
    firstName:z.string().min(2,"First Name is required"),
    lastName:z.string().min(2,"Last Name is required"),
    sirName:z.string().optional(),
    email:z.string().email("Invalid email"),
    nationalIdNo:z.string().min(5,"Invalid ID No"),
    phoneNumber:z.string().min(10,"Invalid Phone Number"),
    address:z.string().min(2,"Address is required"),
    location:z.string().min(2,"Location is required"),
    sub_location:z.string().min(2,"Sub_Location is required"),
    ward:z.string().min(2,"Ward is required"),
    constituency:z.string().min(2,"Constituency is required"),
    county:z.string().min(2,"County is required"),
    region:z.string().min(2,"Region is required"),
    role:z.enum(["User","Voter","Candidate","Admin","IEBCOfficial"],{
        message:"Please select a valid role"
    }),
    profilePicture:z.any()
})
type CandidateFormData= z.infer<typeof CandidateRegistrationSchema>

export default function RegisterCandidatePage() {
    const [loading, setLoading]=useState(false);
    const [preview, setPreview]=useState<string | null >(null);
    const router = useRouter();

    const{
        register,
        handleSubmit,
        control,
        formState:{errors},
        setValue,
        reset
    }=useForm<CandidateFormData>({
        resolver:zodResolver(CandidateRegistrationSchema),
        defaultValues:{
            role:"Candidate",
            firstName:"",
            lastName:"",
            sirName:"",
            email:"",
            nationalIdNo:"",
            phoneNumber:"",
            address:"",
            location:"",
            sub_location:"",
            ward:"",
            constituency:"",
            county:"",
            region:""
        }
    });

    const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file= e.target.files?.[0];
        if(file){
           setValue("profilePicture",file);
           setPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit= async (data:CandidateFormData)=>{
        setLoading(true);
        try {
           const formData= new FormData();
            //Append text fields
           Object.entries(data).forEach(([key,value])=>{
            if(key!=="profilePicture" && value !==undefined ){
                formData.append(key,value as string)
            }
           });
           //Append file
           if(data.profilePicture){
                formData.append("profilepicture",data.profilePicture)
           }

           const apiURL="http://localhost:5007" 
           const response=await axios.post(`${apiURL}/api/candidate/registerCandidate` ,formData,{
            headers:{'Content-Type':'maltypart/form-data'}
           });

           if(response.status==200){
               toast.success("Candidate created successfully");
               reset();
               setPreview(null);
               //router.push("/dashboard")
           }
        } catch (error:unknown) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            let description = "";
            let action: { label: string; onClick: () => void } | undefined;

            if (axios.isAxiosError(error)) {
                const backendError = typeof error.response?.data === "string"
                    ? error.response.data
                    : JSON.stringify(error.response?.data || "");
                if (backendError.includes("User account not found") || backendError.includes("user account found") || backendError.includes("AspNetusers")) {
                    errorMessage = "User Account Required";
                    description = "This person doesn't have a system account yet. Create a user account first.";
                    action = {
                        label: "Register User",
                        onClick: () => router.push("/auth/signUp")
                    };
                    setTimeout(() => router.push("/auth/signUp"), 2500);
                } else if (error.response?.status === 400) {
                    errorMessage = "Validation Error";
                    description = backendError || "Please check your input and try again.";
                } else if (error.response?.status === 500) {
                    errorMessage = "Server Error";
                    description = "Something went wrong on our end. Please try again later.";
                } else {
                    errorMessage = backendError || "Connection error to server";
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                description,
                action,
                duration: 5000,
            });
        }
    }

    return(
        <div className="flex w-full min-h-screen items-center justify-center bg-slate-50 p-4 md:p-10">
            <Card className="w-full max-w-4xl shadow-2xl border-t-8 border-t-green-700">  
                <CardHeader className="text-center" >
                    <CardTitle className="font-bold text-3xl text-slate-800 uppercase tracking-tight">Candidate Enrollment Portal</CardTitle>
                    <CardDescription className="text-lg">Register unique new Candidate to the system </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* profile picture*/}
                        <div className=" flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-slate-50 ">
                            {preview ? (<img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-2 border-4 border-gree-500 shadow-md"/> 
                            ):(<UploadCloud className="w-12 h-12 text-slate-400 mb-2"/>)}
                            <Label 
                            htmlFor="picture" 
                            className="font-bold text-green-700 cursor-pointer hover:underline" >
                                Upload Enrollment Photo
                            </Label>

                            <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            
                            {/* Personal Info */}
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input {...register("firstName")} placeholder="Jane" />
                                {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input {...register("lastName")} placeholder="Doe" />
                                {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Surname</Label>
                                <Input {...register("sirName")} placeholder="Anyango" />
                            </div>

                            {/* NEW FIELD: Selected Role */}
                            <div className="space-y-2">
                                <Label>System Role</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Voter">Voter</SelectItem>
                                                <SelectItem value="Candidate">Candidate</SelectItem>
                                                <SelectItem value="IEBCOfficial">IEBC Official</SelectItem>
                                                <SelectItem value="Admin">Administrator</SelectItem>
                                                <SelectItem value="User">General User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>National ID No.</Label>
                                <Input {...register("nationalIdNo")} placeholder="12345678" />
                                {errors.nationalIdNo && <span className="text-red-500 text-xs">{errors.nationalIdNo.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input {...register("email")} type="email" placeholder="jane.doe@example.com" />
                                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input {...register("phoneNumber")} placeholder="0711222333" />
                                {errors.phoneNumber && <span className="text-red-500 text-xs">{errors.phoneNumber.message}</span>}
                            </div>

                            {/* Geographical Info */}
                            <div className="space-y-2">
                                <Label>Region</Label>
                                <Input {...register("region")} placeholder="Coast / Rift Valley" />
                                {errors.region && <span className="text-red-500 text-xs">{errors.region.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>County</Label>
                                <Input {...register("county")} placeholder="Nairobi" />
                                {errors.county && <span className="text-red-500 text-xs">{errors.county.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Constituency</Label>
                                <Input {...register("constituency")} placeholder="Starehe" />
                                {errors.constituency && <span className="text-red-500 text-xs">{errors.constituency.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Ward</Label>
                                <Input {...register("ward")} placeholder="CBD" />
                                {errors.ward && <span className="text-red-500 text-xs">{errors.ward.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input {...register("location")} />
                                {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Sub-Location</Label>
                                <Input {...register("sub_location")} />
                                {errors.sub_location && <span className="text-red-500 text-xs">{errors.sub_location.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input {...register("address")} placeholder="123 Uhuru Highway" />
                                {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white h-14 text-xl font-bold shadow-lg">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "COMPLETE ENROLLMENT"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col border-t bg-slate-50 p-6">
                    <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-semibold">
                        IEBC OFFICIAL REGISTRATION PORTAL V10.0
                    </p>
                </CardFooter>
            </Card>

        </div>
    )
}