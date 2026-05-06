'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Search, Trash2, Edit, Award } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface ElectionPosition {
    id: number;
    position: string;
    description: string;
}

export default function ElectionPositions() {
    const [positions, setPositions] = useState<ElectionPosition[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form state
    const [position, setPosition] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/election-position/getAllPositions`);
            setPositions(response.data);
        } catch (error: unknown) {
            toast.error("Failed to fetch election positions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await axios.put(`${apiUrl}/api/election-position/updatePosition/${editingId}`, {
                    id: editingId,
                    position,
                    description
                });
                toast.success("Position updated successfully");
            } else {
                await axios.post(`${apiUrl}/api/election-position/addPosition`, {
                    position,
                    description
                });
                toast.success("Position created successfully");
            }
            resetForm();
            fetchPositions();
        } catch (error: unknown) {
            let message: unknown = "Failed to save position";
            if (axios.isAxiosError(error)) {
                message = error.response?.data || message;
            }
            toast.error(typeof message === 'string' ? message : "Failed to save position");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (pos: ElectionPosition) => {
        setEditingId(pos.id);
        setPosition(pos.position);
        setDescription(pos.description);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this position?")) return;
        try {
            await axios.delete(`${apiUrl}/api/election-position/deletePosition/${id}`);
            toast.success("Position deleted successfully");
            fetchPositions();
        } catch (error: unknown) {
            let message: unknown = "Failed to delete position";
            if (axios.isAxiosError(error)) {
                message = error.response?.data || message;
            }
            toast.error(typeof message === 'string' ? message : "Failed to delete position");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setPosition("");
        setDescription("");
    };

    const filteredPositions = positions.filter(pos => 
        pos.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Form Section */}
                <Card className="w-full md:w-1/3 h-fit border-t-4 border-t-green-600">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            {editingId ? "Edit Position" : "Add New Position"}
                        </CardTitle>
                        <CardDescription>Define roles for candidates to vie for</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Position Name</Label>
                                <Input 
                                    id="name" 
                                    value={position} 
                                    onChange={(e) => setPosition(e.target.value)} 
                                    placeholder="e.g. President, Governor" 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input 
                                    id="desc" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Brief role description" 
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
                                    {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Update" : "Create"}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* List Section */}
                <Card className="flex-1 border-t-4 border-t-slate-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Election Positions</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search positions..." 
                                    className="pl-8" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredPositions.map((pos) => (
                                    <div key={pos.id} className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{pos.position}</h3>
                                            <p className="text-sm text-slate-500">{pos.description || "No description provided"}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon-sm" variant="outline" onClick={() => handleEdit(pos)}>
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button size="icon-sm" variant="outline" onClick={() => handleDelete(pos.id)}>
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
