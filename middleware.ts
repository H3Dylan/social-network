import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Define public paths
    const publicPaths = [
        "/login",
        "/register",
        "/api/register",
        "/api/auth",
        "/_next",
        "/favicon.ico",
        "/uploads",
    ];

    // Check if the current path is public
    const isPublicPath = publicPaths.some((publicPath) =>
        path.startsWith(publicPath)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Get the token
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token and not on a public path, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads).*)",
    ],
};
