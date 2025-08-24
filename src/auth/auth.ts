import NextAuth, { User } from "next-auth";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";

const isEdgeRuntime =
  typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

// Create adapter only on Node.js runtime to avoid bundling Prisma in Edge/middleware
const adapter = isEdgeRuntime
  ? undefined
  : PrismaAdapter((await import("@/lib/db")).prisma);

const providers: Provider[] = [
  Google,
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,

  session: { strategy: "jwt" },

    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider !== "credentials") {
             return true;
        }
        const { getUserById } = await import("./user");
        const existingUser = await getUserById(user.id ?? "");
         
        if(!existingUser?.emailVerified) {
             return false;
        }
  
        return true
   },
   
    
      async session({ token, session }) {
  
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
          } as User,
        };
      },
      async jwt({ token }) {
  // Avoid DB lookups in Edge runtime (e.g., middleware) where Prisma cannot run
  if (isEdgeRuntime) return token;
  // console.log("token in jwt", token);
        if (!token.sub) return token;
        const { getUserById, getAccountById } = await import("./user");
        const existingUser = await getUserById(token.sub);
  
        if (!existingUser) return token;
        const existingAccount = await getAccountById(existingUser?.id);
  
        token.isOauth = !!existingAccount;
  
        token.name = existingUser.name;
        token.image = existingUser.image;
        token.email = existingUser.email;
  
        return token;
      },
    },

  providers,
  pages: {
    signIn: "/signin",
  },
});
