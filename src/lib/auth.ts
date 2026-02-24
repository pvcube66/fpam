import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
                role: { label: 'Role', type: 'text' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter email and password');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { department: true },
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                if (user.isDeleted) {
                    throw new Error('This account has been removed. Contact admin.');
                }

                if (user.status === 'INACTIVE') {
                    throw new Error('Your account has been deactivated. Contact admin.');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error('Invalid password');
                }

                // Validate selected role matches the user's actual role
                if (credentials.role && user.role !== credentials.role) {
                    const roleLabels: Record<string, string> = {
                        FACULTY: 'Faculty', HOD: 'Head of Department', PRINCIPAL: 'Principal',
                        IQAC: 'IQAC', EXAM_CELL: 'Examination Cell', STUDENT: 'Student',
                        SUPER_ADMIN: 'Super Admin', COUNSELLING_COORDINATOR: 'Counselling Coordinator',
                        RND_COORDINATOR: 'R&D Coordinator',
                    };
                    throw new Error(`You are not authorized to login as ${roleLabels[credentials.role] || credentials.role}. Your account role is ${roleLabels[user.role] || user.role}.`);
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    departmentId: user.departmentId,
                    departmentName: user.department?.name || null,
                    profileImageUrl: user.profileImageUrl || null,
                    mustResetPassword: user.mustResetPassword,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.userId = user.id;
                token.departmentId = (user as any).departmentId;
                token.departmentName = (user as any).departmentName;
                token.profileImageUrl = (user as any).profileImageUrl;
                token.mustResetPassword = (user as any).mustResetPassword;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).userId = token.userId;
                (session.user as any).departmentId = token.departmentId;
                (session.user as any).departmentName = token.departmentName;
                (session.user as any).profileImageUrl = token.profileImageUrl;
                (session.user as any).mustResetPassword = token.mustResetPassword;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
