import { z }from "zod";
import { inngest } from "./client";

import { createAgent, createNetwork, createTool, gemini } from "@inngest/agent-kit";
import {Sandbox} from "@e2b/code-interpreter"
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    console.log(event.data.input);
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("spider-test-2");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert in code generation and manipulation.",
      system: PROMPT,
      model: gemini({ model: "gemini-2.5-pro" }),
      // model: openai({ model: "gpt-4.1" }),
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
          handler: async ({ files }, { step, network }) => {
            return await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);

                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }

                if (typeof updatedFiles === "object") {
                  network.state.data.files = updatedFiles;
                }

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

    const network = createNetwork({
      name :  "coding-agent-network",
      agents : [codeAgent],
      maxIter : 5,
      router : async ({network}) => {
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

    console.log("SANDBOX URL", sandboxUrl);
    return { 
      url : sandboxUrl,
      title: "Fragment",
      files : result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
