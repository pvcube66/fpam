'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    ClipboardCheck, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw,
    Users, Award, TrendingUp, Search, X, BookOpen, FileText,
} from 'lucide-react';

const RESEARCH_CATEGORIES: Record<string, string> = {
    RESEARCH: 'Research Projects',
    PAPERS_PUBLISHED: 'Papers Published',
    BOOKS_AUTHORED: 'Books Authored',
    PATENTS: 'Patents Filed',
    ARTICLES: 'Articles Published',
};

const statusClass: Record<string, string> = {
    PENDING: 'badge-pending',
    UNDER_REVIEW: 'badge-review',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    COORDINATOR_APPROVED: 'badge-approved',
};

export default function ResearchDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('pending');
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [marks, setMarks] = useState('');
    const [comment, setComment] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/research/submissions');
            if (res.ok) setActivities(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i); }, [fetchData]);

    const handleAction = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            const res = await fetch('/api/research/submissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, marks, comment }),
            });
            if (res.ok) {
                setSelectedItem(null);
                setMarks('');
                setComment('');
                fetchData();
            }
        } catch (e) { console.error(e); }
        setActionLoading(null);
    };

    const user = session?.user as any;
    const pending = activities.filter(a => a.status === 'PENDING');
    const reviewed = activities.filter(a => ['UNDER_REVIEW', 'APPROVED', 'COORDINATOR_APPROVED'].includes(a.status));
    const rejected = activities.filter(a => a.status === 'REJECTED');

    const filtered = (list: any[]) => {
        if (!searchTerm) return list;
        const s = searchTerm.toLowerCase();
        return list.filter(a => a.title?.toLowerCase().includes(s) || a.faculty?.name?.toLowerCase().includes(s));
    };

    // Faculty research ranking
    const facultyMap = new Map<string, { name: string; dept: string; total: number; approved: number; pending: number; totalMarks: number; papers: number; patents: number; books: number }>();
    activities.forEach(a => {
        const key = a.facultyId;
        if (!facultyMap.has(key)) {
            facultyMap.set(key, { name: a.faculty?.name || '', dept: a.faculty?.department?.name || 'Unassigned', total: 0, approved: 0, pending: 0, totalMarks: 0, papers: 0, patents: 0, books: 0 });
        }
        const f = facultyMap.get(key)!;
        f.total++;
        if (a.status === 'APPROVED' || a.status === 'COORDINATOR_APPROVED') { f.approved++; f.totalMarks += a.coordinatorMarks || 0; }
        if (a.status === 'PENDING') f.pending++;
        if (a.category === 'PAPERS_PUBLISHED' || a.category === 'ARTICLES') f.papers++;
        if (a.category === 'PATENTS') f.patents++;
        if (a.category === 'BOOKS_AUTHORED') f.books++;
    });
    const facultyRanking = Array.from(facultyMap.values()).sort((a, b) => b.totalMarks - a.totalMarks);

    // Category breakdown
    const categoryBreakdown = Object.keys(RESEARCH_CATEGORIES).map(cat => ({
        category: RESEARCH_CATEGORIES[cat],
        total: activities.filter(a => a.category === cat).length,
        approved: activities.filter(a => a.category === cat && ['APPROVED', 'UNDER_REVIEW', 'COORDINATOR_APPROVED'].includes(a.status)).length,
        pending: activities.filter(a => a.category === cat && a.status === 'PENDING').length,
    }));

    return (
        <DashboardLayout>
            <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            R&D Coordinator Dashboard
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Welcome, {user?.name || 'Coordinator'}</p>
                    </div>
                    <button onClick={fetchData} className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px', gap: '6px' }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div className="stats-card amber">
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Pending Approvals</div>
                        <div style={{ fontSize: '32px', fontWeight: 800 }}>{pending.length}</div>
                    </div>
                    <div className="stats-card green">
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Approved</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46' }}>{reviewed.length}</div>
                    </div>
                    <div className="stats-card" style={{ borderLeft: '4px solid #EF4444' }}>
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Rejected</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#DC2626' }}>{rejected.length}</div>
                    </div>
                    <div className="stats-card indigo">
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Researchers</div>
                        <div style={{ fontSize: '32px', fontWeight: 800 }}>{facultyMap.size}</div>
                    </div>
                    <div className="stats-card purple">
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Activities</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#5B21B6' }}>{activities.length}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tab-list" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                    {[
                        { id: 'pending', label: '⏳ Pending Approvals' },
                        { id: 'scores', label: '📊 Research Scores' },
                        { id: 'ranking', label: '🏆 Faculty Ranking' },
                        { id: 'analytics', label: '📈 Category Analytics' },
                    ].map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                {(activeTab === 'pending' || activeTab === 'scores') && (
                    <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input className="input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search by title or faculty name..." style={{ paddingLeft: '36px' }} />
                    </div>
                )}

                {loading ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>Loading...</div>
                ) : (
                    <>
                        {/* Pending Tab */}
                        {activeTab === 'pending' && (
                            <div className="card animate-fade-in" style={{ padding: 0 }}>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Faculty</th>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Year</th>
                                                <th>Submitted</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered(pending).map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div style={{ fontWeight: 500 }}>{item.faculty?.name}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.faculty?.department?.name || 'Unassigned'}</div>
                                                    </td>
                                                    <td style={{ fontWeight: 500 }}>{item.title}</td>
                                                    <td><span className="badge badge-review">{RESEARCH_CATEGORIES[item.category] || item.category}</span></td>
                                                    <td>{item.academicYear}</td>
                                                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button onClick={() => { setSelectedItem(item); setMarks(''); setComment(''); }}
                                                            className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filtered(pending).length === 0 && (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No pending research approvals</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Research Scores Tab */}
                        {activeTab === 'scores' && (
                            <div className="card animate-fade-in" style={{ padding: 0 }}>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Faculty</th>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Marks</th>
                                                <th>Comment</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered(reviewed).map(item => (
                                                <tr key={item.id}>
                                                    <td style={{ fontWeight: 500 }}>{item.faculty?.name}</td>
                                                    <td>{item.title}</td>
                                                    <td><span className="badge badge-review">{RESEARCH_CATEGORIES[item.category] || item.category}</span></td>
                                                    <td style={{ fontWeight: 600, color: '#059669' }}>{item.coordinatorMarks ?? '-'}</td>
                                                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px' }}>{item.coordinatorComment || '-'}</td>
                                                    <td><span className={`badge ${statusClass[item.status]}`}>{item.status.replace(/_/g, ' ')}</span></td>
                                                </tr>
                                            ))}
                                            {filtered(reviewed).length === 0 && (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No reviewed submissions</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Faculty Ranking Tab */}
                        {activeTab === 'ranking' && (
                            <div className="card animate-fade-in" style={{ padding: 0 }}>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Rank</th>
                                                <th>Faculty</th>
                                                <th>Department</th>
                                                <th>Papers</th>
                                                <th>Patents</th>
                                                <th>Books</th>
                                                <th>Total</th>
                                                <th>Research Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {facultyRanking.map((f, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 700, color: i < 3 ? '#D97706' : 'var(--text-secondary)' }}>
                                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                    </td>
                                                    <td style={{ fontWeight: 500 }}>{f.name}</td>
                                                    <td>{f.dept}</td>
                                                    <td>{f.papers}</td>
                                                    <td>{f.patents}</td>
                                                    <td>{f.books}</td>
                                                    <td>{f.total}</td>
                                                    <td style={{ fontWeight: 700, color: '#4F46E5', fontSize: '16px' }}>{f.totalMarks}</td>
                                                </tr>
                                            ))}
                                            {facultyRanking.length === 0 && (
                                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No research data yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Category Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="animate-fade-in">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    {categoryBreakdown.map((cat, i) => (
                                        <div key={i} className="card" style={{ padding: '20px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>{cat.category}</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#4F46E5' }}>{cat.total}</div>
                                                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{cat.approved}</div>
                                                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Approved</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706' }}>{cat.pending}</div>
                                                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Pending</div>
                                                </div>
                                            </div>
                                            {cat.total > 0 && (
                                                <div style={{ marginTop: '12px', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${(cat.approved / cat.total) * 100}%`, background: 'linear-gradient(90deg, #059669, #10B981)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Review Modal */}
                {selectedItem && (
                    <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                        <div className="modal animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Review Research Activity</h3>
                                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '16px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{selectedItem.title}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>by {selectedItem.faculty?.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedItem.description}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    Category: <strong>{RESEARCH_CATEGORIES[selectedItem.category]}</strong> • Year: <strong>{selectedItem.academicYear}</strong>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label className="input-label">Marks (optional)</label>
                                <input className="input" type="number" min="0" max="100" value={marks} onChange={e => setMarks(e.target.value)} placeholder="Assign research marks" />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label className="input-label">Review Comment (optional)</label>
                                <textarea className="input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add review comment..." style={{ minHeight: '60px', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleAction(selectedItem.id, 'UNDER_REVIEW')} disabled={!!actionLoading}
                                    className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#059669' }}>
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button onClick={() => handleAction(selectedItem.id, 'REJECTED')} disabled={!!actionLoading}
                                    className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#DC2626' }}>
                                    <XCircle size={16} /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
