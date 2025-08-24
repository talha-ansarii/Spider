// Use NextAuth's lightweight middleware helper so we don't import the full
// auth config (which can pull in Prisma). Importing the full `auth` here
// causes Prisma to be required in the Edge/middleware runtime and can
// trigger initialization errors. Using `withAuth` keeps the middleware
// runtime-free of DB code.
import { NextResponse } from "next/server";

// Minimal pass-through middleware to avoid loading server-only libs (Prisma)
// in the Edge/middleware runtime which can cause runtime failures.
export default function middleware() {
	return NextResponse.next();
}

// Adjust matcher to control which routes invoke this middleware. The
// default below skips API/_next/static/_next/image and favicon.ico.
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
