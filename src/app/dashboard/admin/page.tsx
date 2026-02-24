'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Users, Building2, Activity, MessageSquare, UserPlus, TrendingUp,
    Search, Filter, Edit2, Trash2, ChevronDown, X, Check, AlertCircle, Upload,
    Shield, BarChart3, FileText, Lock, AlertTriangle,
} from 'lucide-react';

interface User {
    id: string; email: string; name: string; role: string; phone?: string;
    employeeId?: string; designation?: string; profileImageUrl?: string;
    status: string; joiningDate?: string; departmentId?: string; departmentName?: string;
}

interface Stats {
    totalUsers: number; activeUsers: number; inactiveUsers: number;
    totalDepartments: number; totalActivities: number; pendingActivities: number;
    totalFeedback: number; roleCounts: Record<string, number>;
}

interface AuditLogEntry {
    id: string; actionType: string; userId: string; targetId: string;
    oldValue?: string; newValue?: string; reason?: string; role: string;
    createdAt: string; userName: string; userRole: string;
}

// SECURITY: SUPER_ADMIN removed from user-creation role dropdown
const assignableRoleLabels: Record<string, string> = {
    PRINCIPAL: 'Principal', HOD: 'HOD',
    IQAC: 'IQAC', EXAM_CELL: 'Exam Cell', FACULTY: 'Faculty', STUDENT: 'Student',
};

const allRoleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin', ...assignableRoleLabels,
};

