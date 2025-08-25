"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Github, Linkedin, Globe } from "lucide-react";


export default  function Page() {
  const { data: session } = useSession();

  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

 // Initialize without touching localStorage during SSR; hydrate on mount
 const [value, setValue] = useState("");
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
   setMounted(true);
   // Safely read any persisted value after mount
   try {
     const persisted = typeof window !== "undefined" ? localStorage.getItem("value") : null;
     if (persisted) setValue(persisted);
   } catch {}
 }, []);



 const trpc = useTRPC();


 const createProject = useMutation(trpc.projects.create.mutationOptions({
   onError : (error) => {
     toast.error(`Error creating project: ${error.message}`);
   },
   onSuccess: (data) => {
     router.push(`/projects/${data.id}`);
   }
 }));


  useEffect(() => {
    // Only run on client after mount
    if (!mounted) return;
    try {
      const val = typeof window !== "undefined" ? localStorage.getItem("value") : null;
      if (val) {
        localStorage.removeItem("value");
        createProject.mutate({ value: val });
      }
    } catch {}
  }, [createProject, mounted]);

  // Quick-start suggestions
  const suggestions = [
    "Build an admin dashboard",
    "Build a kanban board",
    "Build a blog page",
    "Build a landing page"
  ];

  function onQuickPrompt(prompt: string) {
    setValue(prompt);
    if (session?.user) {
      setValue(prompt);
    } else {
      localStorage.setItem("value", prompt);
      signIn();
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) {
      toast.message("Name your web.", {
        description: "A short, sweet project name helps the spider weave.",
      });
      return;
    }
    if(session?.user) {
      createProject.mutate({ value });
    }else{
      localStorage.setItem("value", value);
      signIn();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }
    // Allow normal Enter key to create new lines (default behavior)
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }




  return (
      <main className="relative min-h-dvh overflow-hidden pt-[50px]">
      {/* Theme toggle and Social Links */}
      <div className="fixed right-2 top-2 z-20 sm:right-4 sm:top-4 flex items-center gap-2">
        <div className="hidden sm:flex">
          <SocialLinks />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-full border"
        >
          <span className="text-lg" aria-hidden suppressHydrationWarning>
            {mounted ? (resolvedTheme === "dark" ? "🌞" : "🌙") : "🕷️"}
          </span>
        </Button>
      </div>

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 spider-web opacity-[0.18] dark:opacity-[0.22]" />

      <section className="relative z-10 flex min-h-[calc(100vh-50px)] items-center justify-center">
        <div className="mx-auto w-full max-w-6xl px-2 py-6 sm:px-6 sm:py-10">
          <div className="mx-auto w-full max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-foreground/70 glass">
              <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(239,68,68,0.25)]" />
              Spider builds the web — you claim the site
            </div>

            <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Weave a beautiful website instantly
            </h1>
            <p className="mt-4 text-pretty text-sm text-foreground/70 sm:text-base md:text-lg">
              Describe what you want and let Spider spin it into a
              production-ready site. 
            </p>

            <form onSubmit={onSubmit} className="mt-8 sm:mt-10">
              <div className="mx-auto flex flex-col sm:flex-row max-w-2xl items-center gap-2 sm:gap-3 rounded-xl border bg-card p-2 shadow-sm ring-1 ring-transparent transition focus-within:ring-primary/40 dark:shadow-none">
              <div className="flex flex-col gap-2 w-full">
                <Textarea
                  value={value}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Portfolio for a creative developer"
                  className="min-h-12 max-h-[120px] w-full sm:flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
                  rows={1}
                />
                <div className="flex gap-x-2 items-end justify-between w-full pt-2">
           <div className="text-[10px] text-muted-foreground font-mono">
             <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-sans text-xs font-medium opacity-100">
               <span>&#8984;</span>Enter
             </kbd>
             &nbsp; to submit
           </div>

         </div>

              </div>
                <div>
                  
                </div>
                <Button
                  type="submit"
                  disabled={createProject.isPending}
                  className="h-11 w-full sm:w-auto rounded-lg bg-gradient-to-b from-primary to-rose-500 text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-70 md:mb-8"
                >
                  {createProject.isPending ? "Weaving…" : "Spin the Web"}
                </Button>
              </div>
            </form>

            {/* Predefined prompt chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={createProject.isPending}
                  className="rounded-xl border-foreground/15 bg-card/60 text-foreground/90 hover:bg-card px-3 py-1 h-8 min-w-[140px]"
                  onClick={() => onQuickPrompt(s)}
                  aria-label={s}
                >
                  {s}
                </Button>
              ))}
            </div>


            <AuthButtons />
            
            {/* Mobile Social Links */}
            <div className="flex sm:hidden mt-8 justify-center">
              <MobileSocialLinks />
            </div>
          </div>
        </div>
      </section>

      {/* Subtle corner accents */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-[220px] w-[220px] sm:h-[420px] sm:w-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-[220px] w-[220px] sm:h-[420px] sm:w-[420px] rounded-full bg-rose-500/10 blur-3xl" />
      </main>
  );
}

