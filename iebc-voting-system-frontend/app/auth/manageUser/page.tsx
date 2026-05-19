'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Trash2, Edit, Plus, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SignInForm } from "../signIn/page";

// Simple Dialog component (can be replaced with a more robust UI library component)
const Dialog = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};
// Define the schema for a user
interface ApplicationUser {
    id: string;
    firstName: string;
    lastName: string;
    surName?: string;
    email: string;
    nationalIdNo: string;
    phoneNumber: string;
    roles: string[];
    // Add other relevant fields from ApplicationUser if needed
}

// Define the schema for the form data
const UserFormSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    surName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    nationalIdNo: z.string().min(5, "National ID is required"),
    phoneNumber: z.string().min(10, "Phone Number is required"),
    roles: z.array(z.string()).min(1, "At least one role is required"),
});

type UserFormData = z.infer<typeof UserFormSchema>;

export default function UserManagementPage() {
    const [users, setUsers] = useState<ApplicationUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [authError, setAuthError] = useState<string | null>(null); // State to hold the authentication error message
    const [showLoginPromptDialog, setShowLoginPromptDialog] = useState(false); // State to control the login prompt dialog
    const [editingUser, setEditingUser] = useState<ApplicationUser | null>(null);
    const [availableRoles, setAvailableRoles] = useState<string[]>(["User", "Voter", "Candidate", "Admin", "IEBCOfficial"]); // Example roles

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<UserFormData>({
        resolver: zodResolver(UserFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            surName: "",
            email: "",
            nationalIdNo: "",
            phoneNumber: "",
            roles: [],
        }
    });

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setAuthError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get<ApplicationUser[]>(`${apiUrl}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data); // Assuming response.data is an array of ApplicationUser
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    setAuthError("You are not logged in or your session has expired.");
                } else if (error.response?.status === 403) {
                    setAuthError("Access denied. Only system administrators can manage users.");
                } else {
                    toast.error(`Error fetching users: ${error.message}`);
                }
            } else {
                toast.error("An unexpected error occurred.");
            }
            console.error("Error fetching users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSubmit = async (data: UserFormData) => {
        setSubmitting(true);
        try {
            if (editingUser) {
                const token = localStorage.getItem("token");
                // NOTE: This endpoint needs to be implemented in your backend (e.g., in AdminController)
                // Ensure surName and phoneNumber are not undefined when sending to backend
                const payload = { ...data, surName: data.surName ?? "", phoneNumber: data.phoneNumber ?? "" };

                await axios.put(`${apiUrl}/api/admin/users/${editingUser.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("User updated successfully!");
            } else {
                // NOTE: This would typically be handled by AuthController.Register, but for admin management,
                // you might have a separate endpoint that allows creating users with specific roles directly.
                // For this example, we'll assume this form is only for editing existing users.
                toast.error("User creation is not supported via this form. Use the 'Create Account' option.");
            }
            resetFormState();
            fetchUsers();
        } catch (error) {
            toast.error(`Failed to save user details: ${axios.isAxiosError(error) ? error.message : 'Unknown error'}`);
            console.error("Error saving user:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (user: ApplicationUser) => {
        setEditingUser(user);
        setValue("id", user.id);
        setValue("firstName", user.firstName);
        setValue("lastName", user.lastName);
        setValue("surName", user.surName || "");
        setValue("email", user.email);
        setValue("nationalIdNo", user.nationalIdNo);
        setValue("phoneNumber", user.phoneNumber);
        setValue("roles", user.roles);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            const token = localStorage.getItem("token");
            // NOTE: This endpoint needs to be implemented in your backend (e.g., in AdminController)
            await axios.delete(`${apiUrl}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("User deleted successfully!");
            fetchUsers();
        } catch (error: any) {
            toast.error("Failed to delete user.");
            console.error("Error deleting user:", error);
        }
    };

    const resetFormState = () => {
        setEditingUser(null);
        reset();
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nationalIdNo.includes(searchTerm)
    );

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                    <p className="text-sm text-muted-foreground">Manage system users, their details, and roles.</p>
                </div>
                {/* Optionally add a "Create New User" button if you implement a dedicated endpoint */}
            </div>

            <Card className="w-full h-fit border-t-4 border-t-blue-600 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        {editingUser ? "Edit User Details" : "View User Details"}
                    </CardTitle>
                    <CardDescription>
                        {editingUser ? `Editing user: ${editingUser.firstName} ${editingUser.lastName}` : "Select a user from the list to edit their details."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {editingUser ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" {...register("firstName")} />
                                    {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" {...register("lastName")} />
                                    {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="surName">Surname</Label>
                                    <Input id="surName" {...register("surName")} placeholder="Anyango" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" {...register("email")} disabled /> {/* Email usually not editable */}
                                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationalIdNo">National ID No.</Label>
                                    <Input id="nationalIdNo" {...register("nationalIdNo")} disabled /> {/* National ID usually not editable */}
                                    {errors.nationalIdNo && <span className="text-red-500 text-xs">{errors.nationalIdNo.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input id="phoneNumber" {...register("phoneNumber")} />
                                    {errors.phoneNumber && <span className="text-red-500 text-xs">{errors.phoneNumber.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roles">Roles</Label>
                                    <Controller
                                        name="roles"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => field.onChange([value])} // Assuming single role selection for simplicity
                                                value={field.value?.[0] || ""}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRoles.map(role => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.roles && <span className="text-red-500 text-xs">{errors.roles.message}</span>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={resetFormState}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="animate-spin mr-2" /> : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            No user selected for editing.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="flex-1 border-t-4 border-t-slate-800 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All System Users</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingUsers ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
                    ) : authError ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <AlertCircle className="h-16 w-16 text-red-500" />
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900">Access Restricted</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">{authError}</p>
                            </div>                            
                            <Button onClick={() => setShowLoginPromptDialog(true)} className="bg-blue-600 hover:bg-blue-700 font-bold">
                                SIGN IN NOW
                            </Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-xl">No users found in the system.</div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="p-4 rounded-xl border bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all group flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{user.firstName} {user.lastName}</h3>
                                        <p className="text-sm text-slate-600">{user.email}</p>
                                        <p className="text-xs text-slate-500">ID: {user.nationalIdNo} | Roles: {user.roles.join(", ")}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon-sm" variant="outline" onClick={() => handleEdit(user)} title="Edit User"><Edit className="h-4 w-4 text-blue-600" /></Button>
                                        <Button size="icon-sm" variant="outline" onClick={() => handleDelete(user.id)} title="Delete User"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Login Prompt Dialog */}
            <Dialog isOpen={showLoginPromptDialog} onClose={() => setShowLoginPromptDialog(false)}>
                <SignInForm />
            </Dialog>
        </div>
    );
}