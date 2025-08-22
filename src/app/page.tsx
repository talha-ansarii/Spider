import { Button } from "@/components/ui/button";
// import { prisma } from "@/lib/db";

export default async function Page() {
  // const users = await prisma.user.findMany();

  return (
    <div className="text-gray-900">
      <Button variant={"destructive"}>
        Hello
      </Button>
    </div>
  );
}
