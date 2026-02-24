import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'IQAC') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const departments = await prisma.department.findMany({
        include: {
            users: {
                where: { role: 'FACULTY' },
                include: {
                    activities: { where: { status: 'APPROVED' } },
                    teachingScores: { where: { status: 'APPROVED' } },
                    feedbackFor: true,
                },
            },
        },
    });

    const report = departments.map(dept => {
        const faculty = dept.users.map(u => {
            const totalActivityMarks = u.activities.reduce((sum, a) => sum + (a.marks || 0), 0);
            const totalTeachingMarks = u.teachingScores.reduce((sum, t) => sum + (t.marks || 0), 0);
            const avgFeedback = u.feedbackFor.length > 0
                ? u.feedbackFor.reduce((sum, f) => sum + f.rating, 0) / u.feedbackFor.length
                : 0;

            return {
                name: u.name,
                email: u.email,
                totalActivities: u.activities.length,
                totalActivityMarks,
                totalTeachingMarks,
                avgFeedback: Math.round(avgFeedback * 100) / 100,
                overallScore: Math.round((totalActivityMarks + totalTeachingMarks + avgFeedback * 2) * 100) / 100,
            };
        });

        return {
            department: dept.name,
            code: dept.code,
            faculty,
            avgDepartmentScore: faculty.length > 0
                ? Math.round(faculty.reduce((sum, f) => sum + f.overallScore, 0) / faculty.length * 100) / 100
                : 0,
        };
    });

    // Year-wise trends
    const activities = await prisma.activity.findMany({
        where: { status: 'APPROVED' },
        select: { academicYear: true, marks: true },
    });

    const yearWise: Record<string, { count: number; totalMarks: number }> = {};
    activities.forEach(a => {
        if (!yearWise[a.academicYear]) yearWise[a.academicYear] = { count: 0, totalMarks: 0 };
        yearWise[a.academicYear].count++;
        yearWise[a.academicYear].totalMarks += a.marks || 0;
    });

    return NextResponse.json({ departments: report, yearWiseTrends: yearWise });
}
