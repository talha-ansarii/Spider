import "server-only";
import { auth } from "./auth";
import { prisma } from "@/lib/db";

// Ensure this file is evaluated server-side only
export const runtime = "nodejs";
export const dynamic = "force-static";
export const getUserByEmail = async (email: string) => {
  try {
    const lowerCaseEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: {
        email: lowerCaseEmail,
      },
    });

    return user;
  } catch (e) {
    console.log("Error fetching user by email:", e);
    return null;
  }
};

export const getUserById = async (id: string | undefined) => {
  if (!id) return null;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  } catch (error) {
    console.log("Error fetching user by ID:", error);
    return null;
  }
};

export const getAccountById = async (id: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: id,
      },
    });

    return account;
  } catch (error) {
    console.log("Error fetching account by ID:", error); 
    return null;
  }
};

export const getUserFromSession = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user;
};
