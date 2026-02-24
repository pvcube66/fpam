import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Check if Super Admin exists
export async function GET() {
    const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN', isDeleted: false },
        select: { id: true, name: true },
    });

    return NextResponse.json({ exists: !!superAdmin });
}

// Create the first Super Admin (one-time only)
export async function POST(req: NextRequest) {
    // Check if Super Admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN', isDeleted: false },
    });

    if (existingSuperAdmin) {
        return NextResponse.json(
            { error: 'Super Admin already exists. Registration is disabled.' },
            { status: 403 }
        );
    }

    const body = await req.json();
    const { name, email, employeeId, department, phone, password, confirmPassword } = body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        return NextResponse.json(
            { error: 'Name, email, password, and confirm password are required' },
            { status: 400 }
        );
    }

    if (password !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: 'Password must be at least 8 characters' },
            { status: 400 }
        );
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return NextResponse.json(
            { error: 'A user with this email already exists' },
            { status: 400 }
        );
    }

    // Check employee ID uniqueness if provided
    if (employeeId) {
        const existingEmp = await prisma.user.findUnique({ where: { employeeId } });
        if (existingEmp) {
            return NextResponse.json(
                { error: 'A user with this Employee ID already exists' },
                { status: 400 }
            );
        }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Find or skip department
    let departmentId: string | null = null;
    if (department) {
        const dept = await prisma.department.findFirst({
            where: { OR: [{ name: department }, { code: department }] },
        });
        departmentId = dept?.id || null;
    }

    const superAdmin = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            phone: phone || null,
            employeeId: employeeId || null,
            departmentId,
            status: 'ACTIVE',
            mustResetPassword: false,
            isDeleted: false,
        },
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            actionType: 'SUPER_ADMIN_CREATED',
            userId: superAdmin.id,
            targetId: superAdmin.id,
            newValue: JSON.stringify({ name, email, role: 'SUPER_ADMIN' }),
            role: 'SUPER_ADMIN',
            reason: 'Initial Super Admin registration',
        },
    });

    return NextResponse.json({
        success: true,
        message: 'Super Admin account created successfully',
        user: { id: superAdmin.id, name: superAdmin.name, email: superAdmin.email },
    });
}
