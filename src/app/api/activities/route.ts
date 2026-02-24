import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const where: any = { facultyId: user.userId };

    const activities = await prisma.activity.findMany({
        where,
        include: { faculty: { select: { name: true } } },
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

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const category = formData.get('category') as string;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const academicYear = formData.get('academicYear') as string;
        const proofFile = formData.get('proof') as File | null;

        let proofUrl: string | null = null;

        if (proofFile && proofFile.size > 0) {
            const bytes = await proofFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            try {
                const result: any = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'fpams/proofs', resource_type: 'auto' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
                proofUrl = result.secure_url;
            } catch (err) {
                console.error('Cloudinary upload error:', err);
                proofUrl = null;
            }
        }

        const activity = await prisma.activity.create({
            data: {
                facultyId: user.userId,
                category,
                title,
                description,
                academicYear,
                proofUrl,
                status: 'PENDING',
            },
        });

        return NextResponse.json(activity, { status: 201 });
    } else {
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
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
        return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    if (existing.facultyId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existing.status !== 'PENDING' && existing.status !== 'REJECTED') {
        return NextResponse.json({ error: 'Cannot edit activity after validation' }, { status: 403 });
    }

    const activity = await prisma.activity.update({
        where: { id },
        data,
    });

    return NextResponse.json(activity);
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    if (existing.facultyId !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existing.status !== 'PENDING' && existing.status !== 'REJECTED') {
        return NextResponse.json({ error: 'Cannot delete activity after validation' }, { status: 403 });
    }

    await prisma.activity.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
