import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import {z} from "zod";
export const messagesRouter = createTRPCRouter({

   getMany: baseProcedure
   .query(async () => {
      const messages = await prisma.message.findMany({
         orderBy: {
            updatedAt: "desc"
         }
      });
      return messages;
   }),

   create :  baseProcedure
   .input(z.object({
      value : z.string().min(1,{message: "Message is required"}),
      projectId : z.string()
   }))
   .mutation(async ({input}) => {
      const { value } = input;
      const newMessage = await prisma.message.create({
         data: {
            content: value,
            role: "USER",
            type: "RESULT",
            projectId: input.projectId
         }
      });
    await inngest.send({
      name: "coder/run",
      data: {
        input: value,
        projectId: input.projectId
      },
    });
    return newMessage;
   })
});



