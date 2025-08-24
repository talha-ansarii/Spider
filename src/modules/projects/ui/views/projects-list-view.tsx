"use client";

import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CalendarIcon, FolderIcon, PlusIcon, SearchIcon, SunIcon, MoonIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import Loader from "@/components/ui/loader";

const PER_PAGE = 12;

export default function ProjectsListView() {
  const trpc = useTRPC();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data, isLoading, isFetching } = useQuery(
    trpc.projects.getManyByUserId.queryOptions({ query, page, perPage: PER_PAGE })
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleNewProject = () => {
    // Use the home flow to gather the prompt and create the project
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="container mx-auto max-w-6xl py-10">
      {/* Top header: brand + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90">
          <Image src="/logo.svg" alt="Spider" width={28} height={28} />
          <span className="text-lg font-semibold">Spider</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
            title={mounted ? (resolvedTheme === "dark" ? "Switch to light" : "Switch to dark") : "Toggle theme"}
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )
            ) : (
              // Placeholder to keep consistent markup until mounted
              <span className="block h-4 w-4" aria-hidden />
            )}
          </Button>
          <Button onClick={handleNewProject}>
            <PlusIcon className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>



      <form onSubmit={handleSearch} className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects by name..."
          className="pl-9"
        />
      </form>

      {isLoading ? (
        <div className="py-16 grid place-items-center">
          <Loader label="Loading projects..." />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderIcon className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No projects found{query ? ` for "${query}"` : ""}.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="group">
              <Card className={cn("transition-colors hover:border-primary/50") }>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base truncate">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FolderIcon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{p.name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <CalendarIcon className="h-3 w-3" /> Updated {format(new Date(p.updatedAt), "MMM dd, yyyy")}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="px-0 group-hover:text-primary">
                    Open project
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={cn({ "pointer-events-none opacity-50": page <= 1 })}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const pageNum = i + Math.max(1, Math.min(page - 2, totalPages - 4));
              if (pageNum > totalPages) return null;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={pageNum === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className={cn({ "pointer-events-none opacity-50": page >= totalPages })}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {(isFetching && !isLoading) && (
        <div className="text-center text-xs text-muted-foreground mt-2">Updating…</div>
      )}
    </div>
  );
}
