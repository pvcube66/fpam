'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Award, FileText, Plus, BarChart3, Upload, X, Clock, CheckCircle, XCircle, AlertCircle, UploadCloud } from 'lucide-react';
import { PERFORMANCE_CATEGORIES } from '@/lib/marks-formula';

const categories = [
    { value: 'PROJECTS_GUIDED', label: 'Projects Guided' },
    { value: 'ADMIN_ACTIVITIES', label: 'Administrative Activities' },
    { value: 'ACHIEVEMENTS', label: 'Achievements & Awards' },
    { value: 'COUNSELLING', label: 'Counselling Activities' },
    { value: 'RESEARCH', label: 'Research Projects' },
    { value: 'EVENTS_ATTENDED', label: 'Events Attended' },
    { value: 'EVENTS_CONDUCTED', label: 'Events Conducted' },
    { value: 'PAPERS_PUBLISHED', label: 'Papers Published' },
    { value: 'BOOKS_AUTHORED', label: 'Books Authored' },
    { value: 'PATENTS', label: 'Patents Filed' },
    { value: 'ARTICLES', label: 'Articles Published' },
    { value: 'STUDENT_ENRICHMENT', label: 'Student Enrichment' },
    { value: 'EXTERNAL_PRESENTATIONS', label: 'External Presentations' },
    { value: 'COURSES_UNDERTAKEN', label: 'Courses Undertaken' },
    { value: 'EXTRA_CURRICULAR', label: 'Extra-Curricular' },
];

const statusIcon: Record<string, any> = {
    PENDING: <Clock size={14} />,
    UNDER_REVIEW: <AlertCircle size={14} />,
    APPROVED: <CheckCircle size={14} />,
    REJECTED: <XCircle size={14} />,
};

const statusClass: Record<string, string> = {
    PENDING: 'badge-pending',
    UNDER_REVIEW: 'badge-review',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
};

