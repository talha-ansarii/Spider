"use client";

interface Props {
  projectId: string;
}

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { ProjectHeader } from "../components/project-header";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { FragmentWeb } from "../components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { CodeIcon, EyeIcon } from "lucide-react";
import { FileExplorer } from "@/components/file-explorer";
import { ErrorBoundary } from "react-error-boundary";
import Loader from "@/components/ui/loader";

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");
  // mobile outer tabs: switch between messages list and fragment viewer
  const [mobileTab, setMobileTab] = useState<"messages" | "fragment">(
    "messages"
  );

  return (
    <div className="h-screen">
      {/* Desktop: horizontal split (hidden on small screens) */}
      <div className="hidden md:flex h-full">
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
              onValueChange={(value) =>
                setTabState(value as "preview" | "code")
              }
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

      {/* Mobile: stacked view with outer tabs to switch between Messages and Fragment */}
      <div className="md:hidden h-full flex flex-col">
        <div className="border-b">
          <Tabs
            value={mobileTab}
            onValueChange={(v) => setMobileTab(v as "messages" | "fragment")}
          >
            <TabsList className="flex w-full gap-1 p-1 bg-background/5 rounded-md m-2">
              <TabsTrigger
                className="flex-1 justify-center py-2 rounded-md text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                value="messages"
              >
                Messages
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 justify-center py-2 rounded-md text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                value="fragment"
              >
                Fragment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-auto">
          {mobileTab === "messages" ? (
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
          ) : (
            <div className="h-full flex flex-col">
              <ProjectHeader projectId={projectId} />
              <Tabs
                className="h-full"
                value={tabState}
                onValueChange={(value) =>
                  setTabState(value as "preview" | "code")
                }
              >
                <div className="w-full flex items-center p-2 border-b gap-x-2">
                  <TabsList className="flex h-9 items-center gap-1 rounded-lg p-1 bg-background/5 mx-2 shadow-sm">
                    <TabsTrigger
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
                      value="preview"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md"
                      value="code"
                    >
                      <CodeIcon className="w-4 h-4" />
                      Code
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent className="h-full overflow-auto" value="preview">
                  {!!activeFragment && <FragmentWeb data={activeFragment} />}
                </TabsContent>

                <TabsContent className="h-full overflow-auto" value="code">
                  {!!activeFragment?.files && (
                    <FileExplorer
                      files={
                        activeFragment?.files as { [path: string]: string }
                      }
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
