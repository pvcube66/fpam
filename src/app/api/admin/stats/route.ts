import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalDepartments,
        totalActivities,
        pendingActivities,
        totalFeedback,
    ] = await Promise.all([
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.user.count({ where: { status: 'ACTIVE', isDeleted: false } }),
        prisma.user.count({ where: { status: 'INACTIVE', isDeleted: false } }),
        prisma.department.count(),
        prisma.activity.count(),
        prisma.activity.count({ where: { status: 'PENDING' } }),
        prisma.feedback.count(),
    ]);

    const roleCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: true,
    });

    return NextResponse.json({
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalDepartments,
        totalActivities,
        pendingActivities,
        totalFeedback,
        roleCounts: roleCounts.reduce((acc: any, r) => {
            acc[r.role] = r._count;
            return acc;
        }, {}),
    });
}
