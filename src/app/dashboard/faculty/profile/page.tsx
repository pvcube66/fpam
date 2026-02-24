'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
    User, Mail, Phone, Building2, Briefcase, Calendar, Award, Star,
    BookOpen, BarChart3, MessageSquare, Upload, Edit2, Save, X, Camera,
    TrendingUp, FileText, Clock,
} from 'lucide-react';

export default function FacultyProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ phone: '', designation: '' });
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setEditData({ phone: data.user.phone || '', designation: data.user.designation || '' });
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleSave = async () => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            if (res.ok) { await fetchProfile(); setEditing(false); }
        } catch (e) { console.error(e); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const res = await fetch('/api/profile', { method: 'POST', body: formData });
            if (res.ok) { await fetchProfile(); }
        } catch (e) { console.error(e); }
        setUploading(false);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Loading profile...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!profile) return null;
    const { user, stats, activities, teachingScores, feedbackReceived } = profile;

    const statusColors: Record<string, { bg: string; color: string }> = {
        APPROVED: { bg: '#D1FAE5', color: '#065F46' },
        PENDING: { bg: '#FEF3C7', color: '#92400E' },
        UNDER_REVIEW: { bg: '#DBEAFE', color: '#1E40AF' },
        REJECTED: { bg: '#FEE2E2', color: '#991B1B' },
    };

    return (
        <DashboardLayout>
            <div className="animate-fade-in-up">
                {/* Profile Header Card */}
                <div className="card" style={{ padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'visible' }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #A78BFA)', borderRadius: '16px 16px 0 0',
                    }} />
                    <div style={{ position: 'relative', zIndex: 2, paddingTop: '32px' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            {/* Profile Image */}
                            <div className="profile-image-container" onClick={() => fileRef.current?.click()}>
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #818CF8, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 800, color: 'white' }}>
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="profile-upload-overlay">
                                    <Camera size={24} />
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                            </div>

                            {/* Profile Info */}
                            <div style={{ flex: 1 }}>
                                <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>{user.name}</h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '12px' }}>
                                    {user.designation || 'Faculty'} • {user.departmentName || 'Unassigned'}
                                </p>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Mail size={14} /> {user.email}
                                    </div>
                                    {user.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={14} /> {user.phone}
                                        </div>
                                    )}
                                    {user.employeeId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Briefcase size={14} /> {user.employeeId}
                                        </div>
                                    )}
                                    {user.joiningDate && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} /> Joined {new Date(user.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit button */}
                            {!editing ? (
                                <button className="btn-secondary" onClick={() => setEditing(true)} style={{ fontSize: '13px', padding: '8px 16px' }}>
                                    <Edit2 size={14} /> Edit Profile
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-primary" onClick={handleSave} style={{ fontSize: '13px', padding: '8px 16px' }}>
                                        <Save size={14} /> Save
                                    </button>
                                    <button className="btn-danger" onClick={() => setEditing(false)} style={{ fontSize: '13px' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Edit form */}
                        {editing && (
                            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '500px' }}>
                                <div>
                                    <label className="input-label">Phone</label>
                                    <input className="input" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="input-label">Designation</label>
                                    <input className="input" value={editData.designation} onChange={e => setEditData({ ...editData, designation: e.target.value })} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Activities', value: stats.totalActivities, icon: BookOpen, color: 'indigo', sub: `${stats.approvedActivities} approved` },
                        { label: 'Teaching Scores', value: stats.totalTeachingScores, icon: BarChart3, color: 'blue', sub: 'Submitted' },
                        { label: 'Avg Feedback', value: stats.averageFeedbackRating, icon: Star, color: 'amber', sub: `from ${stats.totalFeedback} reviews` },
                        { label: 'Approval Rate', value: stats.totalActivities > 0 ? Math.round((stats.approvedActivities / stats.totalActivities) * 100) + '%' : 'N/A', icon: TrendingUp, color: 'green', sub: 'Activities' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className={`stats-card ${s.color}`}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>{s.label}</p>
                                        <p style={{ fontSize: '28px', fontWeight: 800 }}>{s.value}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.sub}</p>
                                    </div>
                                    <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-primary)', height: 'fit-content' }}>
                                        <Icon size={20} color="var(--primary)" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Activities */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={18} /> Recent Activities
                        </h3>
                        {activities.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No activities yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {activities.slice(0, 5).map((a: any) => (
                                    <div key={a.id} style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{a.title}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{a.category.replace(/_/g, ' ')}</div>
                                            </div>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                                background: statusColors[a.status]?.bg || '#E2E8F0',
                                                color: statusColors[a.status]?.color || '#1E293B',
                                            }}>{a.status}</span>
                                        </div>
                                        {a.marks !== null && (
                                            <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '6px' }}>
                                                Marks: {a.marks}/10
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Feedback */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18} /> Student Feedback
                        </h3>
                        {feedbackReceived.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No feedback yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {feedbackReceived.slice(0, 5).map((f: any) => (
                                    <div key={f.id} style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{f.subject?.name || 'Unknown Subject'}</span>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={14} fill={s <= f.rating ? '#F59E0B' : 'none'} color={s <= f.rating ? '#F59E0B' : '#E2E8F0'} />
                                                ))}
                                            </div>
                                        </div>
                                        {f.comment && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>"{f.comment}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
