import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    let where: any = {};

    if (user.role === 'FACULTY') {
        where = { facultyId: user.userId };
    } else if (user.role === 'HOD' && user.departmentId) {
        where = { faculty: { departmentId: user.departmentId } };
    } else if (user.role === 'EXAM_CELL') {
        where = {};
    }

    const teachingScores = await prisma.teachingScore.findMany({
        where,
        include: { 
            subject: { include: { department: true } },
            faculty: { select: { id: true, name: true, employeeId: true } }
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(teachingScores);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'FACULTY') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { subjectId, academicYear, score, proofUrl } = body;

    const teachingScore = await prisma.teachingScore.create({
        data: {
            facultyId: user.userId,
            subjectId,
            academicYear,
            score: parseFloat(score),
            proofUrl: proofUrl || null,
            status: 'PENDING',
        },
        include: { subject: true },
    });

    return NextResponse.json(teachingScore, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const body = await req.json();
    const { id, score, status, hodComment, principalComment, modificationReason } = body;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.teachingScore.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Teaching score not found' }, { status: 404 });
    }

    if (existing.isLocked) {
        return NextResponse.json({ error: 'This score is locked and cannot be modified' }, { status: 403 });
    }

    const updateData: any = {};

    if (user.role === 'EXAM_CELL') {
        if (score !== undefined) updateData.score = parseFloat(score);
        if (status === 'UNDER_REVIEW') {
            updateData.status = 'UNDER_REVIEW';
            updateData.validatedBy = user.userId;
            updateData.validationStatus = 'EXAM_CELL_VERIFIED';
        }
    } else if (user.role === 'HOD') {
        if (hodComment !== undefined) updateData.hodComment = hodComment;
        if (status === 'APPROVED' || status === 'REJECTED') {
            updateData.status = status;
            if (status === 'APPROVED' && existing.score) {
                const calculatedMarks = (existing.score * 80) / 100;
                updateData.marks = calculatedMarks;
            }
            updateData.lastModifiedBy = user.userId;
            updateData.lastModifiedAt = new Date();
            if (modificationReason) updateData.modificationReason = modificationReason;
        }
    } else if (user.role === 'PRINCIPAL') {
        if (principalComment !== undefined) updateData.principalComment = principalComment;
        if (status === 'APPROVED') {
            updateData.status = 'APPROVED';
            if (existing.score) {
                const calculatedMarks = (existing.score * 80) / 100;
                updateData.marks = calculatedMarks;
            }
            updateData.lastModifiedBy = user.userId;
            updateData.lastModifiedAt = new Date();
        }
    } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const teachingScore = await prisma.teachingScore.update({
        where: { id },
        data: updateData,
        include: { subject: true, faculty: { select: { name: true } } },
    });

    return NextResponse.json(teachingScore);
}
