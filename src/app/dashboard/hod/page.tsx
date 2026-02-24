'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, BarChart3, Users, FileText, Filter, CheckCircle, XCircle, Clock, AlertCircle, Download, Search, RefreshCw, Lock, AlertTriangle, X, MessageSquare, Star } from 'lucide-react';

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'PROJECTS_GUIDED', label: 'Projects Guided' },
    { value: 'ADMIN_ACTIVITIES', label: 'Admin Activities' },
    { value: 'ACHIEVEMENTS', label: 'Achievements' },
    { value: 'COUNSELLING', label: 'Counselling' },
    { value: 'RESEARCH', label: 'Research' },
    { value: 'EVENTS_ATTENDED', label: 'Events Attended' },
    { value: 'EVENTS_CONDUCTED', label: 'Events Conducted' },
    { value: 'PAPERS_PUBLISHED', label: 'Papers Published' },
    { value: 'BOOKS_AUTHORED', label: 'Books Authored' },
    { value: 'PATENTS', label: 'Patents' },
    { value: 'ARTICLES', label: 'Articles' },
    { value: 'STUDENT_ENRICHMENT', label: 'Student Enrichment' },
    { value: 'EXTERNAL_PRESENTATIONS', label: 'External Presentations' },
    { value: 'COURSES_UNDERTAKEN', label: 'Courses Undertaken' },
    { value: 'EXTRA_CURRICULAR', label: 'Extra-Curricular' },
];

const statusClass: Record<string, string> = {
    PENDING: 'badge-pending', UNDER_REVIEW: 'badge-review', APPROVED: 'badge-approved', REJECTED: 'badge-rejected',
};

