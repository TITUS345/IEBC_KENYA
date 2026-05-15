'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { 
    Loader2, UploadCloud, AlertCircle, Plus, 
    Trash2, Edit, UserCheck, X, Search 
} from "lucide-react"
import z from "zod"
import { toast } from "sonner" 
import axios from "axios"
import FaceRecognition from "@/components/FaceRecognition"
import { Badge } from "@/components/ui/badge"

interface Voter {
    id: number;
    firstName: string;
    lastName: string;
    surName: string;
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
    selectedRole: string;
    createdAt: string;
    faceBiometricImage?: string;
}

const VoterSchema = z.object({
    firstName: z.string().min(2, "First Name is required"),
    lastName: z.string().min(2, "Last Name is required"),
    surName: z.string().min(1, "Surname is required"),
    email: z.string().email("Invalid email address"),
    nationalIdNo: z.string().min(5, "ID No is too short"),
    phoneNumber: z.string().min(10, "Invalid phone number"),
    address: z.string().min(2, "Address is required"),
    location: z.string().min(2, "Location is required"),
    sub_Location: z.string().min(2, "Sub-Location is required"),
    constituency: z.string().min(2, "Constituency is required"),
    county: z.string().min(2, "County is required"),
    region: z.string().min(2, "Region is required"),
    ward: z.string().min(2, "Ward is required"),
    selectedRole: z.enum(["User", "Admin", "Voter", "Candidate", "IEBCOfficial"], {
        message: "Please select a valid role",
    }),
    faceBiometricFile: z.any().optional(),
    faceEmbeddings: z.string().optional()
});

type VoterFormData = z.infer<typeof VoterSchema>

