'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import Breadcrumbs from './Breadcrumbs';

interface DashboardContextType {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (v: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (v: boolean) => void;
    darkMode: boolean;
    setDarkMode: (v: boolean) => void;
    academicYear: string;
    setAcademicYear: (v: string) => void;
    notifications: any[];
    unreadCount: number;
    refreshNotifications: () => void;
}

export const DashboardContext = createContext<DashboardContextType>({
    sidebarCollapsed: false,
    setSidebarCollapsed: () => { },
    mobileMenuOpen: false,
    setMobileMenuOpen: () => { },
    darkMode: false,
    setDarkMode: () => { },
    academicYear: '2024-25',
    setAcademicYear: () => { },
    notifications: [],
    unreadCount: 0,
    refreshNotifications: () => { },
});

export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [academicYear, setAcademicYear] = useState('2024-25');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('fpams-dark-mode');
        if (saved === 'true') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('fpams-dark-mode', 'true');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('fpams-dark-mode', 'false');
        }
    }, [darkMode]);

    const refreshNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.read).length);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (session) {
            refreshNotifications();
            const interval = setInterval(refreshNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const ctx: DashboardContextType = {
        sidebarCollapsed, setSidebarCollapsed,
        mobileMenuOpen, setMobileMenuOpen,
        darkMode, setDarkMode,
        academicYear, setAcademicYear,
        notifications, unreadCount, refreshNotifications,
    };

    return (
        <DashboardContext.Provider value={ctx}>
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Sidebar />
                <div style={{
                    flex: 1,
                    marginLeft: sidebarCollapsed ? '72px' : '260px',
                    transition: 'margin-left 0.3s ease',
                }}>
                    <TopNavBar />
                    <div style={{ padding: '0 32px 32px' }}>
                        <Breadcrumbs />
                        <main>{children}</main>
                    </div>
                </div>

                {/* Mobile overlay */}
                {mobileMenuOpen && (
                    <div onClick={() => setMobileMenuOpen(false)} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 45, display: 'none',
                    }} className="mobile-overlay" />
                )}
            </div>
        </DashboardContext.Provider>
    );
}
