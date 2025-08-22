
import { Button } from "@/components/ui/button";
import { getQueryClient, trpc } from "@/trpc/server";



export default async function Page() {

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.hello.queryOptions({text:"talha"}));

  return (
    <div className="text-gray-900">
      <Button variant={"destructive"}>
      
      </Button>
    </div>
  );
}
