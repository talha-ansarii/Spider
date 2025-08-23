"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";




interface HintProps {
   children: React.ReactNode;
   text: string;
   side?: "top" | "bottom" | "left" | "right";
   align?: "start" | "center" | "end";
}


export const Hint = ({ children, text, side = "top", align = "center" }: HintProps) => {
   return (
      <TooltipProvider>
         <Tooltip>
            <TooltipTrigger asChild>
               {children}
            </TooltipTrigger>
            <TooltipContent side={side} align={align}>
               {text}
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   );
}