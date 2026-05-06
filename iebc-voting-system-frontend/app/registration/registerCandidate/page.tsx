'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader2, UploadCloud, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import FaceRecognition from "@/components/FaceRecognition"

const CandidateRegistrationSchema= z.object({
    firstName:z.string().min(2,"First Name is required"),
    lastName:z.string().min(2,"Last Name is required"),
    surName:z.string().optional(),
    email:z.string().email("Invalid email"),
    nationalIdNo:z.string().min(5,"Invalid ID No"),
    phoneNumber:z.string().min(10,"Invalid Phone Number"),
    address:z.string().min(2,"Address is required"),
    location:z.string().min(2,"Location is required"),
    sub_Location:z.string().min(2,"Sub-Location is required"),
    ward:z.string().min(2,"Ward is required"),
    constituency:z.string().min(2,"Constituency is required"),
    county:z.string().min(2,"County is required"),
    region:z.string().min(2,"Region is required"),
    role:z.enum(["User","Voter","Candidate","Admin","IEBCOfficial"],{
        message:"Please select a valid role"
    }),
    faceBiometricFile: z.any().refine((file) => file instanceof File, "Biometric enrollment photo is required"),
    faceEmbeddings: z.string().min(1, "Face embeddings are required. Please wait for face processing to complete."),
    manifestoPdfFile: z.any().optional().refine((file) => !file || (file instanceof File && file.type === "application/pdf"), "Manifesto must be a PDF file")
})
type CandidateFormData= z.infer<typeof CandidateRegistrationSchema>

