'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3, Building2, Download, TrendingUp, Award, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626'];

export default function IQACDashboard() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('overview');
    const [reportData, setReportData] = useState<any>({ departments: [], yearWiseTrends: {} });

    useEffect(() => {
        fetch('/api/iqac/reports').then(r => r.json()).then(setReportData).catch(console.error);
    }, []);

    const user = session?.user as any;
    const departments = reportData.departments || [];
    const yearTrends = Object.entries(reportData.yearWiseTrends || {}).map(([year, data]: [string, any]) => ({
        year, count: data.count, avgMarks: data.count > 0 ? Math.round(data.totalMarks / data.count * 100) / 100 : 0,
    }));

    const overallAvg = departments.length > 0 ? Math.round(departments.reduce((s: number, d: any) => s + d.avgDepartmentScore, 0) / departments.length * 100) / 100 : 0;

    const handleExport = () => {
        import('jspdf').then(({ jsPDF }) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF();
                doc.setFontSize(20); doc.text('IQAC Quality Report', 14, 22);
                doc.setFontSize(12); doc.text('NAAC/NBA Accreditation Summary', 14, 32);
                doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);

                let y = 50;
                departments.forEach((dept: any) => {
                    doc.setFontSize(14); doc.text(`${dept.department} (${dept.code})`, 14, y);
                    doc.setFontSize(10); doc.text(`Average Score: ${dept.avgDepartmentScore}`, 14, y + 8);
                    const tableData = dept.faculty.map((f: any) => [f.name, f.totalActivities, f.totalActivityMarks, f.totalTeachingMarks, f.avgFeedback, f.overallScore]);
                    (doc as any).autoTable({
                        startY: y + 14,
                        head: [['Faculty', 'Activities', 'Activity Marks', 'Teaching Marks', 'Avg Feedback', 'Overall']],
                        body: tableData,
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [124, 58, 237] },
                    });
                    y = (doc as any).lastAutoTable.finalY + 16;
                    if (y > 250) { doc.addPage(); y = 20; }
                });
                doc.save('iqac-quality-report.pdf');
            });
        });
    };

    return (
        <DashboardLayout>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>IQAC Dashboard</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user?.name} • Quality Assurance</p>
                    </div>
                    <button onClick={handleExport} className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px' }}><Download size={16} /> Export NAAC Report</button>
                </div>

                <div className="tab-list" style={{ display: 'inline-flex', marginBottom: '24px' }}>
                    {[{ id: 'overview', label: '📊 Metrics' }, { id: 'trends', label: '📈 Trends' }, { id: 'details', label: '📝 Details' }].map(tab => (
                        <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                    ))}
                </div>

                <div>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <div className="stats-card purple"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Overall Avg Score</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#5B21B6' }}>{overallAvg}</div></div>
                        <div className="stats-card indigo"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Departments</div><div style={{ fontSize: '32px', fontWeight: 800 }}>{departments.length}</div></div>
                        <div className="stats-card green"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Total Faculty</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46' }}>{departments.reduce((s: number, d: any) => s + d.faculty.length, 0)}</div></div>
                        <div className="stats-card amber"><div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Academic Years</div><div style={{ fontSize: '32px', fontWeight: 800, color: '#92400E' }}>{yearTrends.length}</div></div>
                    </div>

                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Department Performance Comparison</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={departments.map((d: any) => ({ name: d.code, Score: d.avgDepartmentScore, Faculty: d.faculty.length }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Score" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {departments.map((dept: any, i: number) => (
                                    <div key={i} className="card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{dept.department}</h4>
                                            <span className="badge badge-approved">{dept.code}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#F5F3FF', borderRadius: '10px' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#7C3AED' }}>{dept.avgDepartmentScore}</div>
                                                <div style={{ fontSize: '11px', color: '#64748B' }}>Avg Score</div>
                                            </div>
                                            <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#EEF2FF', borderRadius: '10px' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#4F46E5' }}>{dept.faculty.length}</div>
                                                <div style={{ fontSize: '11px', color: '#64748B' }}>Faculty</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trends */}
                    {activeTab === 'trends' && (
                        <div className="card animate-fade-in" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Year-wise Performance Trends</h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={yearTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} name="Activities" />
                                    <Line type="monotone" dataKey="avgMarks" stroke="#7C3AED" strokeWidth={2} name="Avg Marks" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Faculty Details */}
                    {activeTab === 'details' && (
                        <div className="animate-fade-in">
                            {departments.map((dept: any, i: number) => (
                                <div key={i} className="card" style={{ padding: '0', marginBottom: '20px' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{dept.department}</h3>
                                        <span style={{ fontSize: '13px', color: '#7C3AED', fontWeight: 600 }}>Avg: {dept.avgDepartmentScore}</span>
                                    </div>
                                    <div className="table-container" style={{ border: 'none' }}>
                                        <table className="table">
                                            <thead><tr><th>Faculty</th><th>Activities</th><th>Activity Marks</th><th>Teaching Marks</th><th>Avg Feedback</th><th>Overall Score</th></tr></thead>
                                            <tbody>
                                                {dept.faculty.map((f: any, j: number) => (
                                                    <tr key={j}>
                                                        <td style={{ fontWeight: 500 }}>{f.name}</td>
                                                        <td>{f.totalActivities}</td>
                                                        <td>{f.totalActivityMarks}</td>
                                                        <td>{f.totalTeachingMarks}</td>
                                                        <td>{f.avgFeedback}</td>
                                                        <td style={{ fontWeight: 700, color: '#7C3AED' }}>{f.overallScore}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