export default function FacultyDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [activities, setActivities] = useState<any[]>([]);
    const [teachingScores, setTeachingScores] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState<'activity' | 'teaching'>('activity');
    const [formData, setFormData] = useState({ category: 'PAPERS_PUBLISHED', title: '', description: '', academicYear: '2024-25', subjectId: '', score: '' });
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [actRes, tsRes, subRes] = await Promise.all([
                fetch('/api/activities'),
                fetch('/api/teaching-scores'),
                fetch('/api/subjects'),
            ]);
            if (actRes.ok) setActivities(await actRes.json());
            if (tsRes.ok) setTeachingScores(await tsRes.json());
            if (subRes.ok) setSubjects(await subRes.json());
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (formType === 'activity') {
                const formDataToSend = new FormData();
                formDataToSend.append('category', formData.category);
                formDataToSend.append('title', formData.title);
                formDataToSend.append('description', formData.description);
                formDataToSend.append('academicYear', formData.academicYear);
                if (proofFile) {
                    formDataToSend.append('proof', proofFile);
                }

                const res = await fetch('/api/activities', {
                    method: 'POST',
                    body: formDataToSend,
                });

                if (res.ok) {
                    setShowForm(false);
                    setFormData({ category: 'PAPERS_PUBLISHED', title: '', description: '', academicYear: '2024-25', subjectId: '', score: '' });
                    setProofFile(null);
                    setSuccessMsg('Submitted successfully! Awaiting validation.');
                    setTimeout(() => setSuccessMsg(''), 3000);
                    fetchData();
                }
            } else {
                const res = await fetch('/api/teaching-scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subjectId: formData.subjectId, academicYear: formData.academicYear, score: formData.score }),
                });
                if (res.ok) {
                    setShowForm(false);
                    setFormData({ category: 'PAPERS_PUBLISHED', title: '', description: '', academicYear: '2024-25', subjectId: '', score: '' });
                    setSuccessMsg('Submitted successfully! Awaiting HOD validation.');
                    setTimeout(() => setSuccessMsg(''), 3000);
                    fetchData();
                }
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const user = session?.user as any;
    const approvedActivities = activities.filter(a => a.status === 'APPROVED');
    const totalMarks = approvedActivities.reduce((sum, a) => sum + (a.marks || 0), 0) + teachingScores.filter(t => t.status === 'APPROVED').reduce((sum, t) => sum + (t.marks || 0), 0);
    const pendingCount = activities.filter(a => a.status === 'PENDING').length + teachingScores.filter(t => t.status === 'PENDING').length;

    return (
        <DashboardLayout>
            <div>
                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Welcome, {user?.name || 'Faculty'}</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.departmentName || 'Department'}</p>
                    </div>
                    <button onClick={() => { setShowForm(true); setFormType('activity'); }} className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px' }}>
                        <Plus size={16} /> New Submission
                    </button>
                </div>

                {/* Tabs */}
                <div className="tab-list" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                    {[{ id: 'overview', label: '📊 Overview' }, { id: 'activities', label: '📝 Activities' }, { id: 'teaching', label: '📚 Teaching Scores' }].map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                    ))}
                </div>

                <div>
                    {successMsg && (
                        <div className="animate-fade-in" style={{
                            padding: '14px 20px', borderRadius: '12px', background: '#D1FAE5',
                            color: '#065F46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '14px', fontWeight: 500,
                        }}>
                            <CheckCircle size={18} /> {successMsg}
                        </div>
                    )}

                    {/* Stats */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in-up">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                                <div className="stats-card indigo">
                                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Submissions</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#1E293B' }}>{activities.length + teachingScores.length}</div>
                                </div>
                                <div className="stats-card green">
                                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Approved</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46' }}>{approvedActivities.length + teachingScores.filter(t => t.status === 'APPROVED').length}</div>
                                </div>
                                <div className="stats-card amber">
                                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Pending Review</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#92400E' }}>{pendingCount}</div>
                                </div>
                                <div className="stats-card purple">
                                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Score</div>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#5B21B6' }}>{totalMarks}</div>
                                </div>
                            </div>

                            {/* Recent Activities */}
                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Submissions</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Year</th>
                                                <th>Status</th>
                                                <th>Marks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activities.slice(0, 5).map((act) => (
                                                <tr key={act.id}>
                                                    <td style={{ fontWeight: 500 }}>{act.title}</td>
                                                    <td>{categories.find(c => c.value === act.category)?.label || act.category}</td>
                                                    <td>{act.academicYear}</td>
                                                    <td><span className={`badge ${statusClass[act.status]}`}>{statusIcon[act.status]} {act.status.replace('_', ' ')}</span></td>
                                                    <td style={{ fontWeight: 600 }}>{act.marks ?? '-'}</td>
                                                </tr>
                                            ))}
                                            {activities.length === 0 && (
                                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No submissions yet. Click "New Submission" to get started.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activities Tab */}
                    {activeTab === 'activities' && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>My Activities</h3>
                                <button onClick={() => { setShowForm(true); setFormType('activity'); }} className="btn-primary" style={{ fontSize: '13px' }}>
                                    <Plus size={16} /> Add Activity
                                </button>
                            </div>
                            <div className="card" style={{ padding: '0' }}>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr><th>Title</th><th>Category</th><th>Description</th><th>Year</th><th>Status</th><th>Marks</th></tr>
                                        </thead>
                                        <tbody>
                                            {activities.map((act) => (
                                                <tr key={act.id}>
                                                    <td style={{ fontWeight: 500 }}>{act.title}</td>
                                                    <td style={{ fontSize: '13px' }}>{categories.find(c => c.value === act.category)?.label}</td>
                                                    <td style={{ fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.description}</td>
                                                    <td>{act.academicYear}</td>
                                                    <td><span className={`badge ${statusClass[act.status]}`}>{statusIcon[act.status]} {act.status.replace('_', ' ')}</span></td>
                                                    <td style={{ fontWeight: 600 }}>{act.marks ?? '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Teaching Scores Tab */}
                    {activeTab === 'teaching' && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Teaching Scores</h3>
                                <button onClick={() => { setShowForm(true); setFormType('teaching'); }} className="btn-primary" style={{ fontSize: '13px' }}>
                                    <Plus size={16} /> Add Teaching Score
                                </button>
                            </div>
                            <div className="card" style={{ padding: '0' }}>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr><th>Subject</th><th>Academic Year</th><th>Score</th><th>Status</th><th>Marks</th></tr>
                                        </thead>
                                        <tbody>
                                            {teachingScores.map((ts) => (
                                                <tr key={ts.id}>
                                                    <td style={{ fontWeight: 500 }}>{ts.subject?.name || ts.subjectId}</td>
                                                    <td>{ts.academicYear}</td>
                                                    <td>{ts.score}%</td>
                                                    <td><span className={`badge ${statusClass[ts.status]}`}>{statusIcon[ts.status]} {ts.status.replace('_', ' ')}</span></td>
                                                    <td style={{ fontWeight: 600 }}>{ts.marks ?? '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                                {formType === 'teaching' ? 'Add Teaching Score' : 'Add Activity'}
                            </h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {formType === 'activity' ? (
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label className="input-label">Category</label>
                                        <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                        {PERFORMANCE_CATEGORIES[formData.category] && (
                                            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                                                Max Marks: {PERFORMANCE_CATEGORIES[formData.category].maxMarks} | Formula: {PERFORMANCE_CATEGORIES[formData.category].formula}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label className="input-label">Title</label>
                                        <input className="input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Enter title" required />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label className="input-label">Description</label>
                                        <textarea className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter description" required style={{ minHeight: '80px', resize: 'vertical' }} />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label className="input-label">Proof Document (Optional)</label>
                                        <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }}>
                                            <input 
                                                type="file" 
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                                style={{ display: 'none' }}
                                                id="proof-upload"
                                            />
                                            <label htmlFor="proof-upload" style={{ cursor: 'pointer' }}>
                                                <UploadCloud size={24} color="#64748B" style={{ marginBottom: '8px' }} />
                                                <p style={{ fontSize: '13px', color: '#64748B' }}>
                                                    {proofFile ? proofFile.name : 'Click to upload proof (PDF, DOC, Image)'}
                                                </p>
                                                <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Max 10MB</p>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label className="input-label">Subject</label>
                                        <select className="input" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                                            <option value="">Select subject</option>
                                            {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label className="input-label">Pass Percentage (%)</label>
                                        <input className="input" type="number" min="0" max="100" value={formData.score} onChange={e => setFormData({ ...formData, score: e.target.value })} placeholder="e.g. 85" required />
                                        <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                                            Max Marks: 80 | Formula: Pass % × 80 ÷ 100
                                            {formData.score && <span style={{ fontWeight: 600, color: '#4F46E5' }}> = {(parseFloat(formData.score || '0') * 80 / 100).toFixed(1)} marks</span>}
                                        </p>
                                    </div>
                                </>
                            )}
                            <div style={{ marginBottom: '20px' }}>
                                <label className="input-label">Academic Year</label>
                                <select className="input" value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })}>
                                    <option value="2024-25">2024-25</option>
                                    <option value="2023-24">2023-24</option>
                                    <option value="2022-23">2022-23</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                                {loading ? 'Submitting...' : 'Submit for Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
