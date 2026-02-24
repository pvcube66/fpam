import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const where: any = { isDeleted: false };
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
            { employeeId: { contains: search } },
        ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
        where,
        include: { department: true },
        orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map(u => ({
        id: u.id, email: u.email, name: u.name, role: u.role,
        phone: u.phone, employeeId: u.employeeId, designation: u.designation,
        profileImageUrl: u.profileImageUrl, status: u.status,
        joiningDate: u.joiningDate, departmentId: u.departmentId,
        departmentName: u.department?.name || null,
        createdAt: u.createdAt, createdBy: u.createdBy,
    }));

    return NextResponse.json(sanitized);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role, phone, employeeId, designation, departmentId, password } = body;

    if (!email || !name || !role) {
        return NextResponse.json({ error: 'Email, name, and role are required' }, { status: 400 });
    }

    // SECURITY: Block Super Admin creation via API
    if (role === 'SUPER_ADMIN') {
        return NextResponse.json(
            { error: 'Super Admin accounts cannot be created through User Management' },
            { status: 403 }
        );
    }

    // SECURITY: Only one Principal allowed
    if (role === 'PRINCIPAL') {
        const existingPrincipal = await prisma.user.findFirst({
            where: { role: 'PRINCIPAL', isDeleted: false },
        });
        if (existingPrincipal) {
            return NextResponse.json(
                { error: 'A Principal already exists. Only one Principal is allowed.' },
                { status: 409 }
            );
        }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    if (employeeId) {
        const existingEmp = await prisma.user.findUnique({ where: { employeeId } });
        if (existingEmp) {
            return NextResponse.json({ error: 'User with this Employee ID already exists' }, { status: 400 });
        }
    }

    const hash = await bcrypt.hash(password || 'password123', 10);
    const currentUserId = (session.user as any).userId;

    const user = await prisma.user.create({
        data: {
            email, name, role, phone: phone || null,
            employeeId: employeeId || null,
            designation: designation || null,
            departmentId: departmentId || null,
            password: hash,
            mustResetPassword: true,
            status: 'ACTIVE',
            createdBy: currentUserId,
        },
    });

    // Audit log
    await prisma.auditLog.create({
        data: {
            actionType: 'USER_CREATE',
            userId: currentUserId,
            targetId: user.id,
            newValue: JSON.stringify({ name, email, role }),
            role: 'SUPER_ADMIN',
        },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // Fetch the target user
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // SECURITY: Block editing Super Admin role/status
    if (targetUser.role === 'SUPER_ADMIN') {
        // Only allow non-sensitive updates (name, phone, etc.)
        if (data.role || data.status) {
            return NextResponse.json(
                { error: 'Super Admin role and status cannot be modified' },
                { status: 403 }
            );
        }
    }

    // SECURITY: Block privilege escalation — no one can set role to SUPER_ADMIN
    if (data.role === 'SUPER_ADMIN') {
        return NextResponse.json(
            { error: 'Cannot assign Super Admin role through User Management' },
            { status: 403 }
        );
    }

    // SECURITY: Only one Principal allowed - check when creating/updating to PRINCIPAL
    if (data.role === 'PRINCIPAL' && data.role !== targetUser.role) {
        const existingPrincipal = await prisma.user.findFirst({
            where: { role: 'PRINCIPAL', isDeleted: false },
        });
        if (existingPrincipal) {
            return NextResponse.json(
                { error: 'A Principal already exists. Only one Principal is allowed.' },
                { status: 409 }
            );
        }
    }

    // Remove password from update unless explicitly provided
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    } else {
        delete data.password;
    }

    // Remove isDeleted from allowed updates
    delete data.isDeleted;
    delete data.createdBy;

    const oldValues: any = {};
    if (data.role && data.role !== targetUser.role) oldValues.role = targetUser.role;
    if (data.status && data.status !== targetUser.status) oldValues.status = targetUser.status;

    const user = await prisma.user.update({
        where: { id },
        data,
    });

    // Audit log for role/status changes
    if (Object.keys(oldValues).length > 0) {
        const currentUserId = (session.user as any).userId;
        await prisma.auditLog.create({
            data: {
                actionType: data.role !== targetUser.role ? 'ROLE_CHANGE' : 'USER_UPDATE',
                userId: currentUserId,
                targetId: id,
                oldValue: JSON.stringify(oldValues),
                newValue: JSON.stringify({ role: data.role, status: data.status }),
                role: 'SUPER_ADMIN',
            },
        });
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, status: user.status });
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const currentUserId = (session.user as any).userId;

    // SECURITY: Don't allow deleting yourself
    if (id === currentUserId) {
        return NextResponse.json({ error: 'Super Admin cannot delete their own account' }, { status: 400 });
    }

    // Fetch target user
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // SECURITY: Cannot delete Super Admin accounts
    if (targetUser.role === 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Super Admin accounts cannot be deleted' }, { status: 403 });
    }

    // Soft delete instead of hard delete
    await prisma.user.update({
        where: { id },
        data: { isDeleted: true, status: 'INACTIVE' },
    });

    // Audit log
    await prisma.auditLog.create({
        data: {
            actionType: 'USER_DELETE',
            userId: currentUserId,
            targetId: id,
            oldValue: JSON.stringify({ name: targetUser.name, email: targetUser.email, role: targetUser.role }),
            role: 'SUPER_ADMIN',
            reason: 'Soft deleted by Super Admin',
        },
    });

    return NextResponse.json({ success: true });
}
