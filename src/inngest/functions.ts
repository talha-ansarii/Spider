/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z } from "zod";
import { inngest } from "./client";

import {
  createAgent,
  createNetwork,
  createTool,
  openai,
  type Tool,
  type Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const coder = inngest.createFunction(
  { id: "coder" },
  { event: "coder/run" },
  async ({ event, step }) => {
    console.log(event.data.input);

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("spider-test-2");
      await sandbox.setTimeout(60_000 * 10 * 3);
      return sandbox.sandboxId;
    });

    const previousMessagesAndFiles = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];
        const formattedFilesPath: { [path: string]: string } = {};
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          include: {
            fragment: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        for (const i in messages) {
          const message = messages[i];
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: `${i + 1}. ${message.content}`,
          });

          //extracting file paths only
          for (const path of Object.keys(message.fragment?.files || {})) {
            formattedFilesPath[path] =
              "Call get-file-content-using-path-from-database tool to see the content of the required file";
          }
        }

        return { messages: formattedMessages, files: formattedFilesPath };
      }
    );

    console.log("PREVIOUS FILES", previousMessagesAndFiles.files);
    // console.log("PREVIOUS MESSAGES", previousMessagesAndFiles.messages);

    const state = createState<AgentState>(
      {
        summary: "",
        files: previousMessagesAndFiles.files,
      },
      {
        messages: previousMessagesAndFiles.messages,
      }
    );

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
        createTool({
          name: "get-file-content-using-path-from-database",
          description:
            "Get the content of a file using its path from the database",
          parameters: z.object({
            filePath: z.string(),
          }),
          handler: async ({ filePath }, { step }) => {
            return await step?.run("getFileContent", async () => {
              console.log("get File Content Tool Called", filePath);
              try {
                const latestMessage = await prisma.message.findFirst({
                  where: {
                    AND: [
                      { projectId: event.data.projectId },
                      { role: "ASSISTANT" },
                    ],
                  },
                  orderBy: {
                    createdAt: "desc", // latest first
                  },
                  include: {
                    fragment: true, // include files Json
                  },
                });
                console.log("Latest message found", latestMessage);

                if (
                  !(
                    latestMessage?.fragment?.files &&
                    //@ts-expect-error
                    filePath in latestMessage.fragment.files
                  )
                ) {
                  console.log("No file found for this path.");
                } else {
                  const files = latestMessage.fragment.files as Record<
                    string,
                    string
                  >;
                  const fileContent = files[filePath];

                  console.log("Latest file content:", fileContent);
                  return fileContent;
                }
              } catch (e) {
                console.error(
                  `Error occurred while reading file ${filePath}: ${e}`
                );
                return `Error occurred while reading file ${filePath}: ${e}`;
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

    const fragmentTitleGeneration = createAgent({
      name: "fragment-title-generation",
      description: "Generates a title for the code fragment",
      model: openai({ model: "gpt-4o-mini" }),
      system: FRAGMENT_TITLE_PROMPT,
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "Generates a response based on the code fragment",
      model: openai({ model: "gpt-4o-mini" }),
      system: RESPONSE_PROMPT,
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        console.log("ROUTER", JSON.stringify(network.state.data, null, 2));
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.input, { state });

    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const { output: fragmentTitleOutput } = await fragmentTitleGeneration.run(
      result.state.data.summary
    );

    const generateFragmentTitle = (): string => {
      if (fragmentTitleOutput[0]?.type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((txt) => txt).join("");
      } else {
        return fragmentTitleOutput[0].content || "Fragment";
      }
    };

    const generateResponse = (): string => {
      if (responseOutput[0]?.type !== "text") {
        return "Here You Go!!";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((txt) => txt).join("");
      } else {
        return responseOutput[0].content || "Here You Go!!";
      }
    };

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    const isError = !result.state.data.summary;

    console.log("FINAL RESULT", JSON.stringify(result.state.data));

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content:
              "Error occurred while processing request. Please try again",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      // Get the latest temp files for this tool run
      const latestTempFile = await prisma.tempFiles.findFirst({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Create the message with fragment
      await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: latestTempFile?.files || {},
            },
          },
        },
      });

      // Delete all temp files for this project after saving the result
      await prisma.tempFiles.deleteMany({
        where: {
          projectId: event.data.projectId,
        },
      });
    });

    console.log("SANDBOX URL", sandboxUrl);
    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
