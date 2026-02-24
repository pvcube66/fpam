import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const categories = await prisma.activityCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, code, maxMarks, validator, description } = body;

    if (!name || !code || !validator) {
        return NextResponse.json({ error: 'Name, code, and validator are required' }, { status: 400 });
    }

    const existing = await prisma.activityCategory.findFirst({
        where: { OR: [{ name }, { code }] },
    });

    if (existing) {
        return NextResponse.json({ error: 'Category with this name or code already exists' }, { status: 409 });
    }

    const category = await prisma.activityCategory.create({
        data: {
            name,
            code,
            maxMarks: maxMarks || 100,
            validator,
            description: description || null,
        },
    });

    return NextResponse.json(category, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, code, maxMarks, validator, description } = body;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const category = await prisma.activityCategory.update({
        where: { id },
        data: {
            name,
            code,
            maxMarks,
            validator,
            description,
        },
    });

    return NextResponse.json(category);
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

    await prisma.activityCategory.update({
        where: { id },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true });
}
