"use client"

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";


export default  function Page() {

 const trpc = useTRPC();
 const invoke = useMutation(trpc.invoke.mutationOptions({
  onSuccess: () => {
    toast.success("Background job invoked successfully!");
  }
}));

  return (
    <div className="text-gray-900">
      <Button 
      onClick={() => invoke.mutate({ text: "talha" })}
      variant={"outline"}>
      Invoke bg job
      </Button>
    </div>
  );
}