export default function HODDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('submissions');
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [teachingSubmissions, setTeachingSubmissions] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [filters, setFilters] = useState({ year: '', facultyId: '', category: '', status: '' });
    const [validating, setValidating] = useState<string | null>(null);
    const [revalidating, setRevalidating] = useState<string | null>(null);
    const [marks, setMarks] = useState('');
    const [comment, setComment] = useState('');
    const [revalReason, setRevalReason] = useState('');
    const [revalMarks, setRevalMarks] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
            const [subRes, tsRes, facRes, fbRes] = await Promise.all([
                fetch(`/api/hod/submissions?${params.toString()}`),
                fetch(`/api/hod/submissions?type=teaching&${params.toString()}`),
                fetch('/api/hod/faculty'),
                fetch('/api/hod/feedback'),
            ]);
            if (subRes.ok) setSubmissions(await subRes.json());
            if (tsRes.ok) setTeachingSubmissions(await tsRes.json());
            if (facRes.ok) setFaculty(await facRes.json());
            if (fbRes.ok) setFeedback(await fbRes.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchAll(); }, [filters]);

    const handleValidate = async (id: string, type: string, status: string) => {
        try {
            const res = await fetch('/api/hod/submissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, status, marks, comment }),
            });
            if (res.ok) {
                setValidating(null); setMarks(''); setComment('');
                setSuccessMsg(`Submission ${status.toLowerCase()} successfully!`);
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchAll();
            }
        } catch (e) { console.error(e); }
    };

    const handleRevalidate = async (id: string, type: string) => {
        if (!revalReason.trim()) {
            setErrorMsg('Reason for modification is required');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }
        try {
            const res = await fetch('/api/hod/submissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id, type: type === 'teaching' ? 'teaching' : 'activity',
                    action: 'REVALIDATE', marks: revalMarks, reason: revalReason,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || 'Revalidation failed');
                setTimeout(() => setErrorMsg(''), 3000);
                return;
            }
            setRevalidating(null); setRevalReason(''); setRevalMarks('');
            setSuccessMsg('Score revalidated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAll();
        } catch (e) {
            setErrorMsg('Failed to revalidate');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const user = session?.user as any;
    const pending = submissions.filter(s => s.status === 'PENDING').length + teachingSubmissions.filter(t => t.status === 'PENDING').length;
    const approved = submissions.filter(s => s.status === 'APPROVED').length + teachingSubmissions.filter(t => t.status === 'APPROVED').length;
    const total = submissions.length + teachingSubmissions.length;

    const handleDownloadReport = () => {
        import('jspdf').then(({ jsPDF }) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF();
                doc.setFontSize(18);
                doc.text('Faculty Performance Report', 14, 22);
                doc.setFontSize(11);
                doc.text(`Department: ${user?.departmentName || 'CSE'}`, 14, 32);
                doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
                const tableData = submissions.map(s => [s.faculty?.name, s.category, s.title, s.academicYear, s.status, s.marks ?? '-']);
                (doc as any).autoTable({
                    startY: 45,
                    head: [['Faculty', 'Category', 'Title', 'Year', 'Status', 'Marks']],
                    body: tableData,
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [79, 70, 229] },
                });
                doc.save('faculty-report.pdf');
            });
        });
    };

    return (
        <DashboardLayout>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>HOD Dashboard</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.name} • {user?.departmentName || 'Department'}</p>
                    </div>
                    <button onClick={handleDownloadReport} className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px' }}>
                        <Download size={16} /> Download Report
                    </button>
                </div>

                <div className="tab-list" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                    {[{ id: 'submissions', label: '📋 Submissions' }, { id: 'teaching', label: '📊 Teaching' }, { id: 'faculty', label: '👥 Faculty' }, { id: 'feedback', label: '💬 Feedback' }].map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                    ))}
                </div>

                <div>
                    {successMsg && (
                        <div className="animate-fade-in" style={{ padding: '14px 20px', borderRadius: '12px', background: '#D1FAE5', color: '#065F46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                            <CheckCircle size={18} /> {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="animate-fade-in" style={{ padding: '14px 20px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                            <AlertCircle size={18} /> {errorMsg}
                        </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <div className="stats-card indigo"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Submissions</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{total}</div></div>
                        <div className="stats-card amber"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Pending Review</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#92400E' }}>{pending}</div></div>
                        <div className="stats-card green"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Approved</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46' }}>{approved}</div></div>
                        <div className="stats-card blue"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Faculty Members</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#1E40AF' }}>{faculty.length}</div></div>
                    </div>

                    {/* Filters */}
                    <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Filter size={16} color="#64748B" />
                        <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }} value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })}>
                            <option value="">All Years</option>
                            <option value="2024-25">2024-25</option>
                            <option value="2023-24">2023-24</option>
                        </select>
                        <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }} value={filters.facultyId} onChange={e => setFilters({ ...filters, facultyId: e.target.value })}>
                            <option value="">All Faculty</option>
                            {faculty.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <select className="input" style={{ width: 'auto', padding: '8px 12px', fontSize: '13px' }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Submissions Table */}
                    {(activeTab === 'submissions' || activeTab === 'teaching') && (
                        <div className="card animate-fade-in" style={{ padding: '0' }}>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Faculty</th>
                                            <th>{activeTab === 'teaching' ? 'Subject' : 'Title'}</th>
                                            <th>{activeTab === 'teaching' ? 'Score' : 'Category'}</th>
                                            <th>Year</th>
                                            <th>Status</th>
                                            <th>Marks</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(activeTab === 'teaching' ? teachingSubmissions : submissions).map((item) => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: 500 }}>{item.faculty?.name}</td>
                                                <td>{activeTab === 'teaching' ? item.subject?.name : item.title}</td>
                                                <td>{activeTab === 'teaching' ? `${item.score}%` : (categories.find(c => c.value === item.category)?.label || item.category)}</td>
                                                <td>{item.academicYear}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span className={`badge ${statusClass[item.status]}`}>{item.status.replace('_', ' ')}</span>
                                                        {item.isLocked && <span title="Locked by Principal"><Lock size={12} color="#7C3AED" /></span>}
                                                        {item.lastModifiedAt && <span title={`Modified: ${item.modificationReason || 'Score was modified'}`}><AlertTriangle size={12} color="#D97706" /></span>}
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{item.marks ?? '-'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                        {(item.status === 'PENDING' || item.status === 'UNDER_REVIEW') && !item.isLocked && (
                                                            validating === item.id ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
                                                                    <input className="input" style={{ padding: '6px 10px', fontSize: '12px' }} type="number" placeholder="Marks (0-10)" value={marks} onChange={e => setMarks(e.target.value)} min="0" max="10" step="0.5" />
                                                                    <input className="input" style={{ padding: '6px 10px', fontSize: '12px' }} placeholder="Comment" value={comment} onChange={e => setComment(e.target.value)} />
                                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                                        <button onClick={() => handleValidate(item.id, activeTab === 'teaching' ? 'teaching' : 'activity', 'APPROVED')} className="btn-success" style={{ fontSize: '11px', padding: '4px 10px' }}>Approve</button>
                                                                        <button onClick={() => handleValidate(item.id, activeTab === 'teaching' ? 'teaching' : 'activity', 'REJECTED')} className="btn-danger" style={{ fontSize: '11px', padding: '4px 10px' }}>Reject</button>
                                                                        <button onClick={() => setValidating(null)} style={{ fontSize: '11px', padding: '4px 8px', background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setValidating(item.id)} className="btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }}>
                                                                    <Shield size={12} /> Validate
                                                                </button>
                                                            )
                                                        )}
                                                        {(item.status === 'APPROVED' || item.status === 'REJECTED') && !item.isLocked && (
                                                            <button onClick={() => { setRevalidating(item.id); setRevalMarks(item.marks?.toString() || ''); }}
                                                                style={{ fontSize: '11px', padding: '6px 12px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                                                <RefreshCw size={12} /> Revalidate
                                                            </button>
                                                        )}
                                                        {item.isLocked && (
                                                            <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Lock size={12} /> Locked
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Faculty Overview */}
                    {activeTab === 'faculty' && (
                        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {faculty.map((f: any) => {
                                const fActivities = submissions.filter(s => s.facultyId === f.id);
                                const fApproved = fActivities.filter(s => s.status === 'APPROVED');
                                const fTotalMarks = fApproved.reduce((sum: number, s: any) => sum + (s.marks || 0), 0);
                                return (
                                    <div key={f.id} className="card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #4F46E5, #818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px' }}>
                                                {f.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '15px' }}>{f.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748B' }}>{f.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                            <div style={{ textAlign: 'center', padding: '10px', background: '#F8FAFC', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#4F46E5' }}>{fActivities.length}</div>
                                                <div style={{ fontSize: '11px', color: '#64748B' }}>Total</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '10px', background: '#ECFDF5', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#059669' }}>{fApproved.length}</div>
                                                <div style={{ fontSize: '11px', color: '#64748B' }}>Approved</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '10px', background: '#EEF2FF', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#4F46E5' }}>{fTotalMarks}</div>
                                                <div style={{ fontSize: '11px', color: '#64748B' }}>Marks</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Student Feedback Tab */}
                    {activeTab === 'feedback' && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                <div className="stats-card amber"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Feedback</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{feedback.length}</div></div>
                                <div className="stats-card green"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Avg Rating</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#059669' }}>{feedback.length ? (feedback.reduce((s: number, f: any) => s + f.rating, 0) / feedback.length).toFixed(1) : '-'}</div></div>
                            </div>
                            <div className="card" style={{ padding: '0' }}>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Student Feedback</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>View feedback given by students to faculty in your department</p>
                                </div>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Faculty</th>
                                                <th>Subject</th>
                                                <th>Rating</th>
                                                <th>Comment</th>
                                                <th>Student</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feedback.map((f: any) => (
                                                <tr key={f.id}>
                                                    <td style={{ fontWeight: 600 }}>{f.faculty?.name || 'N/A'}</td>
                                                    <td>{f.subject?.name || 'N/A'}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} size={14} fill={s <= f.rating ? '#F59E0B' : 'none'} color={s <= f.rating ? '#F59E0B' : '#E2E8F0'} />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.comment || '-'}</td>
                                                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f.studentName}</td>
                                                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {feedback.length === 0 && (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No feedback received yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Revalidation Modal */}
                {revalidating && (
                    <div className="modal-overlay" onClick={() => setRevalidating(null)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RefreshCw size={18} color="#D97706" /> Revalidate Score
                                </h3>
                                <button onClick={() => setRevalidating(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ padding: '12px 16px', background: '#FFFBEB', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#92400E', display: 'flex', alignItems: 'flex-start', gap: '8px', border: '1px solid #FCD34D' }}>
                                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>This action will modify the previously assigned score. All changes are tracked in the audit log.</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label className="input-label">New Marks</label>
                                    <input className="input" type="number" placeholder="Enter new marks (0-10)" value={revalMarks} onChange={e => setRevalMarks(e.target.value)} min="0" max="10" step="0.5" />
                                </div>
                                <div>
                                    <label className="input-label">Reason for Modification *</label>
                                    <textarea className="input" placeholder="Explain why the score needs to be changed..." value={revalReason} onChange={e => setRevalReason(e.target.value)}
                                        style={{ minHeight: '80px', resize: 'vertical' }} />
                                </div>
                                <button onClick={() => handleRevalidate(revalidating, activeTab)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <RefreshCw size={16} /> Submit Revalidation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
