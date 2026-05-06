'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, Search, Trash2, Edit, Plus, Clock, Globe, Award, User } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface ElectionType {
    id: number;
    type: string;
}

interface ElectionPosition {
    id: number;
    position: string;
}

interface Election {
    id: number;
    electionName: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    electionTypeId: number;
    electionType?: string;
    electionPositionId: number;
    electionPosition?: string;
    createdBy?: string;
}

export default function ManageElections() {
    const [elections, setElections] = useState<Election[]>([]);
    const [types, setTypes] = useState<ElectionType[]>([]);
    const [positions, setPositions] = useState<ElectionPosition[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        electionName: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "Upcoming",
        electionTypeId: "",
        electionPositionId: "",
        createdBy: "" // Required for lookup in backend
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

    const fetchData = async () => {
        setLoading(true);
        try {
            const [electionRes, typeRes, positionRes] = await Promise.all([
                axios.get(`${apiUrl}/api/elections/getAllElections`),
                axios.get(`${apiUrl}/api/election-type/getAllElectionTypes`),
                axios.get(`${apiUrl}/api/election-position/getAllPositions`)
            ]);
            setElections(electionRes.data);
            setTypes(typeRes.data);
            setPositions(positionRes.data);
        } catch (error) {
            toast.error("Failed to load election configurations");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const selectedType = types.find(t => t.id.toString() === formData.electionTypeId);
        const isGeneral = selectedType?.type.toLowerCase() === "general election";

        if (!formData.electionTypeId || (!isGeneral && !formData.electionPositionId)) {
            return toast.error("Please provide all required fields");
        }
        
        setSubmitting(true);
        try {
            const selectedPos = positions.find(p => p.id.toString() === formData.electionPositionId);

            const payload = {
                ...formData,
                electionTypeId: parseInt(formData.electionTypeId),
                electionType: selectedType?.type || "",
                electionPositionId: isGeneral ? 0 : parseInt(formData.electionPositionId), // Set to 0 for General Election
                electionPosition: isGeneral ? "All Positions" : (selectedPos?.position || ""),
                id: editingId || 0 
            };

            if (editingId) {
                await axios.put(`${apiUrl}/api/elections/updateElection/${editingId}`, payload);
                toast.success("Election schedule updated");
            } else {
                await axios.post(`${apiUrl}/api/elections/addElection`, payload);
                toast.success("New election launched successfully");
            }
            resetForm();
            fetchData();
        } catch (error) {
            toast.error("Failed to save election details");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: Election) => {
        setEditingId(item.id);
        // Format ISO date string to YYYY-MM-DDTHH:mm for the datetime-local input
        const formatDate = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 16);
        
        setFormData({
            electionName: item.electionName,
            description: item.description,
            startDate: formatDate(item.startDate),
            endDate: formatDate(item.endDate),
            status: item.status,
            electionTypeId: item.electionTypeId.toString(),
            electionPositionId: item.electionPositionId.toString(),
            createdBy: item.createdBy || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Permanent Action: Delete this election? All results and candidate associations will be lost.")) return;
        try {
            await axios.delete(`${apiUrl}/api/elections/deleteElection/${id}`);
            toast.success("Election removed from system");
            fetchData();
        } catch (error) {
            toast.error("Delete operation failed");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ 
            electionName: "", 
            description: "", 
            startDate: "", 
            endDate: "", 
            status: "Upcoming", 
            electionTypeId: "", 
            electionPositionId: "",
            createdBy: ""
        });
    };

    const filteredElections = elections.filter(e => 
        e.electionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Creation Form */}
                <Card className="w-full lg:w-1/3 h-fit border-t-4 border-t-green-600 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            {editingId ? "Modify Election" : "Initialize Election"}
                        </CardTitle>
                        <CardDescription>Setup the scope and timeframe for voting</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Election Title</Label>
                                <Input 
                                    value={formData.electionName} 
                                    onChange={(e) => setFormData({...formData, electionName: e.target.value})} 
                                    placeholder="e.g. 2027 General Election" required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Election Type</Label>
                                    <Select value={formData.electionTypeId} onValueChange={(v) => setFormData({...formData, electionTypeId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {types.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.type}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    {types.find(t => t.id.toString() === formData.electionTypeId)?.type.toLowerCase() === "general election" ? (
                                        <div className="h-10 px-3 py-2 rounded-md border border-input bg-slate-100 text-slate-500 text-sm flex items-center">
                                            Automatically includes all positions
                                        </div>
                                    ) : (
                                        <Select 
                                            value={formData.electionPositionId} 
                                            onValueChange={(v) => setFormData({...formData, electionPositionId: v})}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select Position" /></SelectTrigger>
                                            <SelectContent>
                                                {positions.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.position}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Current Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Admin Email</Label>
                                    <Input 
                                        value={formData.createdBy} 
                                        onChange={(e) => setFormData({...formData, createdBy: e.target.value})} 
                                        placeholder="admin@iebc.go.ke" 
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Polls Open</Label>
                                <Input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Polls Close</Label>
                                <Input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Election details..." />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
                                    {submitting ? <Loader2 className="animate-spin" /> : editingId ? "Update Schedule" : "Create Election"}
                                </Button>
                                {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Active Registry */}
                <Card className="flex-1 border-t-4 border-t-slate-800 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Election Registry</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search elections..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-green-600" /></div>
                        ) : elections.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-xl">No active or scheduled elections found.</div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredElections.map((e) => (
                                    <div key={e.id} className="p-5 rounded-xl border bg-slate-50/50 hover:bg-white hover:border-green-300 hover:shadow-md transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-slate-900">{e.electionName}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                                                        e.status === 'Ongoing' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        e.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-slate-200 text-slate-600 border-slate-300'
                                                    }`}>
                                                        {e.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-green-600" /> <b>Start:</b> {new Date(e.startDate).toLocaleString()}</div>
                                                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-red-600" /> <b>End:</b> {new Date(e.endDate).toLocaleString()}</div>
                                                    <div className="flex items-center gap-1.5 text-slate-700 font-medium"><Globe className="w-4 h-4" /> {e.electionType || "Standard Poll"}</div>
                                                    <div className="flex items-center gap-1.5 text-slate-700 font-medium"><Award className="w-4 h-4 text-amber-600" /> {e.electionPosition}</div>
                                                </div>
                                                <p className="text-slate-600 text-sm line-clamp-2 max-w-2xl italic">"{e.description || "No description provided for this election event."}"</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon-sm" variant="outline" onClick={() => handleEdit(e)} title="Edit"><Edit className="h-4 w-4 text-blue-600" /></Button>
                                                <Button size="icon-sm" variant="outline" onClick={() => handleDelete(e.id)} title="Delete"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                            </div>
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