const roleColors: Record<string, string> = {
    SUPER_ADMIN: '#7C3AED', PRINCIPAL: '#DC2626', HOD: '#D97706',
    IQAC: '#059669', EXAM_CELL: '#2563EB', FACULTY: '#4F46E5', STUDENT: '#0891B2',
};

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [departments, setDepartments] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [editDept, setEditDept] = useState<any | null>(null);
    const [deleteDeptConfirm, setDeleteDeptConfirm] = useState<any | null>(null);
    const [deptFormData, setDeptFormData] = useState({ name: '', code: '' });
    const [formData, setFormData] = useState({
        name: '', email: '', role: 'FACULTY', phone: '', employeeId: '',
        designation: '', departmentId: '', password: 'password123',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [hasPrincipal, setHasPrincipal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [search, filterRole, filterStatus]);

    useEffect(() => {
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (filterRole) params.set('role', filterRole);
            if (filterStatus) params.set('status', filterStatus);

            const [usersRes, statsRes, deptRes] = await Promise.all([
                fetch(`/api/admin/users?${params}`),
                fetch('/api/admin/stats'),
                fetch('/api/departments'),
            ]);

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData);
                setHasPrincipal(usersData.some((u: User) => u.role === 'PRINCIPAL'));
            }
            if (statsRes.ok) setStats(await statsRes.json());
            if (deptRes.ok) setDepartments(await deptRes.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchAuditLogs = async () => {
        try {
            const res = await fetch('/api/audit-logs');
            if (res.ok) setAuditLogs(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleAddUser = async () => {
        setError('');
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setSuccess('User created successfully!');
            setShowAddModal(false);
            setFormData({ name: '', email: '', role: 'FACULTY', phone: '', employeeId: '', designation: '', departmentId: '', password: 'password123' });
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { setError('Failed to create user'); }
    };

    const handleUpdateUser = async () => {
        if (!editUser) return;
        setError('');
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editUser.id, name: editUser.name, email: editUser.email, role: editUser.role, phone: editUser.phone, employeeId: editUser.employeeId, designation: editUser.designation, status: editUser.status, departmentId: editUser.departmentId }),
            });
            if (!res.ok) { const data = await res.json(); setError(data.error); return; }
            setEditUser(null);
            setSuccess('User updated successfully!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { setError('Failed to update user'); }
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirm) return;
        try {
            const res = await fetch(`/api/admin/users?id=${deleteConfirm.id}`, { method: 'DELETE' });
            if (!res.ok) { const data = await res.json(); setError(data.error); setTimeout(() => setError(''), 3000); return; }
            setDeleteConfirm(null);
            setSuccess('User deleted successfully!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { setError('Failed to delete user'); }
    };

    const handleToggleStatus = async (user: User) => {
        if (user.role === 'SUPER_ADMIN') return; // Block
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await fetch('/api/admin/users', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, status: newStatus }),
        });
        fetchData();
    };

    const handleAddDepartment = async () => {
        setError('');
        try {
            const res = await fetch('/api/departments', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deptFormData),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setSuccess('Department created successfully!');
            setShowDeptModal(false);
            setDeptFormData({ name: '', code: '' });
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { setError('Failed to create department'); }
    };

    const handleUpdateDepartment = async () => {
        if (!editDept) return;
        setError('');
        try {
            const res = await fetch('/api/departments', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editDept.id, name: editDept.name, code: editDept.code }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setEditDept(null);
            setSuccess('Department updated successfully!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { setError('Failed to update department'); }
    };

    const handleDeleteDepartment = async () => {
        if (!deleteDeptConfirm) return;
        try {
            const res = await fetch(`/api/departments?id=${deleteDeptConfirm.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setTimeout(() => setError(''), 3000); return; }
            setDeleteDeptConfirm(null);
            setSuccess('Department deleted successfully!');
            fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { setError('Failed to delete department'); }
    };

    const isSuperAdmin = (user: User) => user.role === 'SUPER_ADMIN';

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
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Admin Control Panel
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Manage users, roles, and system settings</p>
                </div>

                {success && (
                    <div style={{ padding: '12px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                        <Check size={16} /> {success}
                    </div>
                )}
                {error && !showAddModal && !editUser && (
                    <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#991B1B', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="tab-list" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                    {['overview', 'users', 'departments', 'audit'].map(tab => (
                        <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
                            {tab === 'overview' && '📊 Overview'}
                            {tab === 'users' && '👥 User Management'}
                            {tab === 'departments' && '🏢 Departments'}
                            {tab === 'audit' && '📋 Audit Logs'}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && stats && (
                    <div>
                        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'indigo' },
                                { label: 'Active Users', value: stats.activeUsers, icon: Check, color: 'green' },
                                { label: 'Departments', value: stats.totalDepartments, icon: Building2, color: 'blue' },
                                { label: 'Pending Activities', value: stats.pendingActivities, icon: Activity, color: 'amber' },
                                { label: 'Total Activities', value: stats.totalActivities, icon: BarChart3, color: 'purple' },
                                { label: 'Total Feedback', value: stats.totalFeedback, icon: MessageSquare, color: 'green' },
                            ].map(stat => {
                                const Icon = stat.icon;
                                return (
                                    <div key={stat.label} className={`stats-card ${stat.color}`}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>{stat.label}</div>
                                                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                                            </div>
                                            <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-primary)' }}>
                                                <Icon size={22} color="var(--primary)" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="card" style={{ padding: '28px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>User Distribution by Role</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                                {Object.entries(stats.roleCounts).map(([role, count]) => (
                                    <div key={role} style={{
                                        padding: '16px', borderRadius: '12px',
                                        background: `${roleColors[role]}10`, border: `1px solid ${roleColors[role]}30`,
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '28px', fontWeight: 800, color: roleColors[role] }}>{count}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            {allRoleLabels[role] || role}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                                <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '36px' }} />
                            </div>
                            <select className="input" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: '160px' }}>
                                <option value="">All Roles</option>
                                {Object.entries(allRoleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '140px' }}>
                                <option value="">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                                <UserPlus size={16} /> Add User
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Employee ID</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={isSuperAdmin(user) ? { background: 'rgba(124, 58, 237, 0.04)' } : {}}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        background: `${roleColors[user.role] || '#4F46E5'}20`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '13px', fontWeight: 700, color: roleColors[user.role] || '#4F46E5',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {user.profileImageUrl ? (
                                                            <img src={user.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : isSuperAdmin(user) ? <Shield size={16} /> : user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {user.name}
                                                            {isSuperAdmin(user) && (
                                                                <span style={{ fontSize: '10px', background: '#7C3AED20', color: '#7C3AED', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>PROTECTED</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                                    background: `${roleColors[user.role]}15`, color: roleColors[user.role],
                                                }}>
                                                    {allRoleLabels[user.role] || user.role}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.departmentName || '—'}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{user.employeeId || '—'}</td>
                                            <td>
                                                <span className={`badge badge-${user.status.toLowerCase()}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => !isSuperAdmin(user) && setEditUser({ ...user })}
                                                        disabled={isSuperAdmin(user)}
                                                        style={{
                                                            padding: '6px', borderRadius: '6px', border: '1px solid var(--border)',
                                                            background: 'var(--bg-card)', cursor: isSuperAdmin(user) ? 'not-allowed' : 'pointer',
                                                            color: isSuperAdmin(user) ? 'var(--border)' : 'var(--text-secondary)',
                                                            opacity: isSuperAdmin(user) ? 0.5 : 1,
                                                        }} title={isSuperAdmin(user) ? 'Super Admin cannot be edited' : 'Edit user'}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => !isSuperAdmin(user) && handleToggleStatus(user)}
                                                        disabled={isSuperAdmin(user)}
                                                        style={{
                                                            padding: '6px', borderRadius: '6px', border: '1px solid var(--border)',
                                                            background: isSuperAdmin(user) ? 'var(--bg-card)' : (user.status === 'ACTIVE' ? '#FEE2E2' : '#D1FAE5'),
                                                            cursor: isSuperAdmin(user) ? 'not-allowed' : 'pointer',
                                                            color: isSuperAdmin(user) ? 'var(--border)' : (user.status === 'ACTIVE' ? '#991B1B' : '#065F46'),
                                                            opacity: isSuperAdmin(user) ? 0.5 : 1,
                                                        }} title={isSuperAdmin(user) ? 'Super Admin cannot be deactivated' : (user.status === 'ACTIVE' ? 'Deactivate' : 'Activate')}>
                                                        {user.status === 'ACTIVE' ? <X size={14} /> : <Check size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => !isSuperAdmin(user) && setDeleteConfirm(user)}
                                                        disabled={isSuperAdmin(user)}
                                                        style={{
                                                            padding: '6px', borderRadius: '6px', border: '1px solid var(--border)',
                                                            background: isSuperAdmin(user) ? 'var(--bg-card)' : '#FEE2E2',
                                                            cursor: isSuperAdmin(user) ? 'not-allowed' : 'pointer',
                                                            color: isSuperAdmin(user) ? 'var(--border)' : '#DC2626',
                                                            opacity: isSuperAdmin(user) ? 0.5 : 1,
                                                        }} title={isSuperAdmin(user) ? 'Super Admin cannot be deleted' : 'Delete user'}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No users found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Departments Tab */}
                {activeTab === 'departments' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Manage Departments</h3>
                            <button className="btn-primary" onClick={() => setShowDeptModal(true)} style={{ fontSize: '13px' }}>
                                <Building2 size={16} /> Add Department
                            </button>
                        </div>
                        <div className="card" style={{ padding: '0' }}>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Department Name</th>
                                            <th>Code</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.map((dept) => (
                                            <tr key={dept.id}>
                                                <td style={{ fontWeight: 600 }}>{dept.name}</td>
                                                <td><span style={{ fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{dept.code}</span></td>
                                                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(dept.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => setEditDept(dept)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }} title="Edit">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button onClick={() => setDeleteDeptConfirm(dept)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border)', background: '#FEE2E2', cursor: 'pointer', color: '#DC2626' }} title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {departments.length === 0 && (
                                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No departments yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audit Logs Tab */}
                {activeTab === 'audit' && (
                    <div>
                        <div className="card" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={20} /> System Audit Trail
                            </h3>
                            {auditLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    No audit logs to display
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>Performed By</th>
                                                <th>Details</th>
                                                <th>Reason</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td>
                                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                                                            {formatAuditAction(log.actionType)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '13px' }}>
                                                            <span style={{ fontWeight: 600 }}>{log.userName}</span>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>({log.userRole})</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {log.oldValue && <div>Old: {log.oldValue}</div>}
                                                            {log.newValue && <div>New: {log.newValue}</div>}
                                                        </div>
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
                    </div>
                )}

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Add New User</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            {error && (
                                <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="input-label">Full Name *</label>
                                    <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. John Doe" />
                                </div>
                                <div>
                                    <label className="input-label">Email *</label>
                                    <input className="input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@fpams.edu" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="input-label">Role *</label>
                                        <select className="input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                            {Object.entries(assignableRoleLabels)
                                                .filter(([k]) => !hasPrincipal || k !== 'PRINCIPAL')
                                                .map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">Employee ID</label>
                                        <input className="input" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} placeholder="FAC005" />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="input-label">Phone</label>
                                        <input className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" />
                                    </div>
                                    <div>
                                        <label className="input-label">Designation</label>
                                        <input className="input" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="Professor" />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Department</label>
                                    <select className="input" value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}>
                                        <option value="">No Department</option>
                                        {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Temporary Password</label>
                                    <input className="input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>User will be prompted to change this on first login</p>
                                </div>
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={handleAddUser}>
                                    <UserPlus size={16} /> Create User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {editUser && (
                    <div className="modal-overlay" onClick={() => setEditUser(null)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Edit User</h3>
                                <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            {error && (
                                <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="input-label">Name</label>
                                    <input className="input" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="input-label">Email</label>
                                    <input className="input" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="input-label">Role</label>
                                        <select className="input" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                                            {Object.entries(assignableRoleLabels)
                                                .filter(([k]) => !hasPrincipal || k !== 'PRINCIPAL' || editUser.role === 'PRINCIPAL')
                                                .map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="input-label">Status</label>
                                        <select className="input" value={editUser.status} onChange={e => setEditUser({ ...editUser, status: e.target.value })}>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label className="input-label">Phone</label>
                                        <input className="input" value={editUser.phone || ''} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Employee ID</label>
                                        <input className="input" value={editUser.employeeId || ''} onChange={e => setEditUser({ ...editUser, employeeId: e.target.value })} />
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={handleUpdateUser}>
                                    <Check size={16} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <AlertTriangle size={28} color="#DC2626" />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Confirm Deletion</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                                    Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?<br />
                                    <span style={{ fontSize: '12px' }}>This action will soft-delete the user account.</span>
                                </p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button onClick={() => setDeleteConfirm(null)} style={{
                                        padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)',
                                        background: 'var(--bg-card)', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                        color: 'var(--text-primary)',
                                    }}>
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteUser} style={{
                                        padding: '10px 24px', borderRadius: '8px', border: 'none',
                                        background: '#DC2626', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}>
                                        <Trash2 size={14} /> Delete User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Department Modal */}
                {showDeptModal && (
                    <div className="modal-overlay" onClick={() => setShowDeptModal(false)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Add New Department</h3>
                                <button onClick={() => setShowDeptModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            {error && (
                                <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="input-label">Department Name *</label>
                                    <input className="input" value={deptFormData.name} onChange={e => setDeptFormData({ ...deptFormData, name: e.target.value })} placeholder="e.g. Computer Science" />
                                </div>
                                <div>
                                    <label className="input-label">Department Code *</label>
                                    <input className="input" value={deptFormData.code} onChange={e => setDeptFormData({ ...deptFormData, code: e.target.value })} placeholder="e.g. CS" />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={handleAddDepartment}>
                                    <Building2 size={16} /> Create Department
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Department Modal */}
                {editDept && (
                    <div className="modal-overlay" onClick={() => setEditDept(null)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Edit Department</h3>
                                <button onClick={() => setEditDept(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            {error && (
                                <div style={{ padding: '10px 14px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label className="input-label">Department Name</label>
                                    <input className="input" value={editDept.name} onChange={e => setEditDept({ ...editDept, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="input-label">Department Code</label>
                                    <input className="input" value={editDept.code} onChange={e => setEditDept({ ...editDept, code: e.target.value })} />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={handleUpdateDepartment}>
                                    <Check size={16} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Department Confirmation Modal */}
                {deleteDeptConfirm && (
                    <div className="modal-overlay" onClick={() => setDeleteDeptConfirm(null)}>
                        <div className="modal animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <AlertTriangle size={28} color="#DC2626" />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Confirm Deletion</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                                    Are you sure you want to delete the department <strong>{deleteDeptConfirm.name}</strong>?<br />
                                    <span style={{ fontSize: '12px' }}>This action cannot be undone if the department has no users.</span>
                                </p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button onClick={() => setDeleteDeptConfirm(null)} style={{
                                        padding: '10px 24px', borderRadius: '8px', border: '1px solid var(--border)',
                                        background: 'var(--bg-card)', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                        color: 'var(--text-primary)',
                                    }}>
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteDepartment} style={{
                                        padding: '10px 24px', borderRadius: '8px', border: 'none',
                                        background: '#DC2626', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}>
                                        <Trash2 size={14} /> Delete Department
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
