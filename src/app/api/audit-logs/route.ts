import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    // Only Super Admin and Principal can view audit logs
    if (!['SUPER_ADMIN', 'PRINCIPAL'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const actionType = searchParams.get('actionType') || '';
    const targetId = searchParams.get('targetId') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    if (actionType) where.actionType = actionType;
    if (targetId) where.targetId = targetId;

    const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });

    // Enrich logs with user names
    const userIds = [...new Set(logs.map((l: any) => l.userId))] as string[];
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, role: true },
    });
    const userMap: Record<string, { name: string; role: string }> = {};
    users.forEach(u => { userMap[u.id] = { name: u.name, role: u.role }; });

    const enrichedLogs = logs.map((log: any) => ({
        ...log,
        userName: userMap[log.userId]?.name || 'Unknown',
        userRole: userMap[log.userId]?.role || log.role,
    }));

    return NextResponse.json(enrichedLogs);
}