export default function RegisterVoter() {
    const [voters, setVoters] = useState<Voter[]>([]);
    const [loadingVoters, setLoadingVoters] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [faceEmbeddings, setFaceEmbeddings] = useState<number[]>([]);
    const [faceBiometricFile, setFaceBiometricFile] = useState<File | null>(null);
    const [isFaceCaptured, setIsFaceCaptured] = useState(false);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const router = useRouter();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

    const {
        register,
        handleSubmit,
        // control,
        formState: { errors },
        setValue,
        reset
    } = useForm<VoterFormData>({
        resolver: zodResolver(VoterSchema),
        defaultValues: {
            selectedRole: "Voter",
            firstName: "",
            lastName: "",
            surName: "",
            email: "",
            nationalIdNo: "",
            phoneNumber: "",
            address: "",
            location: "",
            sub_Location: "",
            constituency: "",
            county: "",
            region: "",
            ward: "",
            faceEmbeddings: ""
        }
    });

    const fetchVoters = async () => {
        setLoadingVoters(true)
        try {
            const response = await axios.get(`${apiUrl}/api/voter/getAllVoters`)
            setVoters(response.data)
        } catch (error) {
            console.error("Error fetching voters:", error)
            toast.error("Failed to load voter registry")
        } finally {
            setLoadingVoters(false)
        }
    }

    useEffect(() => {
        fetchVoters()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFaceBiometricFile(file);
            setValue("faceBiometricFile", file, { shouldValidate: true, shouldDirty: true });
            setPreview(URL.createObjectURL(file));
            // Clear face capture state when uploading file
            setIsFaceCaptured(false);
            setFaceEmbeddings([]);
            setValue("faceEmbeddings", "", { shouldValidate: true, shouldDirty: true });
            setIsProcessingImage(true); // Start processing
        }
    };

    const handleFaceDetected = (embeddings: number[], capturedImage: File) => {
        setFaceEmbeddings(embeddings);
        setFaceBiometricFile(capturedImage);
        setValue("faceEmbeddings", JSON.stringify(embeddings), { shouldValidate: true, shouldDirty: true });
        setValue("faceBiometricFile", capturedImage, { shouldValidate: true, shouldDirty: true });
        setPreview(URL.createObjectURL(capturedImage));
        setIsFaceCaptured(true);
        setIsProcessingImage(false); // Processing complete
        toast.success("Face captured successfully!");
    };

    const handleFaceError = (error: string) => {
        toast.error(error);
    };

    const onSubmit = async (data: VoterFormData) => {
        setLoading(true);
        try {
            if (editingId) {
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
                    region: data.region
                };
                await axios.put(`${apiUrl}/api/voter/updateVoter/${editingId}`, updatePayload);
                toast.success("Voter profile updated successfully");
            } else {
                if (!isFaceCaptured && faceEmbeddings.length === 0) {
                    toast.error("Face capture is required for registration");
                    setLoading(false);
                    return;
                }

                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (key !== "faceBiometricFile" && value !== undefined) {
                        formData.append(key, value as string);
                    }
                });
                if (faceBiometricFile) {
                    formData.append("faceBiometricFile", faceBiometricFile);
                }
                if (faceEmbeddings.length > 0) {
                    formData.append("faceEmbeddings", JSON.stringify(faceEmbeddings));
                }

                await axios.post(`${apiUrl}/api/voter/registerVoter`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Voter enrolled successfully!");
            }
            
            reset();
            setPreview(null);
            setFaceEmbeddings([]);
            setFaceBiometricFile(null);
            setIsFaceCaptured(false);
            setIsFormOpen(false);
            setEditingId(null);
            fetchVoters();
        } catch (error: unknown) {
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
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will permanently remove the voter and their associated records.")) return
        try {
            await axios.delete(`${apiUrl}/api/voter/deleteVoter/${id}`)
            toast.success("Voter removed from system")
            fetchVoters()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete voter")
        }
    }

    const startEdit = (voter: Voter) => {
        setEditingId(voter.id)
        setValue("firstName", voter.firstName)
        setValue("lastName", voter.lastName)
        setValue("surName", voter.surName)
        setValue("email", voter.email)
        setValue("nationalIdNo", voter.nationalIdNo)
        setValue("phoneNumber", voter.phoneNumber)
        setValue("address", voter.address)
        setValue("location", voter.location)
        setValue("sub_Location", voter.sub_Location)
        setValue("constituency", voter.constituency)
        setValue("county", voter.county)
        setValue("region", voter.region)
        setValue("ward", voter.ward)
        setValue("selectedRole", voter.selectedRole as any)
        
        setPreview(null)
        setIsFaceCaptured(true)
        setIsFormOpen(true)
    }

    const closeForm = () => {
        setIsFormOpen(false)
        setEditingId(null)
        setPreview(null)
        setFaceEmbeddings([])
        setFaceBiometricFile(null)
        setIsFaceCaptured(false)
        reset()
    }

    const filteredVoters = voters.filter(v => 
        v.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.nationalIdNo.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Voter Registry</h2>
                    <p className="text-sm text-muted-foreground">Enroll and manage eligible voters with biometric security</p>
                </div>
                {!isFormOpen && (
                    <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" /> Enroll New Voter
                    </Button>
                )}
            </div>

            {isFormOpen && (
                <Card className="border-t-4 border-t-green-600 shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">{editingId ? "Update Voter Profile" : "Voter Enrollment Form"}</CardTitle>
                            <CardDescription>Fill in the required information to {editingId ? "update" : "register"} a voter.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={closeForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            
                            {!editingId && (
                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl bg-slate-50/50">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-white shadow-lg" />
                                    ) : (
                                        <UploadCloud className="w-12 h-12 text-slate-300 mb-2" />
                                    )}
                                    
                                    {!preview && (
                                        <div className="text-center">
                                            <Label htmlFor="picture" className="cursor-pointer text-green-600 font-bold hover:underline text-sm">
                                                Upload Identity Photo
                                            </Label>
                                            <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">or perform live capture</p>
                                        </div>
                                    )}

                                    <div className="mt-4 w-full max-w-sm">
                                        <FaceRecognition 
                                            onFaceDetected={handleFaceDetected} 
                                            onError={handleFaceError} 
                                            uploadedImage={faceBiometricFile && !isFaceCaptured ? faceBiometricFile : null}
                                            onProcessing={setIsProcessingImage}
                                        />
                                        {faceEmbeddings.length > 0 && (
                                            <p className="text-green-600 text-center text-[10px] font-bold mt-2 uppercase tracking-tighter">✓ Biometric Data Extracted</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">First Name</Label>
                                    <Input {...register("firstName")} placeholder="e.g. Jane" className="h-9" />
                                    {errors.firstName && <p className="text-[10px] text-red-500 font-medium">{errors.firstName.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Last Name</Label>
                                    <Input {...register("lastName")} placeholder="e.g. Doe" className="h-9" />
                                    {errors.lastName && <p className="text-[10px] text-red-500 font-medium">{errors.lastName.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Surname</Label>
                                    <Input {...register("surName")} placeholder="e.g. Anyango" className="h-9" />
                                    {errors.surName && <p className="text-[10px] text-red-500 font-medium">{errors.surName.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">National ID No.</Label>
                                    <Input {...register("nationalIdNo")} placeholder="12345678" className="h-9" disabled={!!editingId} />
                                    {errors.nationalIdNo && <p className="text-[10px] text-red-500 font-medium">{errors.nationalIdNo.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Email Address</Label>
                                    <Input {...register("email")} type="email" placeholder="jane.doe@example.com" className="h-9" disabled={!!editingId} />
                                    {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Phone Number</Label>
                                    <Input {...register("phoneNumber")} placeholder="0711222333" className="h-9" />
                                    {errors.phoneNumber && <p className="text-[10px] text-red-500 font-medium">{errors.phoneNumber.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">System Role</Label>
                                    <select 
                                        {...register("selectedRole")}
                                        className="w-full h-9 px-3 py-1 text-sm border rounded-md bg-white focus:ring-2 focus:ring-green-500"
                                        disabled={!!editingId}
                                    >
                                        <option value="Voter">Voter</option>
                                        <option value="Candidate">Candidate</option>
                                        <option value="IEBCOfficial">IEBC Official</option>
                                        <option value="Admin">Administrator</option>
                                        <option value="User">General User</option>
                                    </select>
                                    {errors.selectedRole && <p className="text-[10px] text-red-500 font-medium">{errors.selectedRole.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Region</Label>
                                    <Input {...register("region")} placeholder="Coast / Rift Valley" className="h-9" />
                                    {errors.region && <p className="text-[10px] text-red-500 font-medium">{errors.region.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">County</Label>
                                    <Input {...register("county")} placeholder="Nairobi" className="h-9" />
                                    {errors.county && <p className="text-[10px] text-red-500 font-medium">{errors.county.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Constituency</Label>
                                    <Input {...register("constituency")} placeholder="Starehe" className="h-9" />
                                    {errors.constituency && <p className="text-[10px] text-red-500 font-medium">{errors.constituency.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Ward</Label>
                                    <Input {...register("ward")} placeholder="CBD" className="h-9" />
                                    {errors.ward && <p className="text-[10px] text-red-500 font-medium">{errors.ward.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Location</Label>
                                    <Input {...register("location")} className="h-9" />
                                    {errors.location && <p className="text-[10px] text-red-500 font-medium">{errors.location.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Sub-Location</Label>
                                    <Input {...register("sub_Location")} className="h-9" />
                                    {errors.sub_Location && <p className="text-[10px] text-red-500 font-medium">{errors.sub_Location.message}</p>}
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase text-slate-500">Physical Address</Label>
                                    <Input {...register("address")} placeholder="123 Uhuru Highway" className="h-9" />
                                    {errors.address && <p className="text-[10px] text-red-500 font-medium">{errors.address.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-6">
                                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading || (!editingId && (!isFaceCaptured || isProcessingImage))} 
                                    className="bg-green-700 hover:bg-green-800 min-w-[160px]"
                                >
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                                    {editingId ? "Update Voter" : isProcessingImage ? "Processing..." : "Complete Enrollment"}
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

                    {loadingVoters ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                            <p className="text-sm text-slate-400 font-medium italic">Syncing voter records...</p>
                        </div>
                    ) : voters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <AlertCircle className="h-16 w-16 text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">No voters registered</h3>
                            <p className="text-slate-500 text-sm mt-1">Start by enrolling the first eligible citizen.</p>
                            <Button variant="link" onClick={() => setIsFormOpen(true)} className="text-green-600 mt-4 font-semibold">
                                <Plus className="w-4 h-4 mr-1" /> Get Started
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredVoters.map((voter) => (
                                <div key={voter.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                                            {voter.faceBiometricImage && voter.faceBiometricImage !== "embeddings_only" ? (
                                                <img src={`${apiUrl}${voter.faceBiometricImage}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCheck className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{voter.fullname}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <Badge variant="outline" className="bg-slate-50 text-[10px] px-2 py-0">ID: {voter.nationalIdNo}</Badge>
                                                <span className="text-[10px] text-slate-400 font-mono">Location: {voter.constituency}, {voter.county}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon-sm" variant="ghost" onClick={() => startEdit(voter)} className="hover:bg-green-50 hover:text-green-600">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(voter.id)} className="hover:bg-red-50 hover:text-red-600">
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