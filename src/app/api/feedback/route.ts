import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // List faculty available for feedback
    const faculty = await prisma.user.findMany({
        where: { role: 'FACULTY' },
        select: { id: true, name: true, email: true, department: { select: { name: true } } },
    });

    const subjects = await prisma.subject.findMany({
        select: { id: true, name: true, code: true },
    });

    return NextResponse.json({ faculty, subjects });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'STUDENT') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { facultyId, subjectId, rating, comment, isAnonymous } = body;

    const feedback = await prisma.feedback.create({
        data: {
            studentId: user.userId,
            facultyId,
            subjectId,
            rating: parseInt(rating),
            comment: comment || null,
            isAnonymous: isAnonymous || false,
        },
    });

    return NextResponse.json(feedback, { status: 201 });
}
