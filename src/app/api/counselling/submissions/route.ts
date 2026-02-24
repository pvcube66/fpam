import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const COUNSELLING_CATEGORIES = ['COUNSELLING', 'STUDENT_ENRICHMENT'];

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'COUNSELLING_COORDINATOR') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const facultyId = searchParams.get('facultyId');
    const year = searchParams.get('year');

    const where: any = {
        category: { in: COUNSELLING_CATEGORIES },
        faculty: { isDeleted: false },
    };
    if (status) where.status = status;
    if (facultyId) where.facultyId = facultyId;
    if (year) where.academicYear = year;

    const activities = await prisma.activity.findMany({
        where,
        include: {
            faculty: {
                select: { name: true, email: true, department: { select: { name: true } } },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'COUNSELLING_COORDINATOR') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, marks, comment } = body;

    // Verify the activity is a counselling category
    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    if (!COUNSELLING_CATEGORIES.includes(existing.category)) {
        return NextResponse.json({ error: 'This activity is not a counselling category' }, { status: 403 });
    }
    if (existing.isLocked) {
        return NextResponse.json({ error: 'This activity has been locked by the Principal' }, { status: 403 });
    }

    const activity = await prisma.activity.update({
        where: { id },
        data: {
            status: status || 'UNDER_REVIEW',
            coordinatorMarks: marks ? parseFloat(marks) : null,
            coordinatorComment: comment || null,
            coordinatorValidatedBy: user.userId,
        },
    });

    await prisma.auditLog.create({
        data: {
            actionType: 'SCORE_MODIFY',
            userId: user.userId,
            targetId: id,
            oldValue: JSON.stringify({ status: existing.status, marks: existing.coordinatorMarks }),
            newValue: JSON.stringify({ status: activity.status, marks: activity.coordinatorMarks }),
            reason: comment || 'Counselling coordinator validation',
            role: 'COUNSELLING_COORDINATOR',
        },
    });

    return NextResponse.json(activity);
}
