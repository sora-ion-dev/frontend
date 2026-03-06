import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user }) {
            if (user?.email) {
                try {
                    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
                    await fetch(`${BACKEND_URL}/auth/login-event`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: user.email })
                    });
                } catch (e) {
                    console.error("Failed to trigger login event", e);
                }
            }
            return true;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLoginPage = nextUrl.pathname === "/login";

            if (isOnLoginPage) {
                if (isLoggedIn) return Response.redirect(new URL("/app", nextUrl));
                return true;
            }

            return isLoggedIn;
        },
    },
});
