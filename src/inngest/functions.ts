import { z }from "zod";
import { inngest } from "./client";

import { createAgent, createNetwork, createTool, openai, Tool } from "@inngest/agent-kit";
import {Sandbox} from "@e2b/code-interpreter"
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";


interface AgentState {
  summary: string;
  files: {[path:string]: string};
}

export const coder = inngest.createFunction(
  { id: "coder" },
  { event: "coder/run" },
  async ({ event, step }) => {

    console.log(event.data.input);
    

    
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("spider-test-2");
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert in code generation and manipulation.",
      system: PROMPT,
      // model: gemini({ model: "gemini-2.5-pro" }),
      model: openai({ model: "gpt-4.1" }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout(data) {
                    buffers.stdout += data;
                  },
                  onStderr(data) {
                    buffers.stderr += data;
                  },
                });

                return result.stdout;
              } catch (e) {
                console.error(
                  `Error occurred while executing command: ${e}\nstdOut: ${buffers.stdout}\nstderror: ${buffers.stderr}`
                );
                return `Error occurred while executing command: ${e}\nstdOut: ${buffers.stdout}\nstderror: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            return await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);

                for (const file of files) {
                  console.log("WRITING FILE", file.path);
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                // Generate a unique tool run ID for this execution
                const toolRunId = `${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`;
                // Save the current state of files to TempFiles with the toolRunId
                await prisma.tempFiles.create({
                  data: {
                    files: updatedFiles,
                    toolRunId: toolRunId,
                    projectId: event.data.projectId,
                  },
                });

                network.state.data.files = updatedFiles;

                return updatedFiles;
              } catch (e) {
                return `Error : ${e}`;
              }
            });
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const fileContents = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  fileContents.push({ path: file, content });
                }

                

                return JSON.stringify(fileContents);
              } catch (e) {
                console.error(`Error occurred while reading files: ${e}`);
                return `Error occurred while reading files: ${e}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
        console.log("FILES", network?.state.data.files);


          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }


          return result;
        },

      },
      
    });

    const network = createNetwork<AgentState>({
      name :  "coding-agent-network",
      agents : [codeAgent],
      maxIter : 15,
      router : async ({network}) => {
        console.log("ROUTER", JSON.stringify(network.state.data, null, 2));
        const summary = network.state.data.summary;
        if(summary){
          return;
        }
        return codeAgent;
      }
    })

    const result = await network.run(event.data.input);


    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    const isError = !result.state.data.summary

    console.log("FINAL RESULT", JSON.stringify(result.state.data));

    await step.run("save-result", async() => {

      if(isError){
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Error occurred while processing request. Please try again",
            role: "ASSISTANT",
            type: "ERROR"
          }
        });
      }

      // Get the latest temp files for this tool run
      const latestTempFile = await prisma.tempFiles.findFirst({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      // Create the message with fragment
      await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: "Fragment",
              files: latestTempFile?.files || {},
            },
          },
        },
      });

      // Delete all temp files for this project after saving the result
      await prisma.tempFiles.deleteMany({
        where: {
          projectId: event.data.projectId,
        }
      });
    })

    console.log("SANDBOX URL", sandboxUrl);
    return { 
      url : sandboxUrl,
      title: "Fragment",
      files : result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
