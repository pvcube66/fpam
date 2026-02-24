import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'HOD') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const facultyId = searchParams.get('facultyId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    if (type === 'teaching') {
        const where: any = {};
        if (year) where.academicYear = year;
        if (facultyId) where.facultyId = facultyId;
        if (status) where.status = status;
        where.faculty = { departmentId: user.departmentId, isDeleted: false };

        const scores = await prisma.teachingScore.findMany({
            where,
            include: { faculty: { select: { name: true, email: true } }, subject: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(scores);
    }

    const where: any = {};
    if (year) where.academicYear = year;
    if (facultyId) where.facultyId = facultyId;
    if (category) where.category = category;
    if (status) where.status = status;
    where.faculty = { departmentId: user.departmentId, isDeleted: false };

    const activities = await prisma.activity.findMany({
        where,
        include: { faculty: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'HOD') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, type, status, marks, comment, action, reason } = body;
    const currentUserId = user.userId;

    // Score Revalidation: HOD can modify previously assigned marks
    if (action === 'REVALIDATE') {
        if (!reason) {
            return NextResponse.json({ error: 'Reason for modification is required' }, { status: 400 });
        }

        if (type === 'teaching') {
            const current = await prisma.teachingScore.findUnique({ where: { id } });
            if (!current) return NextResponse.json({ error: 'Score not found' }, { status: 404 });
            if (current.isLocked) return NextResponse.json({ error: 'This score has been locked by the Principal' }, { status: 403 });

            const oldMarks = current.marks;
            const score = await prisma.teachingScore.update({
                where: { id },
                data: {
                    marks: marks ? parseFloat(marks) : current.marks,
                    status: status || 'UNDER_REVIEW',
                    hodComment: comment || current.hodComment,
                    lastModifiedBy: currentUserId,
                    lastModifiedAt: new Date(),
                    modificationReason: reason,
                    validatedBy: currentUserId,
                },
            });

            await prisma.auditLog.create({
                data: {
                    actionType: 'SCORE_MODIFY',
                    userId: currentUserId,
                    targetId: id,
                    oldValue: JSON.stringify({ marks: oldMarks, status: current.status }),
                    newValue: JSON.stringify({ marks: score.marks, status: score.status }),
                    reason,
                    role: 'HOD',
                },
            });
            return NextResponse.json(score);
        }

        // Activity revalidation
        const current = await prisma.activity.findUnique({ where: { id } });
        if (!current) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        if (current.isLocked) return NextResponse.json({ error: 'This activity has been locked by the Principal' }, { status: 403 });

        const oldMarks = current.marks;
        const activity = await prisma.activity.update({
            where: { id },
            data: {
                marks: marks ? parseFloat(marks) : current.marks,
                status: status || 'UNDER_REVIEW',
                hodComment: comment || current.hodComment,
                lastModifiedBy: currentUserId,
                lastModifiedAt: new Date(),
                modificationReason: reason,
                validatedBy: currentUserId,
            },
        });

        await prisma.auditLog.create({
            data: {
                actionType: 'SCORE_MODIFY',
                userId: currentUserId,
                targetId: id,
                oldValue: JSON.stringify({ marks: oldMarks, status: current.status }),
                newValue: JSON.stringify({ marks: activity.marks, status: activity.status }),
                reason,
                role: 'HOD',
            },
        });
        return NextResponse.json(activity);
    }

    // Standard validation (approve/reject)
    if (type === 'teaching') {
        const score = await prisma.teachingScore.update({
            where: { id },
            data: {
                status,
                marks: marks ? parseFloat(marks) : null,
                hodComment: comment || null,
                validatedBy: currentUserId,
            },
        });
        return NextResponse.json(score);
    }

    const activity = await prisma.activity.update({
        where: { id },
        data: {
            status,
            marks: marks ? parseFloat(marks) : null,
            hodComment: comment || null,
            validatedBy: currentUserId,
        },
    });

    return NextResponse.json(activity);
}
