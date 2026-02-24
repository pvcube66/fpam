import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'PRINCIPAL') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Principal sees all HOD-reviewed submissions (not just UNDER_REVIEW)
    const submissions = await prisma.activity.findMany({
        where: {
            status: { in: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
            faculty: { isDeleted: false },
        },
        include: {
            faculty: { select: { name: true, email: true, department: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const teachingScores = await prisma.teachingScore.findMany({
        where: {
            status: { in: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
            faculty: { isDeleted: false },
        },
        include: {
            faculty: { select: { name: true, email: true, department: { select: { name: true } } } },
            subject: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ activities: submissions, teachingScores });
}
