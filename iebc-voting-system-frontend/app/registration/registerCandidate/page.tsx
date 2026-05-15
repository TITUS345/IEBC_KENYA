'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { 
    Loader2, UploadCloud, AlertCircle, Plus, 
    Trash2, Edit, UserCheck, X, Search 
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import FaceRecognition from "@/components/FaceRecognition"

interface Candidate {
    id: number;
    firstName: string;
    lastName: string;
    surName?: string;
    fullname: string;
    email: string;
    nationalIdNo: string;
    phoneNumber: string;
    address: string;
    location: string;
    sub_Location: string;
    ward: string;
    constituency: string;
    county: string;
    region: string;
    faceBiometricImage?: string;
    manifestoPdfPath?: string;
    partyId: number;
    electionId: number;
    electionPositionId: number;
}
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
    partyId:z.string().min(1, "Political Party is required"), // Changed to PartyId
    electionId: z.string().min(1, "Election is required"),
    electionPositionId: z.string().min(1, "Position is required"),
    role:z.enum(["User","Voter","Candidate","Admin","IEBCOfficial"],{
        message:"Please select a valid system role"
    }),
    faceBiometricFile: z.any().optional(),
    faceEmbeddings: z.string().min(1, "Face embeddings are required. Please wait for face processing to complete."),
    manifestoPdfFile: z.any().optional().refine((file) => !file || (file instanceof File && file.type === "application/pdf"), "Manifesto must be a PDF file")
})

type CandidateFormData = z.infer<typeof CandidateRegistrationSchema>

