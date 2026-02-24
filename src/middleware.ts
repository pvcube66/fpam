import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // Allow public routes through without authentication
        if (pathname === '/admin-setup' || pathname.startsWith('/api/admin/register')) {
            return NextResponse.next();
        }

        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        const role = token.role as string;

        // Role-based route protection
        const roleRoutes: Record<string, string[]> = {
            FACULTY: ['/dashboard/faculty'],
            HOD: ['/dashboard/hod'],
            PRINCIPAL: ['/dashboard/principal'],
            IQAC: ['/dashboard/iqac'],
            EXAM_CELL: ['/dashboard/exam'],
            STUDENT: ['/dashboard/student'],
            SUPER_ADMIN: ['/dashboard/admin'],
            COUNSELLING_COORDINATOR: ['/dashboard/counselling'],
            RND_COORDINATOR: ['/dashboard/research'],
        };

        // Check if user is accessing their allowed routes
        if (pathname.startsWith('/dashboard')) {
            const allowedPaths = roleRoutes[role] || [];
            const isAllowed = allowedPaths.some(p => pathname.startsWith(p));

            if (!isAllowed) {
                const defaultPath = allowedPaths[0] || '/login';
                return NextResponse.redirect(new URL(defaultPath, req.url));
            }
        }

        // Admin API protection
        if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/register') && role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Audit logs API protection - only SUPER_ADMIN and PRINCIPAL
        if (pathname.startsWith('/api/audit-logs') && !['SUPER_ADMIN', 'PRINCIPAL'].includes(role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Counselling API protection
        if (pathname.startsWith('/api/counselling') && role !== 'COUNSELLING_COORDINATOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Research API protection
        if (pathname.startsWith('/api/research') && role !== 'RND_COORDINATOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;
                // Allow unauthenticated access to login page, public pages, and admin setup
                if (pathname === '/login' || pathname === '/' || pathname === '/admin-setup' || pathname.startsWith('/api/admin/register')) {
                    return true;
                }
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/api/admin/:path*', '/api/audit-logs/:path*', '/api/counselling/:path*', '/api/research/:path*'],
};
