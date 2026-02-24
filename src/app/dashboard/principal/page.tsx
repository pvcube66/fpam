'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    BarChart3, Building2, Users, Download, CheckCircle, XCircle,
    AlertCircle, Shield, Lock, Unlock, AlertTriangle, RefreshCw,
    FileText, X, TrendingUp, Search, UserPlus,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const statusClass: Record<string, string> = {
    PENDING: 'badge-pending', UNDER_REVIEW: 'badge-review', APPROVED: 'badge-approved', REJECTED: 'badge-rejected',
};

const CHART_COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#0891B2', '#059669', '#D97706'];

interface AuditLogEntry {
    id: string; actionType: string; userId: string; targetId: string;
    oldValue?: string; newValue?: string; reason?: string; role: string;
    createdAt: string; userName: string; userRole: string;
}

export default function PrincipalDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('analytics');
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any>({ activities: [], teachingScores: [] });
    const [overrideItem, setOverrideItem] = useState<any>(null);
    const [overrideMarks, setOverrideMarks] = useState('');
    const [overrideComment, setOverrideComment] = useState('');
    const [overrideType, setOverrideType] = useState('');
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const user = session?.user as any;

    const fetchAll = useCallback(async () => {
        try {
            const [analyticsRes, submRes, usersRes] = await Promise.all([
                fetch('/api/principal/analytics'),
                fetch('/api/principal/submissions'),
                fetch('/api/principal/users'),
            ]);
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
            if (submRes.ok) setSubmissions(await submRes.json());
            if (usersRes.ok) setAllUsers(await usersRes.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);
    useEffect(() => { if (activeTab === 'audit') fetchAuditLogs(); }, [activeTab]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => { fetchAll(); }, 30000);
        return () => clearInterval(interval);
    }, [fetchAll]);



    const fetchAuditLogs = async () => {
        try {
            const res = await fetch('/api/audit-logs');
            if (res.ok) setAuditLogs(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleApproval = async (id: string, type: string, status: string) => {
        try {
            const endpoint = '/api/principal/analytics';
            await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, status }),
            });
            setSuccessMsg(`Submission ${status.toLowerCase()} successfully!`);
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const handleOverride = async () => {
        if (!overrideItem) return;
        try {
            const res = await fetch('/api/principal/analytics', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: overrideItem.id, type: overrideType,
                    action: 'OVERRIDE', marks: overrideMarks, comment: overrideComment,
                    reason: overrideComment || 'Overridden by Principal',
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setErrorMsg(data.error || 'Override failed');
                setTimeout(() => setErrorMsg(''), 3000);
                return;
            }
            setOverrideItem(null); setOverrideMarks(''); setOverrideComment('');
            setSuccessMsg('Score overridden successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchAll();
        } catch (e) {
            setErrorMsg('Failed to override');
            setTimeout(() => setErrorMsg(''), 3000);
        }
    };

    const handleLockToggle = async (id: string, type: string, lock: boolean) => {
        try {
            const res = await fetch('/api/principal/analytics', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, action: lock ? 'LOCK' : 'UNLOCK' }),
            });
            if (res.ok) {
                setSuccessMsg(lock ? 'Score locked!' : 'Score unlocked!');
                setTimeout(() => setSuccessMsg(''), 3000);
                fetchAll();
            }
        } catch (e) { console.error(e); }
    };

    const handleDownloadReport = () => {
        import('jspdf').then(({ jsPDF }) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF();
                doc.setFontSize(18); doc.text('Performance Analytics Report', 14, 22);
                doc.setFontSize(11); doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
                const tableData = analytics.map(d => [d.departmentName, d.totalFaculty, d.totalActivities, d.avgMarks, d.avgFeedback]);
                (doc as any).autoTable({
                    startY: 40, head: [['Department', 'Faculty', 'Activities', 'Avg Marks', 'Avg Feedback']],
                    body: tableData, styles: { fontSize: 9 }, headStyles: { fillColor: [79, 70, 229] },
                });
                doc.save('analytics-report.pdf');
            });
        });
    };

    const totalFaculty = analytics.reduce((sum: number, d: any) => sum + d.totalFaculty, 0);
    const totalActivities = analytics.reduce((sum: number, d: any) => sum + d.totalActivities, 0);
    const pendingCount = submissions.activities.filter((a: any) => a.status === 'UNDER_REVIEW').length + submissions.teachingScores.filter((t: any) => t.status === 'UNDER_REVIEW').length;

    const filteredUsers = allUsers.filter((u: any) =>
        !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const roleColors: Record<string, string> = {
        FACULTY: '#4F46E5', HOD: '#D97706', PRINCIPAL: '#DC2626',
    };
    const roleBadgeStyle = (role: string) => ({
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
        color: roleColors[role] || '#475569',
        background: role === 'FACULTY' ? '#EEF2FF' : role === 'HOD' ? '#FFFBEB' : '#F1F5F9',
        border: `1px solid ${role === 'FACULTY' ? '#C7D2FE' : role === 'HOD' ? '#FCD34D' : '#CBD5E1'}`,
    });

    const formatAuditAction = (action: string) => {
        const labels: Record<string, string> = {
            SCORE_MODIFY: '📝 Score Modified', SCORE_LOCK: '🔒 Score Locked',
            SCORE_UNLOCK: '🔓 Score Unlocked', SCORE_OVERRIDE: '⚡ Score Overridden',
            USER_CREATE: '➕ User Created', USER_DELETE: '🗑 User Deleted',
            USER_UPDATE: '✏️ User Updated', ROLE_CHANGE: '🔁 Role Changed',
            SUPER_ADMIN_CREATED: '🛡 Super Admin Created',
        };
        return labels[action] || action;
    };

    return (
        <DashboardLayout>
            <div className="animate-fade-in-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Principal Dashboard</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.name} • Performance Overview</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => fetchAll()} style={{ fontSize: '13px', padding: '10px 18px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#475569' }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button onClick={handleDownloadReport} className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px' }}>
                            <Download size={16} /> Download Report
                        </button>
                    </div>
                </div>

                {successMsg && (
                    <div style={{ padding: '12px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                        <CheckCircle size={16} /> {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#991B1B', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                        <AlertCircle size={16} /> {errorMsg}
                    </div>
                )}

                <div className="tab-list" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                    {[
                        { id: 'analytics', label: '📊 Analytics' },
                        { id: 'approvals', label: `📋 Approvals (${pendingCount})` },
                        { id: 'users', label: `👥 Users (${allUsers.length})` },
                        { id: 'audit', label: '📋 Audit Logs' },
                    ].map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                    ))}
                </div>

                {activeTab === 'analytics' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                            <div className="stats-card indigo"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Faculty</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{totalFaculty}</div></div>
                            <div className="stats-card green"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Approved Activities</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46' }}>{totalActivities}</div></div>
                            <div className="stats-card amber"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Pending Approvals</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#92400E' }}>{pendingCount}</div></div>
                            <div className="stats-card purple"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Departments</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#7C3AED' }}>{analytics.length}</div></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Department Performance</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={analytics}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis dataKey="departmentCode" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="totalActivities" fill="#4F46E5" name="Activities" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="avgMarks" fill="#7C3AED" name="Avg Marks" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="card" style={{ padding: '24px' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Faculty Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={analytics} dataKey="totalFaculty" nameKey="departmentCode" cx="50%" cy="50%" outerRadius={100} label>
                                            {analytics.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Department</th><th>Faculty</th><th>Approved Activities</th><th>Avg Marks</th><th>Avg Feedback</th></tr></thead>
                                <tbody>
                                    {analytics.map(d => (
                                        <tr key={d.departmentId}>
                                            <td style={{ fontWeight: 600 }}>{d.departmentName}</td>
                                            <td>{d.totalFaculty}</td>
                                            <td>{d.totalActivities}</td>
                                            <td>{d.avgMarks}</td>
                                            <td>{d.avgFeedback}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div>
                        {submissions.activities.length === 0 && submissions.teachingScores.length === 0 ? (
                            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <CheckCircle size={40} color="#059669" style={{ margin: '0 auto 12px' }} />
                                <p style={{ fontWeight: 600 }}>No pending approvals</p>
                            </div>
                        ) : (
                            <>
                                {submissions.activities.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>📋 Activities Awaiting Approval</h3>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead><tr><th>Faculty</th><th>Title</th><th>Category</th><th>HOD Marks</th><th>HOD Comments</th><th>Status</th><th>Actions</th></tr></thead>
                                                <tbody>
                                                    {submissions.activities.map((item: any) => (
                                                        <tr key={item.id}>
                                                            <td>
                                                                <div style={{ fontWeight: 500 }}>{item.faculty?.name}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.faculty?.department?.name}</div>
                                                            </td>
                                                            <td>{item.title}</td>
                                                            <td style={{ fontSize: '12px' }}>{item.category}</td>
                                                            <td style={{ fontWeight: 600 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    {item.marks ?? '-'}
                                                                    {item.isLocked && <Lock size={12} color="#7C3AED" />}
                                                                    {item.lastModifiedAt && <AlertTriangle size={12} color="#D97706" />}
                                                                </div>
                                                            </td>
                                                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '150px' }}>{item.hodComment || '-'}</td>
                                                            <td><span className={`badge ${statusClass[item.status]}`}>{item.status.replace('_', ' ')}</span></td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                                    <button onClick={() => handleApproval(item.id, 'activity', 'APPROVED')} className="btn-success" style={{ fontSize: '11px', padding: '5px 10px' }}>Approve</button>
                                                                    <button onClick={() => handleApproval(item.id, 'activity', 'REJECTED')} className="btn-danger" style={{ fontSize: '11px', padding: '5px 10px' }}>Reject</button>
                                                                    <button onClick={() => { setOverrideItem(item); setOverrideType('activity'); setOverrideMarks(item.marks?.toString() || ''); }}
                                                                        style={{ fontSize: '11px', padding: '5px 10px', background: '#EDE9FE', color: '#5B21B6', border: '1px solid #C4B5FD', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                                                        Override
                                                                    </button>
                                                                    {!item.isLocked ? (
                                                                        <button onClick={() => handleLockToggle(item.id, 'activity', true)}
                                                                            style={{ fontSize: '11px', padding: '5px 8px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer' }}>
                                                                            <Lock size={12} />
                                                                        </button>
                                                                    ) : (
                                                                        <button onClick={() => handleLockToggle(item.id, 'activity', false)}
                                                                            style={{ fontSize: '11px', padding: '5px 8px', background: '#EDE9FE', border: '1px solid #C4B5FD', borderRadius: '6px', cursor: 'pointer' }}>
                                                                            <Unlock size={12} />
                                                                        </button>
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

                                {submissions.teachingScores.length > 0 && (
                                    <div>
                                        <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>📊 Teaching Scores Awaiting Approval</h3>
                                        <div className="table-container">
                                            <table className="table">
                                                <thead><tr><th>Faculty</th><th>Subject</th><th>Score</th><th>HOD Marks</th><th>HOD Comments</th><th>Status</th><th>Actions</th></tr></thead>
                                                <tbody>
                                                    {submissions.teachingScores.map((item: any) => (
                                                        <tr key={item.id}>
                                                            <td>
                                                                <div style={{ fontWeight: 500 }}>{item.faculty?.name}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.faculty?.department?.name}</div>
                                                            </td>
                                                            <td>{item.subject?.name}</td>
                                                            <td>{item.score}%</td>
                                                            <td style={{ fontWeight: 600 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    {item.marks ?? '-'}
                                                                    {item.isLocked && <Lock size={12} color="#7C3AED" />}
                                                                    {item.lastModifiedAt && <AlertTriangle size={12} color="#D97706" />}
                                                                </div>
                                                            </td>
                                                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '150px' }}>{item.hodComment || '-'}</td>
                                                            <td><span className={`badge ${statusClass[item.status]}`}>{item.status.replace('_', ' ')}</span></td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                                    <button onClick={() => handleApproval(item.id, 'teaching', 'APPROVED')} className="btn-success" style={{ fontSize: '11px', padding: '5px 10px' }}>Approve</button>
                                                                    <button onClick={() => handleApproval(item.id, 'teaching', 'REJECTED')} className="btn-danger" style={{ fontSize: '11px', padding: '5px 10px' }}>Reject</button>
                                                                    <button onClick={() => { setOverrideItem(item); setOverrideType('teaching'); setOverrideMarks(item.marks?.toString() || ''); }}
                                                                        style={{ fontSize: '11px', padding: '5px 10px', background: '#EDE9FE', color: '#5B21B6', border: '1px solid #C4B5FD', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                                                        Override
                                                                    </button>
                                                                    {!item.isLocked ? (
                                                                        <button onClick={() => handleLockToggle(item.id, 'teaching', true)}
                                                                            style={{ fontSize: '11px', padding: '5px 8px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer' }}>
                                                                            <Lock size={12} />
                                                                        </button>
                                                                    ) : (
                                                                        <button onClick={() => handleLockToggle(item.id, 'teaching', false)}
                                                                            style={{ fontSize: '11px', padding: '5px 8px', background: '#EDE9FE', border: '1px solid #C4B5FD', borderRadius: '6px', cursor: 'pointer' }}>
                                                                            <Unlock size={12} />
                                                                        </button>
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
                            </>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Search size={16} color="#64748B" />
                            <input
                                className="input"
                                style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                                placeholder="Search by name or email..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                            />
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                        <th>Employee ID</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u: any) => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</td>
                                            <td><span style={roleBadgeStyle(u.role)}>{u.role}</span></td>
                                            <td>{u.departmentName}</td>
                                            <td>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                                    color: u.status === 'ACTIVE' ? '#065F46' : '#991B1B',
                                                    background: u.status === 'ACTIVE' ? '#D1FAE5' : '#FEE2E2',
                                                }}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.employeeId || '-'}</td>
                                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Audit Logs Tab */}
                {activeTab === 'audit' && (
                    <div className="card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={20} /> System Audit Trail
                        </h3>
                        {auditLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No audit logs to display</div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead><tr><th>Action</th><th>Performed By</th><th>Details</th><th>Reason</th><th>Timestamp</th></tr></thead>
                                    <tbody>
                                        {auditLogs.map(log => (
                                            <tr key={log.id}>
                                                <td><span style={{ fontSize: '13px', fontWeight: 600 }}>{formatAuditAction(log.actionType)}</span></td>
                                                <td>
                                                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{log.userName}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>({log.userRole})</span>
                                                </td>
                                                <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {log.oldValue && <div>Old: {log.oldValue}</div>}
                                                    {log.newValue && <div>New: {log.newValue}</div>}
                                                </td>
                                                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{log.reason || '—'}</td>
                                                <td style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Override Modal */}
                {overrideItem && (
                    <div className="modal-overlay" onClick={() => setOverrideItem(null)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={18} color="#7C3AED" /> Override Score
                                </h3>
                                <button onClick={() => setOverrideItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ padding: '12px 16px', background: '#EDE9FE', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#5B21B6', display: 'flex', alignItems: 'flex-start', gap: '8px', border: '1px solid #C4B5FD' }}>
                                <Shield size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>This action will override the HOD-assigned score. The change will be recorded in the audit log.</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label className="input-label">Current Marks: <strong>{overrideItem.marks ?? 'Not assigned'}</strong></label>
                                </div>
                                <div>
                                    <label className="input-label">New Marks</label>
                                    <input className="input" type="number" placeholder="Enter new marks" value={overrideMarks} onChange={e => setOverrideMarks(e.target.value)} min="0" max="10" step="0.5" />
                                </div>
                                <div>
                                    <label className="input-label">Comment / Reason</label>
                                    <textarea className="input" placeholder="Add a comment for the override..." value={overrideComment} onChange={e => setOverrideComment(e.target.value)}
                                        style={{ minHeight: '80px', resize: 'vertical' }} />
                                </div>
                                <button onClick={handleOverride}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Shield size={16} /> Confirm Override
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
