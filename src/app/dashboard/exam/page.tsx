'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { ClipboardCheck, FileText, Upload, Plus, CheckCircle, X, AlertCircle } from 'lucide-react';

export default function ExamCellDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('results');
    const [results, setResults] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ subjectId: '', academicYear: '2024-25', passPercentage: '', averageScore: '', totalStudents: '' });
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/api/exam/results').then(r => r.json()),
            fetch('/api/subjects').then(r => r.json()),
        ]).then(([res, subs]) => { setResults(res); setSubjects(subs); }).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/exam/results', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            setShowForm(false);
            setFormData({ subjectId: '', academicYear: '2024-25', passPercentage: '', averageScore: '', totalStudents: '' });
            setSuccessMsg('Result uploaded successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
            const updated = await fetch('/api/exam/results').then(r => r.json());
            setResults(updated);
        }
    };

    const handleVerify = async (id: string, verified: boolean) => {
        await fetch('/api/exam/results', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, verified }),
        });
        setSuccessMsg(verified ? 'Result verified!' : 'Verification removed');
        setTimeout(() => setSuccessMsg(''), 3000);
        const updated = await fetch('/api/exam/results').then(r => r.json());
        setResults(updated);
    };

    const user = session?.user as any;

    return (
        <DashboardLayout>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Examination Cell</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.name} • Results Management</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px' }}><Plus size={16} /> Upload Result</button>
                </div>

                <div className="tab-list" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                    {[{ id: 'results', label: '📝 Results' }, { id: 'verification', label: '✅ Verification' }].map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                    ))}
                </div>

                <div>
                    {successMsg && (
                        <div className="animate-fade-in" style={{ padding: '14px 20px', borderRadius: '12px', background: '#D1FAE5', color: '#065F46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <CheckCircle size={18} /> {successMsg}
                        </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <div className="stats-card red"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Results</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{results.length}</div></div>
                        <div className="stats-card green"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Verified</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46' }}>{results.filter(r => r.verified).length}</div></div>
                        <div className="stats-card amber"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Pending Verification</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#92400E' }}>{results.filter(r => !r.verified).length}</div></div>
                        <div className="stats-card blue"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Avg Pass %</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#1E40AF' }}>{results.length ? Math.round(results.reduce((s, r) => s + r.passPercentage, 0) / results.length) : 0}%</div></div>
                    </div>

                    {/* Results / Verification Tables */}
                    <div className="card animate-fade-in" style={{ padding: '0' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{activeTab === 'verification' ? 'Verification Queue' : 'All Results'}</h3>
                        </div>
                        <div className="table-container" style={{ border: 'none' }}>
                            <table className="table">
                                <thead><tr><th>Subject</th><th>Department</th><th>Year</th><th>Pass %</th><th>Avg Score</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {(activeTab === 'verification' ? results.filter(r => !r.verified) : results).map((r) => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 500 }}>{r.subject?.name} ({r.subject?.code})</td>
                                            <td>{r.subject?.department?.name}</td>
                                            <td>{r.academicYear}</td>
                                            <td style={{ fontWeight: 600, color: r.passPercentage >= 80 ? '#059669' : r.passPercentage >= 60 ? '#D97706' : '#DC2626' }}>{r.passPercentage}%</td>
                                            <td>{r.averageScore}</td>
                                            <td>{r.totalStudents}</td>
                                            <td><span className={`badge ${r.verified ? 'badge-approved' : 'badge-pending'}`}>{r.verified ? 'Verified' : 'Pending'}</span></td>
                                            <td>
                                                {!r.verified ? (
                                                    <button onClick={() => handleVerify(r.id, true)} className="btn-success" style={{ fontSize: '11px', padding: '4px 10px' }}><CheckCircle size={12} /> Verify</button>
                                                ) : (
                                                    <button onClick={() => handleVerify(r.id, false)} style={{ fontSize: '11px', padding: '4px 10px', background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#64748B' }}>Unverify</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upload Exam Result</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">Subject</label>
                                <select className="input" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                                    <option value="">Select subject</option>
                                    {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">Academic Year</label>
                                <select className="input" value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })}>
                                    <option value="2024-25">2024-25</option>
                                    <option value="2023-24">2023-24</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label className="input-label">Pass Percentage</label>
                                    <input className="input" type="number" step="0.1" min="0" max="100" value={formData.passPercentage} onChange={e => setFormData({ ...formData, passPercentage: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="input-label">Average Score</label>
                                    <input className="input" type="number" step="0.1" min="0" max="100" value={formData.averageScore} onChange={e => setFormData({ ...formData, averageScore: e.target.value })} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label className="input-label">Total Students</label>
                                <input className="input" type="number" min="1" value={formData.totalStudents} onChange={e => setFormData({ ...formData, totalStudents: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Upload Result</button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