function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="mt-8 w-full flex justify-center">
        <Button type="button" variant="outline" disabled className="h-11 w-full sm:w-56 rounded-lg">
          Checking session…
        </Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mt-8 w-full flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:w-auto rounded-lg border-primary/30 hover:border-primary/50"
          onClick={() => signIn("google")}
        >
          Continue with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex  flex-col items-center justify-center gap-3 w-full">
      <span className="text-sm text-foreground/70">
        Signed in as {session.user?.name ?? session.user?.email}
      </span>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-[50%] md:w-auto ">
        <Button type="button" className="h-10 w-full sm:w-auto rounded-lg" asChild>
          <Link href="/projects">My Projects</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full sm:w-auto rounded-lg"
          onClick={() => signOut()}
       >
          Sign out
        </Button>
      </div>
    </div>
  );
}

function SocialLinks() {
  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/talha-ansarii", // Replace with your GitHub URL
      icon: Github,
      className: "hover:text-gray-900 dark:hover:text-gray-100"
    },
    {
      name: "LinkedIn", 
      href: "https://linkedin.com/in/talha-ansarii", // Replace with your LinkedIn URL
      icon: Linkedin,
      className: "hover:text-blue-600 dark:hover:text-blue-400"
    },
    {
      name: "Portfolio",
      href: "https://www.talhaansari.in", // Replace with your portfolio URL
      icon: Globe,
      className: "hover:text-green-600 dark:hover:text-green-400"
    }
  ];

  return (
    <div className="flex items-center gap-1">
      {socialLinks.map((link) => {
        const IconComponent = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center rounded-full border border-foreground/20 bg-card/60 p-2 text-foreground/60 transition-all duration-200 hover:border-foreground/40 hover:bg-card hover:scale-105 ${link.className}`}
            aria-label={`Visit my ${link.name}`}
          >
            <IconComponent size={16} />
          </Link>
        );
      })}
    </div>
  );
}

function MobileSocialLinks() {
  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/talha-ansarii",
      icon: Github,
      className: "hover:text-gray-900 dark:hover:text-gray-100"
    },
    {
      name: "LinkedIn", 
      href: "https://linkedin.com/in/talha-ansarii",
      icon: Linkedin,
      className: "hover:text-blue-600 dark:hover:text-blue-400"
    },
    {
      name: "Portfolio",
      href: "https://www.talhaansari.in",
      icon: Globe,
      className: "hover:text-green-600 dark:hover:text-green-400"
    }
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-sm text-foreground/50">Connect with me</span>
      <div className="flex items-center gap-6">
        {socialLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col items-center gap-2 text-foreground/60 transition-all duration-200 hover:scale-110 ${link.className}`}
              aria-label={`Visit my ${link.name}`}
            >
              <div className="flex items-center justify-center rounded-full border border-foreground/20 bg-card/60 p-3 transition-all duration-200 hover:border-foreground/40 hover:bg-card">
                <IconComponent size={20} />
              </div>
              <span className="text-xs font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
