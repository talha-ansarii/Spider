"use client"

interface Props {
  projectId: string;
}

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,

} from "@/components/ui/resizable"
import { MessagesContainer } from "../components/messages-container";
import { Suspense } from "react";

export const ProjectView = ({ projectId }: Props   ) => {

  //  const trpc = useTRPC();
  //  const {data: project} = useSuspenseQuery(trpc.projects.getOne.queryOptions({ id: projectId }))
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel 
        defaultSize={35}
        minSize={20}
        className="flex flex-col min-h-0"
        >
          <Suspense fallback={<div>Loading messages...</div>}>
            <MessagesContainer projectId={projectId} />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle/>
        <ResizablePanel
        defaultSize={65}
        minSize={50}

        >
          TODO: Preview
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

