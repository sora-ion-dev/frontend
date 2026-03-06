import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userEmail = req.auth?.user?.email;

    // Public routes - accessible without login
    const publicRoutes = ["/", "/login"];
    if (publicRoutes.includes(nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Admin Panel - EXCLUSIVE for owner
    if (nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn || userEmail !== "bhaveshkori001@gmail.com") {
            return NextResponse.redirect(new URL("/app", nextUrl));
        }
        return NextResponse.next();
    }

    // Protected routes - require login
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
