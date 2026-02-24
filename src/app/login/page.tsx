'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

const roleLabels: Record<string, string> = {
    FACULTY: 'Faculty',
    HOD: 'Head of Department',
    PRINCIPAL: 'Principal',
    IQAC: 'IOC / IQAC',
    EXAM_CELL: 'Examination Cell',
    STUDENT: 'Student',
    SUPER_ADMIN: 'Super Admin',
    COUNSELLING_COORDINATOR: 'Counselling Coordinator',
    RND_COORDINATOR: 'R&D Coordinator',
};

const roleColors: Record<string, string> = {
    FACULTY: '#4F46E5',
    HOD: '#059669',
    PRINCIPAL: '#D97706',
    IQAC: '#7C3AED',
    EXAM_CELL: '#DC2626',
    STUDENT: '#0891B2',
    SUPER_ADMIN: '#7C3AED',
    COUNSELLING_COORDINATOR: '#0D9488',
    RND_COORDINATOR: '#EA580C',
};

const demoCredentials: Record<string, { email: string; password: string }> = {
    FACULTY: { email: 'faculty1@fpams.edu', password: 'password123' },
    HOD: { email: 'hod@fpams.edu', password: 'password123' },
    PRINCIPAL: { email: 'principal@fpams.edu', password: 'password123' },
    IQAC: { email: 'iqac@fpams.edu', password: 'password123' },
    EXAM_CELL: { email: 'exam@fpams.edu', password: 'password123' },
    STUDENT: { email: 'student1@fpams.edu', password: 'password123' },
    SUPER_ADMIN: { email: 'admin@fpams.edu', password: 'password123' },
    COUNSELLING_COORDINATOR: { email: 'counselling@fpams.edu', password: 'password123' },
    RND_COORDINATOR: { email: 'rnd@fpams.edu', password: 'password123' },
};

const roleDashboards: Record<string, string> = {
    FACULTY: '/dashboard/faculty',
    HOD: '/dashboard/hod',
    PRINCIPAL: '/dashboard/principal',
    IQAC: '/dashboard/iqac',
    EXAM_CELL: '/dashboard/exam',
    STUDENT: '/dashboard/student',
    SUPER_ADMIN: '/dashboard/admin',
    COUNSELLING_COORDINATOR: '/dashboard/counselling',
    RND_COORDINATOR: '/dashboard/research',
};

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedRole, setSelectedRole] = useState('FACULTY');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const role = searchParams.get('role');
        if (role && roleLabels[role]) {
            setSelectedRole(role);
        }
    }, [searchParams]);

    const handleDemoLogin = () => {
        const creds = demoCredentials[selectedRole];
        setEmail(creds.email);
        setPassword(creds.password);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                role: selectedRole,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                // Fetch actual session to get real role for redirect
                const sessionRes = await fetch('/api/auth/session');
                const session = await sessionRes.json();
                const actualRole = session?.user?.role || selectedRole;
                router.push(roleDashboards[actualRole] || '/dashboard/faculty');
                router.refresh();
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const accentColor = roleColors[selectedRole] || '#4F46E5';

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: 'linear-gradient(135deg, #F0F4FF 0%, #E8ECFF 50%, #F5F0FF 100%)',
        }}>
            {/* Left decoration panel */}
            <div style={{
                flex: '0 0 45%', background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                padding: '48px', color: 'white', position: 'relative', overflow: 'hidden',
                transition: 'background 0.5s ease',
            }}>
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                }} />
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '20px',
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <GraduationCap size={40} />
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>FPAMS</h1>
                    <p style={{ fontSize: '16px', opacity: 0.8, lineHeight: 1.6, maxWidth: '320px' }}>
                        Faculty Performance Analysis & Management System
                    </p>
                    <div style={{
                        marginTop: '40px', padding: '20px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                        <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.6 }}>
                            Signing in as <strong>{roleLabels[selectedRole]}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right login form */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', padding: '48px',
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <button onClick={() => router.push('/')} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '32px', fontSize: '14px', color: '#64748B',
                        background: 'none', border: 'none', cursor: 'pointer',
                    }}>
                        <ArrowLeft size={16} /> Back to Home
                    </button>

                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                        Welcome Back
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>
                        Sign in to your {roleLabels[selectedRole]} dashboard
                    </p>

                    {/* Role selector */}
                    <div style={{ marginBottom: '24px' }}>
                        <label className="input-label">Select Role</label>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
                        }}>
                            {Object.entries(roleLabels).map(([key, label]) => (
                                <button key={key} onClick={() => setSelectedRole(key)} style={{
                                    padding: '10px 8px', borderRadius: '10px',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                    border: selectedRole === key ? `2px solid ${roleColors[key]}` : '2px solid #E2E8F0',
                                    background: selectedRole === key ? `${roleColors[key]}10` : 'white',
                                    color: selectedRole === key ? roleColors[key] : '#64748B',
                                    transition: 'all 0.2s',
                                }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="input-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
                                <input
                                    type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email" required
                                    style={{ paddingLeft: '42px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label className="input-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94A3B8' }} />
                                <input
                                    type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password" required
                                    style={{ paddingLeft: '42px' }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 16px', borderRadius: '10px',
                                background: '#FEF2F2', color: '#DC2626', fontSize: '14px',
                                marginBottom: '16px',
                            }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading} style={{
                            width: '100%', justifyContent: 'center', padding: '14px',
                            fontSize: '15px', marginBottom: '16px', opacity: loading ? 0.7 : 1,
                            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                        }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <button type="button" onClick={handleDemoLogin} style={{
                            width: '100%', padding: '12px', borderRadius: '10px',
                            border: '2px dashed #E2E8F0', background: '#F8FAFC',
                            fontSize: '13px', fontWeight: 600, color: '#64748B',
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                            🔑 Fill Demo Credentials
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #F0F4FF 0%, #E8ECFF 50%, #F5F0FF 100%)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <GraduationCap size={48} color="#4F46E5" />
                    <p style={{ marginTop: '16px', color: '#64748B' }}>Loading...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
