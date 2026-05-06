'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Layers, Search, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface ElectionType {
    id: number;
    type: string;
    description: string;
}

export default function ElectionTypes() {
    const [types, setTypes] = useState<ElectionType[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form state
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/election-type/getAllElectionTypes`);
            setTypes(response.data);
        } catch (error: unknown) {
            toast.error("Failed to fetch election types");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await axios.put(`${apiUrl}/api/election-type/updateElectionType/${editingId}`, {
                    id: editingId,
                    type: type, // Explicitly sending 'type' to match backend DTO
                    description
                });
                toast.success("Election type updated successfully");
            } else {
                await axios.post(`${apiUrl}/api/election-type/addElectionType`, {
                    type: type, // Ensures the key is 'type', not 'typeName'
                    description
                });
                toast.success("Election type created successfully");
            }
            resetForm();
            fetchTypes();
        } catch (error: unknown) {
            let message: unknown = "Failed to save election type";
            if (axios.isAxiosError(error)) {
                message = error.response?.data || message;
            }
            toast.error(typeof message === 'string' ? message : "Failed to save election type");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: ElectionType) => {
        setEditingId(item.id);
        setType(item.type);
        setDescription(item.description);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this election type? This might affect existing elections.")) return;
        try {
            await axios.delete(`${apiUrl}/api/election-type/deleteElectnType/${id}`);
            toast.success("Election type deleted successfully");
            fetchTypes();
        } catch (error: unknown) {
            let message: unknown = "Failed to delete election type";
            if (axios.isAxiosError(error)) {
                message = error.response?.data || message;
            }
            toast.error(typeof message === 'string' ? message : "Failed to delete election type");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setType("");
        setDescription("");
    };

    const filteredTypes = types.filter(t => 
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Form Section */}
                <Card className="w-full md:w-1/3 h-fit border-t-4 border-t-green-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-green-600" />
                            {editingId ? "Edit Election Type" : "Add New Election Type"}
                        </CardTitle>
                        <CardDescription>Define the category of election being held</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Type Name</Label>
                                <Input 
                                    id="name" 
                                    value={type} 
                                    onChange={(e) => setType(e.target.value)} 
                                    placeholder="e.g. General Election, Referendum" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input 
                                    id="desc" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="e.g. National wide voting exercise" 
                                    required 
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
                                    {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Update Type" : "Create Type"}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* List Section */}
                <Card className="flex-1 border-t-4 border-t-slate-800 shadow-lg">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <CardTitle>Configured Election Types</CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search types..." 
                                    className="pl-8" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>
                        ) : filteredTypes.length === 0 ? (
                            <div className="text-center p-12 text-slate-500 border-2 border-dashed rounded-lg">
                                No election types found.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredTypes.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-4 rounded-lg border bg-white hover:border-green-200 hover:shadow-md transition-all">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-slate-800">{t.type}</h3>
                                            <p className="text-sm text-slate-500">{t.description || "No description provided"}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon-sm" variant="outline" onClick={() => handleEdit(t)} title="Edit">
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button size="icon-sm" variant="outline" onClick={() => handleDelete(t.id)} title="Delete">
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
