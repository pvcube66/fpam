'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Star, CheckCircle, Send, MessageSquare } from 'lucide-react';

export default function StudentFeedbackPortal() {
    const { data: session } = useSession();
    const [feedbackData, setFeedbackData] = useState<any>({ faculty: [], subjects: [] });
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetch('/api/feedback').then(r => r.json()).then(setFeedbackData).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        const res = await fetch('/api/feedback', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ facultyId: selectedFaculty, subjectId: selectedSubject, rating, comment, isAnonymous }),
        });
        if (res.ok) {
            setSubmitted(true);
            setSuccessMsg('Feedback submitted successfully! Thank you for your input.');
            setSelectedFaculty(''); setSelectedSubject(''); setRating(0); setComment(''); setIsAnonymous(false);
            setTimeout(() => { setSuccessMsg(''); setSubmitted(false); }, 5000);
        }
    };

    const user = session?.user as any;

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Student Feedback Portal</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.name} • Anonymous Feedback Enabled</p>
                </div>
                {successMsg && (
                    <div className="animate-fade-in" style={{
                        padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                        color: '#065F46', marginBottom: '24px', textAlign: 'center',
                    }}>
                        <CheckCircle size={48} style={{ margin: '0 auto 12px', display: 'block' }} />
                        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Thank You!</div>
                        <div style={{ fontSize: '14px' }}>{successMsg}</div>
                    </div>
                )}

                {!submitted && (
                    <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #0891B2, #06B6D4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <MessageSquare size={32} color="white" />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Faculty Feedback Form</h3>
                            <p style={{ fontSize: '14px', color: '#64748B' }}>Your feedback helps improve teaching quality</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label className="input-label">Select Faculty</label>
                                <select className="input" value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} required>
                                    <option value="">Choose a faculty member</option>
                                    {feedbackData.faculty?.map((f: any) => (
                                        <option key={f.id} value={f.id}>{f.name} — {f.department?.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label className="input-label">Select Subject</label>
                                <select className="input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required>
                                    <option value="">Choose a subject</option>
                                    {feedbackData.subjects?.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label className="input-label">Rating</label>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '16px 0' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                transform: (hoverRating >= star || rating >= star) ? 'scale(1.2)' : 'scale(1)',
                                                transition: 'all 0.2s',
                                            }}>
                                            <Star size={40} fill={(hoverRating >= star || rating >= star) ? '#F59E0B' : 'none'}
                                                color={(hoverRating >= star || rating >= star) ? '#F59E0B' : '#E2E8F0'}
                                                strokeWidth={1.5} />
                                        </button>
                                    ))}
                                </div>
                                <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                                    {rating === 0 ? 'Click to rate' : rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
                                </p>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label className="input-label">Comments (Optional)</label>
                                <textarea className="input" value={comment} onChange={e => setComment(e.target.value)}
                                    placeholder="Share your thoughts about the teaching quality, course content, etc."
                                    style={{ minHeight: '100px', resize: 'vertical' }} />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                                    background: '#F8FAFC', borderRadius: '10px', cursor: 'pointer',
                                    border: '2px solid', borderColor: isAnonymous ? '#0891B2' : '#E2E8F0',
                                    transition: 'all 0.2s',
                                }}>
                                    <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: '#0891B2' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#1E293B' }}>Submit Anonymously</div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>Your identity will not be visible to faculty</div>
                                    </div>
                                </label>
                            </div>

                            <button type="submit" className="btn-primary" disabled={rating === 0}
                                style={{
                                    width: '100%', justifyContent: 'center', padding: '14px',
                                    fontSize: '15px', opacity: rating === 0 ? 0.5 : 1,
                                    background: 'linear-gradient(135deg, #0891B2, #06B6D4)',
                                }}>
                                <Send size={18} /> Submit Feedback
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
