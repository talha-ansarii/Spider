import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {z} from "zod";
import { generateSlug } from "random-word-slugs";
import { TRPCError } from "@trpc/server";


export const projectsRouter = createTRPCRouter({

  getOne: baseProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    })
  )
  .query(async ({ input }) => {
    const project = await prisma.project.findUnique({
      where: {
        id: input.id,
      }
    });
    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }
    return project;
  }),

  getManyByUserId: protectedProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
          page: z.number().int().min(1).default(1),
          perPage: z.number().int().min(1).max(50).default(12),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const perPage = input?.perPage ?? 12;
      const q = input?.query?.trim();

      const where = {
        userId: ctx?.user?.id,
        ...(q
          ? {
              name: {
                contains: q,
                mode: "insensitive" as const,
              },
            }
          : {}),
      } as const;

      const [items, total] = await prisma.$transaction([
        prisma.project.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            _count: { select: { messages: true } },
          },
        }),
        prisma.project.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / perPage));
      return {
        items,
        page,
        perPage,
        total,
        totalPages,
        query: q ?? "",
      };
    }),



  create: protectedProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Prompt is required" }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { value } = input;
      const newProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab",
          }),
          userId: ctx?.user?.id || "",
          messages: {
            create: {
              content: value ? value : "",
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      if(value){
        await inngest.send({
          name: "coder/run",
          data: {
            input: value,
            projectId: newProject.id,
          },
        });
      }
      return newProject;
    }),
});



