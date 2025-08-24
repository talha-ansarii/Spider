

import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { User } from "next-auth";



export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as User;

if (!user) {
   redirect("/signin");
  }

  return (
    <>
      {children}
    </>
  );
}
