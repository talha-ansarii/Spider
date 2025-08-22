import { inngest } from "./client";

import { createAgent, gemini } from "@inngest/agent-kit";


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event}) => {
    const summarizer = createAgent({
      name: "Summarizer",
      system:
        "You are a Summarizer expert. Summarize the text in 1 word.",
      model: gemini({model: "gemini-2.0-flash"}),
    });

    const { output } = await summarizer.run(`Summarize the following text: ${event.data.input}`);

    return {  output };
  }
);
