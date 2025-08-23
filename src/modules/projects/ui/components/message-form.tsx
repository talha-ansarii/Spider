import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import TextAreaAutoSize from "react-textarea-autosize"
import { useState } from "react"
import {z} from "zod"
import { toast } from "sonner"
import { ArrowUpIcon, Loader2Icon } from "lucide-react"
import { useMutation,  useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useTRPC } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Form, FormField } from "@/components/ui/form"


interface Props{
   projectId: string;
}

const formSchema = z.object({
  value: z.string().min(1, { message: "Message is required" }),
});



export const MessageForm = ({ projectId }: Props) => {

   const [isFocused, setIsFocused] = useState(false);
   const [showUsage] = useState(false);

   const trpc = useTRPC();
   const queryClient = useQueryClient();

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         value: "",
      },
   });


   const createMessage = useMutation(
     trpc.messages.create.mutationOptions({
       onSuccess: () => {
         form.reset();
         queryClient.invalidateQueries(
            trpc.messages.getMany.queryOptions({
               projectId
            })
         )
         //Invalidate usage status
       },
       onError: () => {
         //Redirect to pricing page if specific error
         toast.error("Failed to send message");
       },
     })
   );

   const formSubmit = async (values : z.infer<typeof formSchema>) => {
      console.log(values);
      await createMessage.mutateAsync({
         projectId,
         value : values.value,
      });
   }

   const isPending = createMessage.isPending;
   const isDisabled = isPending || !form.formState.isValid;

   return (
     <Form {...form}>
       <form
         className={cn(
           "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
           isFocused && "shadow-xs",
           showUsage && "rounded-t-none"
         )}
         onSubmit={form.handleSubmit(formSubmit)}
       >
         <FormField
           control={form.control}
           name="value"
           render={({ field }) => (
             <TextAreaAutoSize
               {...field}
               disabled={isPending}
               onFocus={() => setIsFocused(true)}
               onBlur={() => setIsFocused(false)}
               minRows={2}
               maxRows={8}
               placeholder="What would you like to build"
               className="resize-none pt-4 border-none w-full outline-none bg-transparent"
               onKeyDown={(e) => {
                 if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                   e.preventDefault();
                   form.handleSubmit(formSubmit)(e);
                 }
               }}
             />
           )}
         />

         <div className="flex gap-x-2 items-end justify-between w-full pt-2">
           <div className="text-[10px] text-muted-foreground font-mono">
             <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-sans text-xs font-medium opacity-100">
               <span>&#8984;</span>Enter
             </kbd>
             &nbsp;to submit
           </div>
           <Button
           disabled={isDisabled}
           className={cn(
            "size-8 rounded-full flex justify-center items-center",
            isDisabled && "bg-muted-foreground border"
           )}
           >
            {isPending ? <Loader2Icon className="size-4 animate-spin"/> : <ArrowUpIcon className="size-4 "/>}
           </Button>
         </div>
       </form>
     </Form>
   );
};
