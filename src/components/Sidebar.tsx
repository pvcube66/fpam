'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    GraduationCap, BarChart3, BookOpen, FileText, Users, Shield, Award,
    ClipboardCheck, MessageSquare, Building2, TrendingUp, LogOut,
    ChevronLeft, ChevronRight, User, Bell, Settings, Upload, LayoutDashboard,
    UserCog, Menu,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

const roleMenus: Record<string, { id: string; href: string; icon: any; label: string }[]> = {
    FACULTY: [
        { id: 'overview', href: '/dashboard/faculty', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'profile', href: '/dashboard/faculty/profile', icon: User, label: 'My Profile' },
        { id: 'activities', href: '/dashboard/faculty', icon: BookOpen, label: 'Activities' },
        { id: 'teaching', href: '/dashboard/faculty', icon: FileText, label: 'Teaching Scores' },
    ],
    HOD: [
        { id: 'submissions', href: '/dashboard/hod', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'teaching', href: '/dashboard/hod', icon: BarChart3, label: 'Teaching Scores' },
        { id: 'faculty', href: '/dashboard/hod', icon: Users, label: 'Faculty Overview' },
    ],
    PRINCIPAL: [
        { id: 'analytics', href: '/dashboard/principal', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'approvals', href: '/dashboard/principal', icon: Shield, label: 'Approvals' },
        { id: 'departments', href: '/dashboard/principal', icon: Building2, label: 'Departments' },
    ],
    IQAC: [
        { id: 'overview', href: '/dashboard/iqac', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'trends', href: '/dashboard/iqac', icon: TrendingUp, label: 'Performance Trends' },
        { id: 'details', href: '/dashboard/iqac', icon: FileText, label: 'Faculty Details' },
    ],
    EXAM_CELL: [
        { id: 'results', href: '/dashboard/exam', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'verification', href: '/dashboard/exam', icon: ClipboardCheck, label: 'Verification' },
    ],
    STUDENT: [
        { id: 'feedback', href: '/dashboard/student', icon: MessageSquare, label: 'Feedback Portal' },
    ],
    SUPER_ADMIN: [
        { id: 'admin', href: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'users', href: '/dashboard/admin', icon: UserCog, label: 'User Management' },
        { id: 'roles', href: '/dashboard/admin', icon: Shield, label: 'Roles & Permissions' },
    ],
    COUNSELLING_COORDINATOR: [
        { id: 'overview', href: '/dashboard/counselling', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'pending', href: '/dashboard/counselling', icon: ClipboardCheck, label: 'Pending Validations' },
        { id: 'approved', href: '/dashboard/counselling', icon: Award, label: 'Approved Records' },
        { id: 'faculty', href: '/dashboard/counselling', icon: Users, label: 'Faculty Summary' },
    ],
    RND_COORDINATOR: [
        { id: 'overview', href: '/dashboard/research', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'pending', href: '/dashboard/research', icon: ClipboardCheck, label: 'Pending Approvals' },
        { id: 'scores', href: '/dashboard/research', icon: BarChart3, label: 'Research Scores' },
        { id: 'ranking', href: '/dashboard/research', icon: TrendingUp, label: 'Faculty Ranking' },
    ],
};

const rolePortalLabels: Record<string, string> = {
    FACULTY: 'Faculty Portal',
    HOD: 'HOD Portal',
    PRINCIPAL: 'Principal Portal',
    IQAC: 'IQAC Portal',
    EXAM_CELL: 'Exam Cell',
    STUDENT: 'Student Portal',
    SUPER_ADMIN: 'Admin Portal',
    COUNSELLING_COORDINATOR: 'Counselling Portal',
    RND_COORDINATOR: 'R&D Portal',
};

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useDashboard();

    const user = session?.user as any;
    const role = user?.role || 'FACULTY';
    const menuItems = roleMenus[role] || roleMenus.FACULTY;
    const portalLabel = rolePortalLabels[role] || 'Portal';

    return (
        <>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn" style={{
                position: 'fixed', top: '16px', left: '16px', zIndex: 60,
                display: 'none', background: 'var(--primary)', color: 'white',
                border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer',
            }}>
                <Menu size={20} />
            </button>

            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
                width: sidebarCollapsed ? '72px' : '260px',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
            }}>
                {/* Brand */}
                <div style={{
                    padding: sidebarCollapsed ? '0 12px 24px' : '0 24px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                            background: 'rgba(255,255,255,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <GraduationCap size={22} />
                        </div>
                        {!sidebarCollapsed && (
                            <div style={{ whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 700, fontSize: '16px' }}>FPAMS</div>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>{portalLabel}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse toggle */}
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="sidebar-collapse-btn" style={{
                    position: 'absolute', top: '28px', right: '-12px', zIndex: 51,
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'var(--primary)', color: 'white', border: '2px solid var(--bg-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    transition: 'all 0.2s',
                }}>
                    {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>

                {/* Nav items */}
                <nav style={{ padding: '0 8px' }}>
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard/faculty' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.id} href={item.href} onClick={() => setMobileMenuOpen(false)}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                style={{
                                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                    padding: sidebarCollapsed ? '12px' : '12px 16px',
                                    borderRadius: '10px', margin: '2px 0',
                                    textDecoration: 'none',
                                }}>
                                <Icon size={18} style={{ flexShrink: 0 }} />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User card + Sign Out */}
                <div style={{
                    position: 'absolute', bottom: '16px', left: 0, right: 0,
                    padding: sidebarCollapsed ? '0 8px' : '0 16px',
                }}>
                    {!sidebarCollapsed && user && (
                        <div style={{
                            padding: '12px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.06)', marginBottom: '8px',
                            display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '13px', fontWeight: 700,
                                overflow: 'hidden',
                            }}>
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user.name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                                <div style={{ fontSize: '11px', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                            </div>
                        </div>
                    )}
                    <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                        padding: sidebarCollapsed ? '12px' : '12px 16px',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        borderRadius: '10px', background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', fontSize: '14px',
                    }}>
                        <LogOut size={16} />
                        {!sidebarCollapsed && 'Sign Out'}
                    </button>
                </div>
            </aside>
        </>
    );
}
