"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";


export default  function Page() {

  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

 const [value, setValue] = useState("");

 const trpc = useTRPC();

 const createProject = useMutation(trpc.projects.create.mutationOptions({
   onError : (error) => {
     toast.error(`Error creating project: ${error.message}`);
   },
   onSuccess: (data) => {
     router.push(`/projects/${data.id}`);
   }
 }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) {
      toast.message("Name your web.", {
        description: "A short, sweet project name helps the spider weave.",
      });
      return;
    }
    createProject.mutate({ value });
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
          <span className="text-lg" aria-hidden>
            {resolvedTheme === "dark" ? "🌞" : "🌙"}
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
              Describe what you want and let Spider spin it into a production-ready site.
              Cute in light. Lethal in dark.
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

            <div className="mt-6 text-xs text-foreground/60">
              By continuing you agree to an automated project setup. You can refine later.
            </div>
          </div>

        </div>
      </section>

      {/* Subtle corner accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-3xl" />
    </main>
  );
}
