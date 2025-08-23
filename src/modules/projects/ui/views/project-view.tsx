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
import { ProjectHeader } from "../components/project-header";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";

export const ProjectView = ({ projectId }: Props   ) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);


  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel 
        defaultSize={35}
        minSize={20}
        className="flex flex-col min-h-0"
        >
          <Suspense fallback={<div>Loading messages...</div>}>
            <ProjectHeader projectId={projectId} />
            <MessagesContainer projectId={projectId}
            activeFragment={activeFragment}
            setActiveFragment={setActiveFragment}
             />
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