export default function RegisterCandidatePage() {
    const [loading, setLoading]=useState(false);
    const [preview, setPreview]=useState<string | null >(null);
    const [faceEmbeddings, setFaceEmbeddings] = useState<number[]>([]);
    const [faceBiometricFile, setFaceBiometricFile] = useState<File | null>(null);
    const [manifestoFile, setManifestoFile] = useState<File | null>(null);
    const [isFaceCaptured, setIsFaceCaptured] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
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
            surName:"",
            email:"",
            nationalIdNo:"",
            phoneNumber:"",
            address:"",
            location:"",
            sub_Location:"",
            ward:"",
            constituency:"",
            county:"",
            region:"",
            faceEmbeddings: ""
        }
    });

    const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file= e.target.files?.[0];
        if(file){
            setFaceBiometricFile(file);
           setValue("faceBiometricFile",file);
           setPreview(URL.createObjectURL(file));
            // Clear face capture state when uploading file
            setIsFaceCaptured(false);
            setFaceEmbeddings([]);
            setValue("faceEmbeddings", "");
            setIsProcessingImage(true); // Start processing
        }
    };

    const handleManifestoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setManifestoFile(file);
            setValue("manifestoPdfFile", file);
            toast.success("Manifesto selected successfully");
        }
    };

    const handleFaceDetected = (embeddings: number[], capturedImage: File) => {
        setFaceEmbeddings(embeddings);
        setFaceBiometricFile(capturedImage);
        setValue("faceEmbeddings", JSON.stringify(embeddings));
        setValue("faceBiometricFile", capturedImage);
        setPreview(URL.createObjectURL(capturedImage));
        setIsFaceCaptured(true);
        setIsProcessingImage(false); // Processing complete
        toast.success("Face captured successfully!");
    };

    const handleFaceError = (error: string) => {
        toast.error(error);
    };

    const onSubmit= async (data:CandidateFormData)=>{
        setLoading(true);
        try {
           const formData= new FormData();
            //Append text fields
           Object.entries(data).forEach(([key,value])=>{
            if(key!=="faceBiometricFile" && key!=="manifestoPdfFile" && value !==undefined ){
                formData.append(key,value as string)
            }
           });
           //Append file
           if(faceBiometricFile){
                formData.append("faceBiometricFile",faceBiometricFile)
           }
           //Append manifesto
           if (manifestoFile) {
               formData.append("manifestoPdfFile", manifestoFile);
           }

           const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";
           const response=await axios.post(`${apiURL}/api/candidate/registerCandidate` ,formData,{
            headers:{'Content-Type':'multipart/form-data'}
           });

           if(response.status==200){
               toast.success("Candidate created successfully");
               reset();
               setPreview(null);
               setFaceEmbeddings([]);
               setFaceBiometricFile(null);
               setManifestoFile(null);
               setIsFaceCaptured(false);
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
        } finally {
            setLoading(false);
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
                {/* Validation Error Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <div>
                            <p className="font-bold">Missing Information</p>
                            <p className="text-sm">Please check the fields marked in red below.</p>
                        </div>
                    </div>
                )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* profile picture*/}
                        <div className=" flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-slate-50 ">
                            {preview ? (<img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-2 border-4 border-gree-500 shadow-md"/> 
                            ):(<UploadCloud className="w-12 h-12 text-blue-400 mb-2"/>)}
                        
                        {!preview && (
                            <>
                                <Label 
                                htmlFor="picture" 
                                className="font-bold text-green-700 cursor-pointer hover:underline" >
                                    Upload Reference Photo (Optional)
                                </Label>
                                <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                <p className="text-sm text-gray-600 mt-1">or use face capture below</p>
                            </>
                        )}

                            {errors.faceBiometricFile && <span className="text-red-500 text-xs">{String(errors.faceBiometricFile.message)}</span>}

                            {/* Face Recognition Section */}
                            <div className="mt-4 w-full">
                            <Label className="text-center block mb-2 font-semibold">
                                {faceEmbeddings.length > 0 ? 'Face Captured Successfully' : 'Live Face Capture (Required)'}
                            </Label>
                                <FaceRecognition 
                                    onFaceDetected={handleFaceDetected} 
                                onError={handleFaceError}
                                uploadedImage={faceBiometricFile && !isFaceCaptured ? faceBiometricFile : null}
                                onProcessing={setIsProcessingImage}
                                />
                                {faceEmbeddings.length > 0 && (
                                    <p className="text-green-600 text-sm mt-2">✓ Face captured successfully</p>
                                )}
                                {errors.faceEmbeddings && <span className="text-red-500 text-xs">{String(errors.faceEmbeddings.message)}</span>}
                            </div>

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            
                            {/* Personal Info */}
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input {...register("firstName")} placeholder="Jane" />
                                {errors.firstName && <span className="text-red-500 text-xs">{String(errors.firstName.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input {...register("lastName")} placeholder="Doe" />
                                {errors.lastName && <span className="text-red-500 text-xs">{String(errors.lastName.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Surname</Label>
                                <Input {...register("surName")} placeholder="Anyango" />
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
                                {errors.role && <span className="text-red-500 text-xs">{String(errors.role.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>National ID No.</Label>
                                <Input {...register("nationalIdNo")} placeholder="12345678" />
                                {errors.nationalIdNo && <span className="text-red-500 text-xs">{String(errors.nationalIdNo.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input {...register("email")} type="email" placeholder="jane.doe@example.com" />
                                {errors.email && <span className="text-red-500 text-xs">{String(errors.email.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input {...register("phoneNumber")} placeholder="0711222333" />
                                {errors.phoneNumber && <span className="text-red-500 text-xs">{String(errors.phoneNumber.message)}</span>}
                            </div>

                            {/* Geographical Info */}
                            <div className="space-y-2">
                                <Label>Region</Label>
                                <Input {...register("region")} placeholder="Coast / Rift Valley" />
                                {errors.region && <span className="text-red-500 text-xs">{String(errors.region.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>County</Label>
                                <Input {...register("county")} placeholder="Nairobi" />
                                {errors.county && <span className="text-red-500 text-xs">{String(errors.county.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Constituency</Label>
                                <Input {...register("constituency")} placeholder="Starehe" />
                                {errors.constituency && <span className="text-red-500 text-xs">{String(errors.constituency.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Ward</Label>
                                <Input {...register("ward")} placeholder="CBD" />
                                {errors.ward && <span className="text-red-500 text-xs">{String(errors.ward.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input {...register("location")} />
                                {errors.location && <span className="text-red-500 text-xs">{String(errors.location.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Sub-Location</Label>
                            <Input {...register("sub_Location")} />
                            {errors.sub_Location && <span className="text-red-500 text-xs">{String(errors.sub_Location.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input {...register("address")} placeholder="123 Uhuru Highway" />
                                {errors.address && <span className="text-red-500 text-xs">{String(errors.address.message)}</span>}
                            </div>

                        {/* Manifesto Upload */}
                        <div className="space-y-2">
                            <Label>Manifesto (PDF)</Label>
                            <Input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={handleManifestoChange}
                            />
                            {manifestoFile && <p className="text-green-600 text-xs font-semibold">✓ {manifestoFile.name}</p>}
                            {errors.manifestoPdfFile && <span className="text-red-500 text-xs">{String(errors.manifestoPdfFile.message)}</span>}
                        </div>
                        </div>

                    <Button 
                        type="submit" 
                        disabled={loading || !isFaceCaptured || isProcessingImage} 
                        className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white h-14 text-xl font-bold shadow-lg transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : isProcessingImage ? "PROCESSING IMAGE..." : isFaceCaptured ? "COMPLETE ENROLLMENT" : "CAPTURE FACE TO PROCEED"}
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