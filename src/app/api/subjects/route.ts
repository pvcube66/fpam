import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const subjects = await prisma.subject.findMany({
        include: { department: true },
        orderBy: { name: 'asc' },
    });
    return NextResponse.json(subjects);
}
