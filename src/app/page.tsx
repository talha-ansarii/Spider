"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";


export default  function Page() {

 const [value, setValue] = useState("");

 const trpc = useTRPC();

 const createProject = useMutation(trpc.projects.create.mutationOptions({
   onError : (error) => {
     toast.error(`Error creating project: ${error.message}`);
   }
 }));




  return (
    <div className="text-gray-900">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={createProject.isPending}
        onClick={() => createProject.mutate({ value: value })}
        variant={"outline"}
      >
        Submit
      </Button>

      
    </div>
  );
}
