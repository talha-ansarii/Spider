
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "@/lib/db";
import { auth } from "@/auth/auth";
import { headers as nextHeaders } from "next/headers";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 * 
 */
export const createTRPCContext = async (opts?: { headers: Headers }) => {
  const session = await auth();
  // Use passed headers if available (e.g., in fetch adapter),
  // otherwise fall back to Next.js server headers for RSC usage
  const hdrs = opts?.headers ?? nextHeaders();
  return {
    db: prisma,
    user: session?.user,
    headers: hdrs,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */



const protectedMiddleware = t.middleware(async ({ ctx, next }) => {
  // Authenticated user
  const user = ctx.user;
  // console.log("User session:", user); 
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
 
  const dbUser = await ctx.db.user.findUnique({
    where: { id: user.id },
  });
 
  if (!user.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid user ID',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user,
      dbUser,
    },
  });
});


/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */

export const protectedProcedure = t.procedure.use(protectedMiddleware);
export const baseProcedure = t.procedure;
