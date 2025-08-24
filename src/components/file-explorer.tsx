import { Fragment, useCallback, useMemo, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Hint } from "@/modules/projects/ui/components/hint";
import { Button } from "./ui/button";
import { CopyIcon } from "lucide-react";
import { CodeView } from "./code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";






type FileCollection = { [path: string]: string };

function getLanguageFromExtension(fileName: string): string{
   const extension = fileName.split(".").pop()?.toLowerCase();

   return extension || "text";
}

interface FileExplorerProps {
  files: FileCollection;

}

interface FileBreadcrumbsProps {
  filePath: string;

}

const FileBreadcrumbs = ({ filePath }: FileBreadcrumbsProps) => {

   const pathSegments = filePath.split("/")
   const maxSegmentsToShow = 4;

   const renderBreadcrumbsItems = () => {
     if(pathSegments.length <= maxSegmentsToShow){
      return pathSegments.map((segment, index) => {
         const isLast = index === pathSegments.length - 1;
         return (
            <Fragment key={index}>
               <BreadcrumbItem>
                  {isLast? (
                     <BreadcrumbPage className="font-medium">
                        {segment}
                     </BreadcrumbPage>
                  ):(
                     <span className="text-muted-foreground">
                        {segment}
                     </span>
                  )}
               </BreadcrumbItem>
               {!isLast && <BreadcrumbSeparator />}
            </Fragment>
         );
      });
     }else{
      const firstSegment = pathSegments[0];
      const lastSegment = pathSegments[pathSegments.length - 1];
      return (
         <>
            <BreadcrumbItem>
               <span className="text-muted-foreground">
                  {firstSegment}
               </span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
               <BreadcrumbEllipsis />
                
            </BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
            {lastSegment}
            </BreadcrumbPage>
            <BreadcrumbItem>

            
            </BreadcrumbItem>
         </>
      );
     }
   };

  return (
    <Breadcrumb>
    <BreadcrumbList>
      {renderBreadcrumbsItems()}
    </BreadcrumbList>
    </Breadcrumb>
  );
};

export const FileExplorer = ({ files }: FileExplorerProps) => {

   const [selectedFile, setSelectedFile] = useState<string | null>(() => {
      const fileKeys = Object.keys(files);
      return fileKeys.length > 0 ? fileKeys[0] : null;
   });

   const treeData = useMemo(() => {
      return convertFilesToTreeItems(files);
   }, [files]);

   const handleFileSelect = useCallback((
      filePath : string
   ) => {
      setSelectedFile(filePath);
   }, [files]);

   return (
     <ResizablePanelGroup direction="horizontal">
       <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar ">
        <TreeView
        data={treeData}
        value={selectedFile}
        onSelect={handleFileSelect}
        />
       </ResizablePanel>
       <ResizableHandle className="hover:bg-primary transition-colours" />
       <ResizablePanel defaultSize={70} minSize={50} className="flex flex-col h-full">
         {selectedFile && files[selectedFile] ? 
         <div className="flex flex-col h-full">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2 flex-shrink-0">
               <FileBreadcrumbs filePath={selectedFile}/>
               <Hint text="Copy to clipboard" side="bottom" align="start">
                  <Button variant="link" size="sm" onClick={() => navigator.clipboard.writeText(files[selectedFile])}>
                     <CopyIcon/>
                  </Button>
               </Hint>
            </div>
            <div className="flex-1 overflow-auto min-h-0">
               <CodeView code={files[selectedFile]} lang={getLanguageFromExtension(selectedFile)} />
            </div>
         </div> : <div className="flex h-full text-center items-center justify-center text-muted-foreground">
            <p>Select a file to view its content</p>
         </div>}
       </ResizablePanel>
     </ResizablePanelGroup>
   );
}
