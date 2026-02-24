'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const pathLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    faculty: 'Faculty',
    hod: 'HOD',
    principal: 'Principal',
    iqac: 'IQAC',
    exam: 'Exam Cell',
    student: 'Student',
    admin: 'Admin',
    profile: 'Profile',
    upload: 'Upload',
    reports: 'Reports',
    settings: 'Settings',
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length <= 1) return null;

    return (
        <nav style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '16px 0 20px', fontSize: '13px', color: 'var(--text-secondary)',
            flexWrap: 'wrap',
        }}>
            <Link href="/" style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                textDecoration: 'none', color: 'var(--text-secondary)',
                transition: 'color 0.2s',
            }}>
                <Home size={14} />
            </Link>

            {segments.map((segment, i) => {
                const href = '/' + segments.slice(0, i + 1).join('/');
                const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
                const isLast = i === segments.length - 1;

                return (
                    <span key={href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ChevronRight size={12} style={{ opacity: 0.5 }} />
                        {isLast ? (
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                        ) : (
                            <Link href={href} style={{
                                textDecoration: 'none', color: 'var(--text-secondary)',
                                transition: 'color 0.2s',
                            }}>
                                {label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
