import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'EXAM_CELL') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const results = await prisma.examResult.findMany({
        include: { subject: { include: { department: true } }, uploadedBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'EXAM_CELL') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { subjectId, academicYear, passPercentage, averageScore, totalStudents, fileUrl } = body;

    const result = await prisma.examResult.create({
        data: {
            subjectId,
            uploadedById: user.userId,
            academicYear,
            passPercentage: parseFloat(passPercentage),
            averageScore: parseFloat(averageScore),
            totalStudents: parseInt(totalStudents),
            fileUrl: fileUrl || null,
        },
        include: { subject: true },
    });

    return NextResponse.json(result, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'EXAM_CELL') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, verified } = body;

    const result = await prisma.examResult.update({
        where: { id },
        data: { verified },
    });

    return NextResponse.json(result);
}
