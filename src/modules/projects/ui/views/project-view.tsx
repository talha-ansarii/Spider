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
import {  CodeIcon, EyeIcon } from "lucide-react";
import { FileExplorer } from "@/components/file-explorer";
import { ErrorBoundary } from "react-error-boundary";
import Loader from "@/components/ui/loader";

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
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Suspense
              fallback={
                <div className="flex justify-center items-center w-full h-[calc(100vh-200px)]">
                  <Loader label="Loading messages..." />
                </div>
              }
            >
              <ProjectHeader projectId={projectId} />
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
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
              <TabsList className="flex h-9 items-center gap-1 rounded-lg border bg-background/60 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <TabsTrigger
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/30"
                  value="preview"
                >
                  <EyeIcon className="w-4 h-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/30"
                  value="code"
                >
                  <CodeIcon className="w-4 h-4" />
                  Code
                </TabsTrigger>
              </TabsList>
              {/* <div className="ml-auto flex items-center gap-x-2">
                <Button asChild size={"sm"} variant={"default"}>
                  <Link href={"/pricings"}>
                    <CrownIcon className="mr-2" /> Upgrade
                  </Link>
                </Button>
              </div> */}
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

