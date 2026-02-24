import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const where: any = { facultyId: user.userId };

    const activities = await prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'FACULTY') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { category, title, description, academicYear, proofUrl } = body;

    const activity = await prisma.activity.create({
        data: {
            facultyId: user.userId,
            category,
            title,
            description,
            academicYear,
            proofUrl: proofUrl || null,
            status: 'PENDING',
        },
    });

    return NextResponse.json(activity, { status: 201 });
}
