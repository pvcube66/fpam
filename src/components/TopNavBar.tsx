'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Bell, Search, Sun, Moon, ChevronDown, User, LogOut, Settings, Calendar, X, Check,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export default function TopNavBar() {
    const { data: session } = useSession();
    const router = useRouter();
    const {
        darkMode, setDarkMode, academicYear, setAcademicYear,
        notifications, unreadCount, refreshNotifications,
    } = useDashboard();

    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const user = session?.user as any;

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleMarkRead = async (id: string) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        refreshNotifications();
    };

    const handleMarkAllRead = async () => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAll: true }),
        });
        refreshNotifications();
    };

    const roleDashboards: Record<string, string> = {
        FACULTY: '/dashboard/faculty',
        HOD: '/dashboard/hod',
        PRINCIPAL: '/dashboard/principal',
        IQAC: '/dashboard/iqac',
        EXAM_CELL: '/dashboard/exam',
        STUDENT: '/dashboard/student',
        SUPER_ADMIN: '/dashboard/admin',
    };

    return (
        <header style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 32px', background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)', position: 'sticky',
            top: 0, zIndex: 40, gap: '16px',
        }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
                <input
                    className="input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '36px', padding: '8px 12px 8px 36px', fontSize: '13px', borderRadius: '8px' }}
                />
            </div>

            {/* Right section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Academic Year */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-primary)', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    <Calendar size={14} />
                    <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{
                        background: 'transparent', border: 'none', fontSize: '13px',
                        fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none',
                    }}>
                        <option value="2024-25">2024-25</option>
                        <option value="2023-24">2023-24</option>
                        <option value="2022-23">2022-23</option>
                    </select>
                </div>

                {/* Dark mode toggle */}
                <button onClick={() => setDarkMode(!darkMode)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', transition: 'all 0.2s',
                }} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowNotifications(!showNotifications)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', position: 'relative',
                    }}>
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="dropdown-menu animate-fade-in" style={{
                            position: 'absolute', top: '44px', right: 0, width: '360px',
                            maxHeight: '400px', overflow: 'auto',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontWeight: 700, fontSize: '15px' }}>Notifications</span>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    No notifications
                                </div>
                            ) : (
                                notifications.slice(0, 20).map(n => (
                                    <div key={n.id} style={{
                                        padding: '12px 16px', borderBottom: '1px solid var(--border)',
                                        background: n.read ? 'transparent' : 'rgba(79,70,229,0.04)',
                                        cursor: 'pointer', transition: 'background 0.2s',
                                    }} onClick={() => handleMarkRead(n.id)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '4px' }}>
                                                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Profile dropdown */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowProfile(!showProfile)} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '4px 8px 4px 4px', borderRadius: '8px',
                        background: 'var(--bg-primary)', border: 'none', cursor: 'pointer',
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '13px', fontWeight: 700, overflow: 'hidden',
                        }}>
                            {user?.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user?.name?.charAt(0) || 'U'
                            )}
                        </div>
                        <ChevronDown size={14} color="var(--text-secondary)" />
                    </button>

                    {showProfile && (
                        <div className="dropdown-menu animate-fade-in" style={{
                            position: 'absolute', top: '44px', right: 0, width: '220px',
                        }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{user?.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role?.replace('_', ' ')}</div>
                            </div>
                            {user?.role === 'FACULTY' && (
                                <button onClick={() => { router.push('/dashboard/faculty/profile'); setShowProfile(false); }} style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '13px', color: 'var(--text-primary)', textAlign: 'left',
                                }}>
                                    <User size={16} /> My Profile
                                </button>
                            )}
                            <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '13px', color: '#EF4444', textAlign: 'left',
                                borderTop: '1px solid var(--border)',
                            }}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
