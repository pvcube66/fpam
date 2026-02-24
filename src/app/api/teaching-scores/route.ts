import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const teachingScores = await prisma.teachingScore.findMany({
        where: { facultyId: user.userId },
        include: { subject: true },
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
