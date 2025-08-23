import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import {z} from "zod";
import { generateSlug } from "random-word-slugs";


export const projectsRouter = createTRPCRouter({

   getMany: baseProcedure
   .query(async () => {
      const projects = await prisma.project.findMany({
         orderBy: {
            updatedAt: "desc"
         }
      });
      return projects;
   }),

   create :  baseProcedure
   .input(z.object({
      value : z.string().min(1,{message: "Prompt is required"})
   }))
   .mutation(async ({input}) => {
      const { value } = input;
      const newProject = await prisma.project.create({
         data: {
            name: generateSlug(2,{
               format : "kebab"
            }),
            messages:{
               create : {
                  content: value,
                  role: "USER",
                  type: "RESULT"
               }
            }
         }
      });

      await inngest.send({
         name: "coder/run",
         data: {
            input: value,
            projectId: newProject.id
         },
      });
    return newProject;
   })
});



