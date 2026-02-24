import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'HOD') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const faculty = await prisma.user.findMany({
        where: { role: 'FACULTY', departmentId: user.departmentId, isDeleted: false },
        select: { id: true, name: true, email: true },
    });

    return NextResponse.json(faculty);
}
