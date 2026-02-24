import { NextRequest, NextResponse } from 'next/server';
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

    // Department-wise analytics — only count APPROVED activities and non-deleted faculty
    const departments = await prisma.department.findMany({
        include: {
            users: {
                where: { role: 'FACULTY', isDeleted: false },
                include: {
                    activities: { where: { status: 'APPROVED' } },
                    teachingScores: { where: { status: 'APPROVED' } },
                    feedbackFor: true,
                },
            },
        },
    });

    // Also fetch faculty who have no department assigned
    const unassignedFaculty = await prisma.user.findMany({
        where: { role: 'FACULTY', isDeleted: false, departmentId: null },
        include: {
            activities: { where: { status: 'APPROVED' } },
            teachingScores: { where: { status: 'APPROVED' } },
            feedbackFor: true,
        },
    });

    const computeDeptAnalytics = (deptId: string, deptName: string, deptCode: string, users: any[]) => {
        const totalFaculty = users.length;
        const totalActivities = users.reduce((sum: number, u: any) => sum + u.activities.length, 0);
        const approvedActivities = totalActivities; // Already filtered to APPROVED
        const avgMarks = users.reduce((sum: number, u: any) => {
            const approved = u.activities.filter((a: any) => a.marks !== null);
            const totalMarks = approved.reduce((s: number, a: any) => s + (a.marks || 0), 0);
            return sum + (approved.length > 0 ? totalMarks / approved.length : 0);
        }, 0) / (totalFaculty || 1);
        const avgFeedback = users.reduce((sum: number, u: any) => {
            const ratings = u.feedbackFor.map((f: any) => f.rating);
            return sum + (ratings.length > 0 ? ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length : 0);
        }, 0) / (totalFaculty || 1);

        return {
            departmentId: deptId,
            departmentName: deptName,
            departmentCode: deptCode,
            totalFaculty,
            totalActivities,
            approvedActivities,
            avgMarks: Math.round(avgMarks * 100) / 100,
            avgFeedback: Math.round(avgFeedback * 100) / 100,
        };
    };

    const analytics = departments.map(dept =>
        computeDeptAnalytics(dept.id, dept.name, dept.code, dept.users)
    );

    // Include unassigned faculty so newly registered faculty without a department are visible
    if (unassignedFaculty.length > 0) {
        analytics.push(computeDeptAnalytics('unassigned', 'Unassigned', 'N/A', unassignedFaculty));
    }

    return NextResponse.json(analytics);
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'PRINCIPAL') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, type, status, marks, comment, action, reason } = body;
    const currentUserId = user.userId;

    // Principal Score Override
    if (action === 'OVERRIDE') {
        if (type === 'teaching') {
            const current = await prisma.teachingScore.findUnique({ where: { id } });
            if (!current) return NextResponse.json({ error: 'Score not found' }, { status: 404 });

            const oldMarks = current.marks;
            const score = await prisma.teachingScore.update({
                where: { id },
                data: {
                    marks: marks ? parseFloat(marks) : current.marks,
                    principalComment: comment || current.principalComment,
                    lastModifiedBy: currentUserId,
                    lastModifiedAt: new Date(),
                    modificationReason: reason || 'Overridden by Principal',
                },
            });

            await prisma.auditLog.create({
                data: {
                    actionType: 'SCORE_OVERRIDE',
                    userId: currentUserId,
                    targetId: id,
                    oldValue: JSON.stringify({ marks: oldMarks }),
                    newValue: JSON.stringify({ marks: score.marks }),
                    reason: reason || 'Overridden by Principal',
                    role: 'PRINCIPAL',
                },
            });
            return NextResponse.json(score);
        }

        const current = await prisma.activity.findUnique({ where: { id } });
        if (!current) return NextResponse.json({ error: 'Activity not found' }, { status: 404 });

        const oldMarks = current.marks;
        const activity = await prisma.activity.update({
            where: { id },
            data: {
                marks: marks ? parseFloat(marks) : current.marks,
                principalComment: comment || current.principalComment,
                lastModifiedBy: currentUserId,
                lastModifiedAt: new Date(),
                modificationReason: reason || 'Overridden by Principal',
            },
        });

        await prisma.auditLog.create({
            data: {
                actionType: 'SCORE_OVERRIDE',
                userId: currentUserId,
                targetId: id,
                oldValue: JSON.stringify({ marks: oldMarks }),
                newValue: JSON.stringify({ marks: activity.marks }),
                reason: reason || 'Overridden by Principal',
                role: 'PRINCIPAL',
            },
        });
        return NextResponse.json(activity);
    }

    // Lock final scores
    if (action === 'LOCK') {
        const model = type === 'teaching' ? prisma.teachingScore : prisma.activity;
        const current = await (model as any).findUnique({ where: { id } });
        if (!current) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

        const updated = await (model as any).update({
            where: { id },
            data: { isLocked: true, lastModifiedBy: currentUserId, lastModifiedAt: new Date() },
        });

        await prisma.auditLog.create({
            data: {
                actionType: 'SCORE_LOCK',
                userId: currentUserId,
                targetId: id,
                newValue: JSON.stringify({ isLocked: true }),
                role: 'PRINCIPAL',
            },
        });
        return NextResponse.json(updated);
    }

    // Unlock scores (only Principal)
    if (action === 'UNLOCK') {
        const model = type === 'teaching' ? prisma.teachingScore : prisma.activity;
        const current = await (model as any).findUnique({ where: { id } });
        if (!current) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

        const updated = await (model as any).update({
            where: { id },
            data: { isLocked: false, lastModifiedBy: currentUserId, lastModifiedAt: new Date() },
        });

        await prisma.auditLog.create({
            data: {
                actionType: 'SCORE_UNLOCK',
                userId: currentUserId,
                targetId: id,
                newValue: JSON.stringify({ isLocked: false }),
                role: 'PRINCIPAL',
            },
        });
        return NextResponse.json(updated);
    }

    // Standard approve/reject
    if (type === 'teaching') {
        const score = await prisma.teachingScore.update({
            where: { id },
            data: { status, marks: marks ? parseFloat(marks) : undefined, principalComment: comment || null },
        });
        return NextResponse.json(score);
    }

    const activity = await prisma.activity.update({
        where: { id },
        data: { status, marks: marks ? parseFloat(marks) : undefined, principalComment: comment || null },
    });

    return NextResponse.json(activity);
}
