import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).userId;
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).userId;
    const body = await req.json();

    if (body.markAll) {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    } else if (body.id) {
        await prisma.notification.update({
            where: { id: body.id },
            data: { read: true },
        });
    }

    return NextResponse.json({ success: true });
}
