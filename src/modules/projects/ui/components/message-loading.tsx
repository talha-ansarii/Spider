import Image from "next/image";
import { useEffect, useState } from "react";


const ShimmerMessages =() => {

   const messages = [
      "Thinking...",
      "Loading...",
      "Generating...",
      "Analyzing...",
      "Building...",
      "Crafting Components...",
      "Optimizing Layout...",
      "Adding Finishing Touches...",
      "Almost There...",
      "Finalizing..."
   ]

   const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 2000);

      return () => clearInterval(interval);
   }, [messages.length]);

   return (
      <div className="shimmer-messages">
         <span className="text-base text-muted-foreground animate-pulse">{messages[currentMessageIndex]}</span>
      </div>
   );
}
export const MessageLoading = () => {
   return (
      <div className="flex flex-col group px-2 pb-4">
         <div className="flex items-center ga-2 pl-2 mb-2">
            <Image
            src="/logo.svg"
            alt="Spider"
            width={18}
            height={18}
            className="shrink-0"
         />
         <span className="text-sm font-medium ml-2">Spider</span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
         <ShimmerMessages />
      </div>
   </div>
);
}
