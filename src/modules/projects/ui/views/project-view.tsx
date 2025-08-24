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
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {  CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";

export const ProjectView = ({ projectId }: Props   ) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code" > ("preview");

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
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            className="h-full gap-y-0"
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => setTabState(value as "preview" | "code")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 flex justify-center items-center gap-2 px-2 border rounded-md">
                <TabsTrigger className="rounded-md" value="preview">
                  {" "}
                  <EyeIcon />{" "}
                </TabsTrigger>
                <TabsTrigger className="rounded-md" value="code">
                  <CodeIcon />
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                <Button asChild size={"sm"} variant={"default"}>
                  <Link href={"/pricings"}>
                    <CrownIcon className="mr-2" /> Upgrade
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent className="h-[calc(100vh-50px)]" value="preview">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="h-[calc(100vh-50px)]">
              {!!activeFragment?.files && (
                <FileExplorer
                  files={activeFragment?.files as { [path: string]: string }}
                />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

