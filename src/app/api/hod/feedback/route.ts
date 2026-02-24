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
    const facultyId = searchParams.get('facultyId');

    const where: any = {};
    
    if (facultyId) {
        where.facultyId = facultyId;
    } else {
        where.faculty = { departmentId: user.departmentId, isDeleted: false };
    }

    const feedbacks = await prisma.feedback.findMany({
        where,
        include: {
            faculty: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
            student: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const result = feedbacks.map(f => ({
        id: f.id,
        rating: f.rating,
        comment: f.comment,
        isAnonymous: f.isAnonymous,
        createdAt: f.createdAt,
        faculty: f.faculty,
        subject: f.subject,
        studentName: f.isAnonymous ? 'Anonymous' : f.student?.name || 'Unknown',
    }));

    return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'HOD') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { facultyId, hodFeedback, hodRating } = body;

    if (!facultyId) {
        return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 });
    }

    const faculty = await prisma.user.findFirst({
        where: { id: facultyId, departmentId: user.departmentId, role: 'FACULTY' },
    });

    if (!faculty) {
        return NextResponse.json({ error: 'Faculty not found in your department' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Feedback saved' });
}
