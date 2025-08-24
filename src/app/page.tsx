"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";


export default  function Page() {
  const { data: session } = useSession();

  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

 const [value, setValue] = useState(localStorage.getItem("value") || "");
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
   setMounted(true);
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
    const value = localStorage.getItem("value");
    localStorage.removeItem("value");
    if (value) {
      createProject.mutate({ value });
    }
  }, [createProject]);

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




  return (
      <main className="relative h-dvh overflow-hidden">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-20">
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

      <section className="relative z-10 h-full">
        <div className="mx-auto grid h-full max-w-6xl place-items-center px-6 py-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-foreground/70 glass">
              <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(239,68,68,0.25)]" />
              Spider builds the web — you claim the site
            </div>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Weave a beautiful website instantly
            </h1>
            <p className="mt-4 text-pretty text-base text-foreground/70 sm:text-lg">
              Describe what you want and let Spider spin it into a
              production-ready site. 
            </p>

            <form onSubmit={onSubmit} className="mt-10">
              <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border bg-card p-2 shadow-sm ring-1 ring-transparent transition focus-within:ring-primary/40 dark:shadow-none">
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. Portfolio for a creative developer"
                  className="h-12 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  disabled={createProject.isPending}
                  className="h-11 rounded-lg bg-gradient-to-b from-primary to-rose-500 text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-70"
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
                  className="rounded-xl border-foreground/15 bg-card/60 text-foreground/90 hover:bg-card px-3 py-1 h-8"
                  onClick={() => onQuickPrompt(s)}
                  aria-label={s}
                >
                  {s}
                </Button>
              ))}
            </div>


            <AuthButtons />
          </div>
        </div>
      </section>

      {/* Subtle corner accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-3xl" />
      </main>
  );
}

function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="mt-8">
        <Button type="button" variant="outline" disabled className="h-11 w-56 rounded-lg">
          Checking session…
        </Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mt-8">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-lg border-primary/30 hover:border-primary/50"
          onClick={() => signIn("google")}
        >
          Continue with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col mb-[-50px] items-center justify-center gap-3">
      <span className="text-sm text-foreground/70">
        Signed in as {session.user?.name ?? session.user?.email}
      </span>
      <div className="flex items-center gap-3">
        <Button type="button" className="h-10 rounded-lg" asChild>
          <Link href="/projects">My Projects</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg"
          onClick={() => signOut()}
       >
          Sign out
        </Button>
      </div>
    </div>
  );
}
