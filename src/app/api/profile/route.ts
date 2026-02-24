import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).userId;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { department: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [activities, teachingScores, feedbackReceived] = await Promise.all([
        prisma.activity.findMany({ where: { facultyId: userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
        prisma.teachingScore.findMany({ where: { facultyId: userId }, include: { subject: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
        prisma.feedback.findMany({ where: { facultyId: userId }, include: { subject: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const totalActivities = await prisma.activity.count({ where: { facultyId: userId } });
    const approvedActivities = await prisma.activity.count({ where: { facultyId: userId, status: 'APPROVED' } });
    const avgFeedback = feedbackReceived.length > 0
        ? feedbackReceived.reduce((s, f) => s + f.rating, 0) / feedbackReceived.length
        : 0;

    return NextResponse.json({
        user: {
            id: user.id, name: user.name, email: user.email, role: user.role,
            phone: user.phone, employeeId: user.employeeId, designation: user.designation,
            profileImageUrl: user.profileImageUrl, joiningDate: user.joiningDate,
            departmentName: user.department?.name || null,
        },
        stats: {
            totalActivities, approvedActivities,
            totalTeachingScores: teachingScores.length,
            averageFeedbackRating: Math.round(avgFeedback * 10) / 10,
            totalFeedback: feedbackReceived.length,
        },
        activities, teachingScores, feedbackReceived,
    });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).userId;
    const body = await req.json();
    const { phone, designation } = body;

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { phone, designation },
    });

    return NextResponse.json({ success: true, user: { phone: updated.phone, designation: updated.designation } });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).userId;

    const formData = await req.formData();
    const file = formData.get('profileImage') as File;

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${userId}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const profileImageUrl = `/uploads/profiles/${filename}`;
    await prisma.user.update({ where: { id: userId }, data: { profileImageUrl } });

    return NextResponse.json({ profileImageUrl });
}
