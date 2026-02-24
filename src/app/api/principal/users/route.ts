import { NextResponse } from 'next/server';
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

    // Return all active, non-deleted Faculty and HOD users
    const users = await prisma.user.findMany({
        where: {
            isDeleted: false,
            role: { in: ['FACULTY', 'HOD'] },
        },
        include: {
            department: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        employeeId: u.employeeId,
        designation: u.designation,
        status: u.status,
        joiningDate: u.joiningDate,
        departmentName: u.department?.name || 'Unassigned',
        departmentCode: u.department?.code || 'N/A',
        createdAt: u.createdAt,
    }));

    return NextResponse.json(sanitized);
}
