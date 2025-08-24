import Prism from "prismjs";
import { useEffect } from "react";

// Import core languages first
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";


import "./code-theme.css";

interface CodeViewProps {
   code: string;
   lang: string;
}

export const CodeView = ({ code, lang }: CodeViewProps) => {
   useEffect(() => {
      Prism.highlightAll();
   }, [code, lang]);

   return (
      <pre className={"p-2 bg-transparent border-none rounded-none m-0 text-xs"}>
         <code className={`language-${lang}`}>{code}</code>
      </pre>
   );
};
