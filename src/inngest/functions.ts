import { inngest } from "./client";

import { createAgent, gemini } from "@inngest/agent-kit";
import {Sandbox} from "@e2b/code-interpreter"
import { getSandbox } from "./utils";
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("spider-test-2");
      return sandbox.sandboxId;
    });

    const summarizer = createAgent({
      name: "Summarizer",
      system: "You are a Summarizer expert. Summarize the text in 1 word.",
      model: gemini({ model: "gemini-2.0-flash" }),
    });

    const { output } = await summarizer.run(
      `Summarize the following text: ${event.data.input}`
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output, sandboxUrl };
  }
);
