import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const adminKey = req.cookies.get("admin_key")?.value;
    const expectedKey = process.env.ADMIN_KEY || "Bhavesh#21";

    // Protect Admin Panel
    if (nextUrl.pathname.startsWith("/admin")) {
        if (adminKey !== expectedKey) {
            // Redirect to a simple unauthorized page or just back to app
            // For now, let's allow the page to render and handle the prompt if no cookie
            // but middleware protection is stronger.
            // We'll redirect to a special 'admin-login' if we want, or just let it through 
            // if we handle the prompt inside the page. 
            // Actually, let's just let it through for now and handle the prompt in page.tsx 
            // to keep it simple for the user.
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
