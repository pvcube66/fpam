'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Shield, Mail, Lock, User, Phone, Building2, CreditCard, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AdminSetupPage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [alreadyExists, setAlreadyExists] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', employeeId: '', department: '', phone: '', password: '', confirmPassword: '',
    });

    useEffect(() => {
        fetch('/api/admin/register')
            .then(r => r.json())
            .then(data => {
                if (data.exists) setAlreadyExists(true);
                setChecking(false);
            })
            .catch(() => setChecking(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const update = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

    if (checking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <Shield size={48} style={{ animation: 'pulse 2s infinite' }} />
                    <p style={{ marginTop: '16px', opacity: 0.7 }}>Checking system status...</p>
                </div>
            </div>
        );
    }

    if (alreadyExists) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white', maxWidth: '480px', padding: '48px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={40} color="#10B981" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>System Already Configured</h1>
                    <p style={{ fontSize: '15px', opacity: 0.7, marginBottom: '32px', lineHeight: 1.6 }}>
                        A Super Admin account has already been created. Further admin registrations can only be done by the existing Super Admin through the User Management panel.
                    </p>
                    <button onClick={() => router.push('/login')} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px',
                        borderRadius: '12px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white',
                        fontWeight: 600, fontSize: '15px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        <ArrowLeft size={18} /> Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white', maxWidth: '480px', padding: '48px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={40} color="#10B981" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Setup Complete!</h1>
                    <p style={{ fontSize: '15px', opacity: 0.7, marginBottom: '16px', lineHeight: 1.6 }}>
                        Super Admin account has been created successfully. Redirecting to login...
                    </p>
                    <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', animation: 'slideRight 3s linear' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)' }}>
            {/* Left Panel */}
            <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.15)' }} />
                <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)' }} />
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Shield size={44} />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>FPAMS Setup</h1>
                    <p style={{ fontSize: '16px', opacity: 0.7, lineHeight: 1.6, maxWidth: '340px' }}>
                        Initialize your Faculty Performance Analysis & Management System
                    </p>
                    <div style={{ marginTop: '40px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', opacity: 0.9 }}>🔐 Security Notes</div>
                        <ul style={{ fontSize: '13px', opacity: 0.7, lineHeight: 1.8, margin: 0, paddingLeft: '16px' }}>
                            <li>Only one Super Admin can exist</li>
                            <li>This page will be disabled after setup</li>
                            <li>Future admins must be created by Super Admin</li>
                            <li>Use a strong password (8+ characters)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
                <div style={{ width: '100%', maxWidth: '480px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Create Super Admin</h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Set up the primary administrator account</p>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Full Name */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} required placeholder="Dr. John Doe"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Official Email *</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} required placeholder="admin@institution.edu"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            {/* Employee ID & Department */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Employee ID</label>
                                    <div style={{ position: 'relative' }}>
                                        <CreditCard size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.3)' }} />
                                        <input type="text" value={formData.employeeId} onChange={e => update('employeeId', e.target.value)} placeholder="ADM001"
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Department</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building2 size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.3)' }} />
                                        <input type="text" value={formData.department} onChange={e => update('department', e.target.value)} placeholder="Administration"
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)} placeholder="9876543210"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Password *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => update('password', e.target.value)} required placeholder="Minimum 8 characters"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', paddingRight: '40px' }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Confirm Password *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'rgba(255,255,255,0.3)' }} />
                                    <input type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required placeholder="Re-enter password"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', paddingRight: '40px' }} />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '14px', borderRadius: '12px',
                                background: loading ? 'rgba(79, 70, 229, 0.5)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                color: 'white', fontWeight: 700, fontSize: '15px', border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px',
                            }}>
                                <Shield size={18} />
                                {loading ? 'Creating Account...' : 'Create Super Admin Account'}
                            </button>
                        </div>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>
                            Already set up? Go to Login →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
