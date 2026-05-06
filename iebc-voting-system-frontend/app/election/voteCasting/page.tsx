'use client';

import React, { useState, useEffect } from 'react';
import FaceRecognition from '@/components/FaceRecognition';
import { useRouter } from 'next/navigation';

export default function CastVotePage() {
    const [elections, setElections] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [selectedElectionId, setSelectedElectionId] = useState<string>('');
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [voterEmail, setVoterEmail] = useState<string>('');
    const [liveEmbeddings, setLiveEmbeddings] = useState<number[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | '' }>({ text: '', type: '' });

    const router = useRouter();

    // Load active elections on mount
    useEffect(() => {
        const fetchElections = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/election`);
                if (response.ok) {
                    const data = await response.json();
                    // Only show ongoing elections to the voter
                    setElections(data.filter((e: any) => e.status === 'Ongoing'));
                }
            } catch (error) {
                console.error('Error fetching elections:', error);
            }
        };
        fetchElections();
    }, []);

    // Fetch candidates when election changes
    useEffect(() => {
        if (selectedElectionId) {
            const fetchCandidates = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate/election/${selectedElectionId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setCandidates(data);
                    }
                } catch (error) {
                    console.error('Error fetching candidates:', error);
                }
            };
            fetchCandidates();
        } else {
            setCandidates([]);
        }
    }, [selectedElectionId]);

    const handleFaceCaptured = (embeddings: number[], capturedImage: File) => {
        setLiveEmbeddings(embeddings);
        setMessage({ text: 'Biometric verification ready. Your identity will be confirmed upon submission.', type: 'success' });
    };

    const handleCastVote = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!voterEmail || !selectedElectionId || !selectedCandidateId || !liveEmbeddings) {
            setMessage({ text: 'Please complete all steps, including the face scan.', type: 'error' });
            return;
        }

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const voteRequest = {
                voterEmail: voterEmail,
                electionId: parseInt(selectedElectionId),
                candidateId: parseInt(selectedCandidateId),
                liveFaceEmbeddings: JSON.stringify(liveEmbeddings)
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vote-casting/castVote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(voteRequest),
            });

            if (response.ok) {
                setMessage({ text: 'Vote cast successfully! Your voice has been heard.', type: 'success' });
                setTimeout(() => router.push('/dashboard'), 3000);
            } else {
                const result = await response.json();
                setMessage({ text: result.message || 'Verification failed or you have already voted.', type: 'error' });
            }
        } catch (error) {
            console.error('Error casting vote:', error);
            setMessage({ text: 'A server error occurred. Please check your connection.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-blue-900 mb-8 border-b pb-4">
                    IEBC Digital Ballot Box
                </h1>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg text-center font-medium shadow-inner ${
                        message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCastVote} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Email Address</label>
                        <input
                            type="email"
                            value={voterEmail}
                            onChange={(e) => setVoterEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Active Election</label>
                        <select
                            value={selectedElectionId}
                            onChange={(e) => setSelectedElectionId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">-- Choose Election --</option>
                            {elections.map((election) => (
                                <option key={election.id} value={election.id}>{election.electionName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Candidate</label>
                        <select
                            value={selectedCandidateId}
                            onChange={(e) => setSelectedCandidateId(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                            disabled={!selectedElectionId}
                            required
                        >
                            <option value="">-- Choose Candidate --</option>
                            {candidates.map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>{candidate.fullname} ({candidate.party})</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-4 text-center italic">
                            Identity Verification Scan
                        </label>
                        <div className="flex justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4">
                            {!liveEmbeddings ? (
                                <FaceRecognition 
                                    onFaceDetected={handleFaceCaptured}
                                    onError={(err: string) => setMessage({ text: err, type: 'error' })}
                                    onProcessing={setIsProcessing}
                                />
                            ) : (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-green-600 font-bold">Face Data Verified</p>
                                    <button type="button" onClick={() => setLiveEmbeddings(null)} className="text-xs text-blue-500 hover:underline mt-2">Retake Scan</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !liveEmbeddings || isProcessing}
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${
                            isLoading || !liveEmbeddings || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        }`}
                    >
                        {isLoading ? 'Verifying & Casting...' : isProcessing ? 'Processing Scan...' : 'CONFIRM AND CAST VOTE'}
                    </button>
                </form>
            </div>
        </div>
    );
}