export default function RegisterCandidatePage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading]=useState(false);
    const [preview, setPreview]=useState<string | null >(null);
    const [faceEmbeddings, setFaceEmbeddings] = useState<number[]>([]);
    const [faceBiometricFile, setFaceBiometricFile] = useState<File | null>(null);
    const [manifestoFile, setManifestoFile] = useState<File | null>(null);
    const [isFaceCaptured, setIsFaceCaptured] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [elections, setElections] = useState<any[]>([]);
    const [electionPositions, setElectionPositions] = useState<any[]>([]); // State for election positions
    const [parties, setParties] = useState<any[]>([]); // State for political parties
    const router = useRouter();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

    const{
        register,
        handleSubmit,
        control, // Keep control for Select components
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
            electionId: "",
            partyId:"", // Added partyId to default values
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
            electionPositionId: "", // Added electionPositionId
            faceEmbeddings: "",
        }
    });

    const fetchCandidates = async () => {
        setLoadingCandidates(true);
        try {
            const response = await axios.get(`${apiUrl}/api/candidate/getAllCandidates`);
            setCandidates(response.data);
        } catch (error) {
            toast.error("Failed to load candidate registry.");
        } finally {
            setLoadingCandidates(false);
        }
    };

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/elections/getAllElections`);
                if (response.status === 200) {
                    setElections(response.data.filter((e: any) => e.status !== 'Completed'));
                }
            } catch (error) {
                console.error("Error fetching elections:", error);
                toast.error("Failed to load elections.");
            }
        };
        fetchElections();
        fetchCandidates();
    }, []);

    useEffect(() => {
        const fetchParties = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/party/getAllParties`);
                if (response.status === 200) {
                    setParties(response.data);
                }
            } catch (error) {
                toast.error("Failed to load political parties."); // Changed from console.error to toast
                console.error("Error fetching parties:", error);
            }
        };
        fetchParties();
    }, []);

    useEffect(() => {
        const fetchElectionPositions = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/election-position/getAllPositions`);
                if (response.status === 200) {
                    setElectionPositions(response.data);
                }
            } catch (error) {
                toast.error("Failed to load election positions."); // Changed from console.error to toast
                console.error("Error fetching election positions:", error);
            }
        };
        fetchElectionPositions();
    }, []);

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
        setLoading(true)
        try {
            const formData = new FormData();
            
            // Append text fields, excluding files and embeddings for manual handling
            Object.entries(data).forEach(([key, value]) => {
                if (!["faceBiometricFile", "manifestoPdfFile", "faceEmbeddings"].includes(key) && value !== undefined) {
                    formData.append(key, value as string);
                }
            });
            formData.append("faceEmbeddings", data.faceEmbeddings);

            if (editingId) {
                // For updates, only send fields that are part of CandidateUpdateDTO
                const updatePayload = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    surName: data.surName,
                    phoneNumber: data.phoneNumber,
                    address: data.address,
                    location: data.location,
                    sub_Location: data.sub_Location,
                    ward: data.ward,
                    constituency: data.constituency,
                    county: data.county,
                    region: data.region,
                    partyId: parseInt(data.partyId),
                    electionId: parseInt(data.electionId),
                    electionPositionId: parseInt(data.electionPositionId),
                    role: data.role
                };
                await axios.put(`${apiUrl}/api/candidate/updateCandidate/${editingId}`, updatePayload);
                toast.success("Candidate profile updated successfully");
            } else {
                if (!isFaceCaptured && faceEmbeddings.length === 0) {
                    toast.error("Face capture is required for registration");
                    setLoading(false);
                    return;
                }

                if (faceBiometricFile) {
                    formData.append("faceBiometricFile", faceBiometricFile);
                }
                if (manifestoFile) formData.append("manifestoPdfFile", manifestoFile);

                await axios.post(`${apiUrl}/api/candidate/registerCandidate`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Candidate enrolled successfully!");
            }
            resetFormState();
            fetchCandidates();
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
                    description = "The server encountered an error processing the biometric data or saving the record.";
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

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will permanently remove the candidate and their associated records.")) return;
        try {
            await axios.delete(`${apiUrl}/api/candidate/deleteCandidate/${id}`);
            toast.success("Candidate removed from system");
            fetchCandidates();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete candidate");
        }
    };

    const startEdit = (candidate: Candidate) => {
        setEditingId(candidate.id);
        setValue("firstName", candidate.firstName);
        setValue("lastName", candidate.lastName);
        setValue("surName", candidate.surName || "");
        setValue("email", candidate.email);
        setValue("nationalIdNo", candidate.nationalIdNo);
        setValue("phoneNumber", candidate.phoneNumber);
        setValue("address", candidate.address);
        setValue("location", candidate.location);
        setValue("sub_Location", candidate.sub_Location);
        setValue("ward", candidate.ward);
        setValue("constituency", candidate.constituency);
        setValue("county", candidate.county);
        setValue("region", candidate.region);
        setValue("partyId", candidate.partyId?.toString() || "");
        setValue("electionId", candidate.electionId?.toString() || "");
        setValue("electionPositionId", candidate.electionPositionId?.toString() || "");
        setValue("role", "Candidate"); 
        
        if (candidate.faceBiometricImage && candidate.faceBiometricImage !== "embeddings_only") {
            setPreview(`${apiUrl}${candidate.faceBiometricImage}`);
        } else {
            setPreview(null);
        }
        setIsFaceCaptured(true); // Assume face is captured if image exists
        setIsFormOpen(true);
    };

    const resetFormState = () => {
        reset();
        setPreview(null);
        setFaceEmbeddings([]);
        setFaceBiometricFile(null);
        setManifestoFile(null);
        setIsFaceCaptured(false);
        setIsProcessingImage(false);
        setEditingId(null);
        setIsFormOpen(false);
    };

    const filteredCandidates = candidates.filter(c =>
        c.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nationalIdNo.includes(searchTerm)
    );

    return(
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Candidate Registry</h2>
                    <p className="text-sm text-muted-foreground">Enroll and manage eligible candidates with biometric security</p>
                </div>
                {!isFormOpen && (
                    <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" /> Enroll New Candidate
                    </Button>
                )}
            </div>

            {isFormOpen && (
                <Card className="border-t-4 border-t-green-600 shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">{editingId ? "Update Candidate Profile" : "Candidate Enrollment Form"}</CardTitle>
                            <CardDescription>Fill in the required information to {editingId ? "update" : "register"} a candidate.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={resetFormState}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="pt-4">
                 {/* Validation Error Summary */}
                 {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <div>
                            <p className="font-bold">Missing Information</p>
                            <p className="text-sm">Please check the fields marked in red below. {editingId && "Biometric and Manifesto updates are restricted in edit mode."}</p>
                        </div>
                    </div>
                 )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* profile picture*/}
                        {!editingId && ( // Only show face capture for new registrations
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-slate-50">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-2 border-4 border-green-500 shadow-md"/> 
                                ) : (
                                    <UploadCloud className="w-12 h-12 text-blue-400 mb-2"/>
                                )}
                        
                                {!preview && (
                                    <>
                                        <Label htmlFor="picture" className="font-bold text-green-700 cursor-pointer hover:underline">
                                            Upload Reference Photo (Optional)
                                        </Label>
                                        <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        <p className="text-sm text-gray-600 mt-1">or use face capture below</p>
                                    </>
                                )}

                                {errors.faceBiometricFile && <p className="text-red-500 text-xs mt-1">{String(errors.faceBiometricFile.message)}</p>}

                                {/* Face Recognition Section */}
                                <div className="mt-4 w-full">
                                    <Label className="text-center block mb-3 font-semibold text-slate-700">
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
                                    {errors.faceEmbeddings && <p className="text-red-500 text-xs mt-1">{String(errors.faceEmbeddings.message)}</p>}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            
                            {/* Personal Info */}
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input {...register("firstName")} placeholder="Jane" disabled={loading} />
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
                                {errors.surName && <span className="text-red-500 text-xs">{String(errors.surName.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Active Election</Label>
                                <Controller
                                    name="electionId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select Election" /></SelectTrigger>
                                            <SelectContent>
                                                {elections.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.electionName}</SelectItem>)}
                                            </SelectContent>
                                            {errors.electionId && <span className="text-red-500 text-xs">{String(errors.electionId.message)}</span>}
                                        </Select>
                                    )}
                                />
                                {errors.electionId && <span className="text-red-500 text-xs">{String(errors.electionId.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Political Party</Label>
                                <Controller
                                    name="partyId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select Party" /></SelectTrigger>
                                            <SelectContent>
                                                {parties.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.partyName}</SelectItem>)}
                                            </SelectContent>
                                            {errors.partyId && <span className="text-red-500 text-xs">{String(errors.partyId.message)}</span>}
                                        </Select>
                                    )}
                                />
                                {errors.partyId && <span className="text-red-500 text-xs">{String(errors.partyId.message)}</span>}
                            </div>

                            {/* Election Position */}
                            <div className="space-y-2">
                                <Label>Election Position</Label>
                                <Controller
                                    name="electionPositionId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Select Position" /></SelectTrigger>
                                            <SelectContent>
                                                {electionPositions.map(pos => <SelectItem key={pos.id} value={pos.id.toString()}>{pos.position}</SelectItem>)}
                                            </SelectContent>
                                            {errors.electionPositionId && <span className="text-red-500 text-xs">{String(errors.electionPositionId.message)}</span>}
                                        </Select>
                                    )}
                                />
                                {errors.electionPositionId && <span className="text-red-500 text-xs">{String(errors.electionPositionId.message)}</span>}
                            </div>

                            {/* System Role */}
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
                                <Input {...register("nationalIdNo")} placeholder="12345678" disabled={!!editingId} />
                                {errors.nationalIdNo && <span className="text-red-500 text-xs">{String(errors.nationalIdNo.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input {...register("email")} type="email" placeholder="jane.doe@example.com" />
                                {errors.email && <span className="text-red-500 text-xs">{String(errors.email.message)}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input {...register("phoneNumber")} placeholder="0711222333" disabled={loading} />
                                {errors.phoneNumber && <span className="text-red-500 text-xs">{String(errors.phoneNumber.message)}</span>}
                            </div>

                            {/* Geographical Info */}
                            <div className="space-y-2">
                                <Label>Region</Label>
                                <Input {...register("region")} placeholder="Coast / Rift Valley" />
                                {errors.region && <p className="text-red-500 text-xs">{errors.region.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>County</Label>
                                <Input {...register("county")} placeholder="Nairobi" />
                                {errors.county && <p className="text-red-500 text-xs">{errors.county.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Constituency</Label>
                                <Input {...register("constituency")} placeholder="Starehe" />
                                {errors.constituency && <p className="text-red-500 text-xs">{errors.constituency.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Ward</Label>
                                <Input {...register("ward")} placeholder="CBD" />
                                {errors.ward && <p className="text-red-500 text-xs">{errors.ward.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input {...register("location")} />
                                {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Sub-Location</Label>
                                <Input {...register("sub_Location")} />
                                {errors.sub_Location && <p className="text-red-500 text-xs">{errors.sub_Location.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input {...register("address")} placeholder="123 Uhuru Highway" />
                                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                            </div>

                            {!editingId && ( // Only show manifesto upload for new registrations
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
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-6">
                            <Button type="button" variant="outline" onClick={resetFormState}>Cancel</Button>
                            <Button
                                type="submit"
                                disabled={loading || (!editingId && (!isFaceCaptured || isProcessingImage))}
                                className="bg-green-700 hover:bg-green-800 min-w-[160px]"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : editingId ? "Update Candidate" : isProcessingImage ? "Processing..." : "Complete Enrollment"}
                            </Button>
                        </div>
                    </form>
                 </CardContent>
                </Card>
            )}

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or ID number..."
                                className="pl-8 bg-white border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loadingCandidates ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                            <p className="text-sm text-slate-400 font-medium italic">Syncing candidate records...</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <AlertCircle className="h-16 w-16 text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">No candidates registered</h3>
                            <p className="text-slate-500 text-sm mt-1">Start by enrolling the first eligible candidate.</p>
                            <Button variant="link" onClick={() => setIsFormOpen(true)} className="text-green-600 mt-4 font-semibold">
                                <Plus className="w-4 h-4 mr-1" /> Get Started
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredCandidates.map((candidate) => (
                                <div key={candidate.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                                            {candidate.faceBiometricImage && candidate.faceBiometricImage !== "embeddings_only" ? (
                                                <img src={`${apiUrl}${candidate.faceBiometricImage}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCheck className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{candidate.fullname}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <Badge variant="outline" className="bg-slate-50 text-[10px] px-2 py-0">ID: {candidate.nationalIdNo}</Badge>
                                                <span className="text-[10px] text-slate-400 font-mono">Location: {candidate.constituency}, {candidate.county}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon-sm" variant="ghost" onClick={() => startEdit(candidate)} className="hover:bg-green-50 hover:text-green-600">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(candidate.id)} className="hover:bg-red-50 hover:text-red-600">
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