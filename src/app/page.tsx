'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Shield, Award, ClipboardCheck, Users, BarChart3, ArrowRight, Sparkles, Building2, Lock } from 'lucide-react';

const roles = [
  {
    id: 'SUPER_ADMIN',
    title: 'Admin',
    description: 'Full system control, user management, and configuration settings.',
    icon: Lock,
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    bgLight: '#F5F3FF',
  },
  {
    id: 'FACULTY',
    title: 'Faculty',
    description: 'Submit academic activities, upload proof documents, and track your performance score.',
    icon: BookOpen,
    color: '#4F46E5',
    gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    bgLight: '#EEF2FF',
  },
  {
    id: 'HOD',
    title: 'Head of Department',
    description: 'Review faculty submissions, validate activities, and assign marks for your department.',
    icon: Shield,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #10B981)',
    bgLight: '#ECFDF5',
  },
  {
    id: 'PRINCIPAL',
    title: 'Principal',
    description: 'View analytics, approve final scores, and compare department-wise performance.',
    icon: Award,
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
    bgLight: '#FFFBEB',
  },
  {
    id: 'IQAC',
    title: 'IOC / IQAC',
    description: 'Monitor quality metrics, track accreditation data, and export NAAC/NBA reports.',
    icon: BarChart3,
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    bgLight: '#F5F3FF',
  },
  {
    id: 'EXAM_CELL',
    title: 'Examination Cell',
    description: 'Upload official results, verify teaching scores, and manage subject performance data.',
    icon: ClipboardCheck,
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #DC2626, #EF4444)',
    bgLight: '#FEF2F2',
  },
  {
    id: 'STUDENT',
    title: 'Student Feedback',
    description: 'Provide anonymous feedback and ratings for faculty teaching performance.',
    icon: Users,
    color: '#0891B2',
    gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)',
    bgLight: '#ECFEFF',
  },
  {
    id: 'COUNSELLING_COORDINATOR',
    title: 'Counselling Coordinator',
    description: 'Validate counselling activities, student mentoring records, and assign counselling scores.',
    icon: ClipboardCheck,
    color: '#0D9488',
    gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
    bgLight: '#F0FDFA',
  },
  {
    id: 'RND_COORDINATOR',
    title: 'R&D Coordinator',
    description: 'Review research projects, validate publications, patents, and assign research scores.',
    icon: Award,
    color: '#EA580C',
    gradient: 'linear-gradient(135deg, #EA580C, #F97316)',
    bgLight: '#FFF7ED',
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F0F4FF 0%, #E8ECFF 30%, #F5F0FF 60%, #FFF7ED 100%)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 48px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.025em' }}>FPAMS</h1>
            <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Faculty Performance System</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="#roles" style={{
            padding: '10px 20px', fontSize: '14px', fontWeight: 600, color: '#4F46E5',
            textDecoration: 'none', borderRadius: '10px', transition: 'all 0.2s',
          }}>Portals</a>
          <button onClick={() => router.push('/login')} className="btn-primary" style={{ fontSize: '14px' }}>
            Sign In <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="animate-fade-in-up" style={{
        textAlign: 'center', padding: '80px 24px 60px',
        maxWidth: '900px', margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px', borderRadius: '50px',
          background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)',
          marginBottom: '28px', fontSize: '13px', fontWeight: 600, color: '#4F46E5',
        }}>
          <Sparkles size={14} /> Enterprise-Grade Academic Management
        </div>
        <h2 style={{
          fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1,
          color: '#1E293B', letterSpacing: '-0.03em', marginBottom: '20px',
        }}>
          Faculty Performance<br />
          <span style={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Analysis & Management</span>
        </h2>
        <p style={{
          fontSize: '18px', color: '#64748B', maxWidth: '600px',
          margin: '0 auto 40px', lineHeight: 1.7,
        }}>
          A comprehensive system for tracking, validating, and analyzing faculty academic performance
          with multi-level approval workflows and real-time analytics.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            <Building2 size={20} /> Access Your Portal
          </button>
          <button onClick={() => router.push('/login')} className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Quick Login
          </button>
        </div>
      </section>

      {/* Stats Strip */}
      <section style={{
        display: 'flex', justifyContent: 'center', gap: '48px',
        padding: '32px', flexWrap: 'wrap',
      }}>
        {[
          { label: 'Departments', value: '4+' },
          { label: 'Faculty Members', value: '50+' },
          { label: 'Activity Categories', value: '15' },
          { label: 'Real-time Analytics', value: '✓' },
        ].map((stat, i) => (
          <div key={i} className="animate-fade-in-up" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#4F46E5' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Role Cards */}
      <section id="roles" style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '40px 24px 80px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#1E293B', marginBottom: '12px' }}>
            Choose Your Portal
          </h3>
          <p style={{ fontSize: '16px', color: '#64748B' }}>
            Select your role to access the appropriate dashboard
          </p>
        </div>
        <div className="stagger-children" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px',
        }}>
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div
                key={role.id}
                className="card"
                onClick={() => router.push(`/login?role=${role.id}`)}
                style={{ padding: '32px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                  background: role.gradient,
                }} />
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: role.bgLight, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                }}>
                  <IconComponent size={28} color={role.color} />
                </div>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                  {role.title}
                </h4>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
                  {role.description}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '14px', fontWeight: 600, color: role.color,
                }}>
                  Login as {role.title} <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
        padding: '80px 24px', color: 'white',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
            How It Works
          </h3>
          <p style={{ fontSize: '16px', opacity: 0.7, marginBottom: '48px' }}>
            A streamlined multi-level validation workflow
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '16px',
            flexWrap: 'wrap', alignItems: 'center',
          }}>
            {[
              { step: '1', title: 'Faculty Submits', desc: 'Upload activities & proof' },
              { step: '2', title: 'HOD Validates', desc: 'Assign marks & review' },
              { step: '3', title: 'Principal Approves', desc: 'Final approval & override' },
              { step: '4', title: 'Score Updated', desc: 'Real-time analytics' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px', padding: '24px', textAlign: 'center', minWidth: '160px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', fontWeight: 800, fontSize: '16px',
                  }}>{item.step}</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>{item.desc}</div>
                </div>
                {i < 3 && (
                  <ArrowRight size={20} style={{ opacity: 0.4, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '32px', borderTop: '1px solid var(--border)',
        background: 'white', color: '#64748B', fontSize: '14px',
      }}>
        <p>© 2024 FPAMS — Faculty Performance Analysis & Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
