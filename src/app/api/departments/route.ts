import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const departments = await prisma.department.findMany({
        orderBy: { name: 'asc' },
    });
    return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, code } = body;

    if (!name || !code) {
        return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const existing = await prisma.department.findFirst({
        where: { OR: [{ name }, { code }] },
    });

    if (existing) {
        return NextResponse.json({ error: 'Department with this name or code already exists' }, { status: 409 });
    }

    const department = await prisma.department.create({
        data: { name, code },
    });

    return NextResponse.json(department, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, code } = body;

    if (!id || !name || !code) {
        return NextResponse.json({ error: 'ID, name and code are required' }, { status: 400 });
    }

    const existing = await prisma.department.findFirst({
        where: { 
            AND: [
                { id: { not: id } },
                { OR: [{ name }, { code }] }
            ]
        },
    });

    if (existing) {
        return NextResponse.json({ error: 'Another department with this name or code already exists' }, { status: 409 });
    }

    const department = await prisma.department.update({
        where: { id },
        data: { name, code },
    });

    return NextResponse.json(department);
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const hasUsers = await prisma.user.findFirst({
        where: { departmentId: id, isDeleted: false },
    });

    if (hasUsers) {
        return NextResponse.json({ error: 'Cannot delete department with active users' }, { status: 400 });
    }

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
