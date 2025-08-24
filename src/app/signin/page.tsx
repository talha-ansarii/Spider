import { redirect } from "next/navigation";
import { signIn } from "@/auth/auth";
import { AuthError } from "next-auth";
import { Button } from "@/components/ui/button";

const SIGNIN_ERROR_URL = "/error";

export default async function SignInPage(props: {
  // In this project, searchParams is modeled as a Promise in PageProps
  // so we await it to get the actual values.
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await props.searchParams;
  return (
    <main className="relative h-dvh overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 spider-web opacity-[0.18] dark:opacity-[0.22]" />

      <section className="relative z-10 h-full">
        <div className="mx-auto grid h-full max-w-6xl place-items-center px-6 py-10">
          <div className="w-full max-w-md rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-foreground/70 glass">
                <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(239,68,68,0.25)]" />
                Welcome back
              </div>
              <h1 className="mt-4 text-2xl font-semibold">Sign in to Spider</h1>
              <p className="mt-2 text-sm text-foreground/65">
                One secure click to start weaving your next site.
              </p>
            </div>

            <div className="mt-6">
              <form
        action={async () => {
                  "use server";
                  try {
                    await signIn("google", {
          redirectTo: sp?.callbackUrl ?? "/",
                    });
                  } catch (error) {
                    if (error instanceof AuthError) {
                      return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`);
                    }
                    throw error;
                  }
                }}
              >
                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-gradient-to-b from-primary to-rose-500 text-primary-foreground shadow-sm transition hover:opacity-95"
                >
                  Continue with Google
                </Button>
              </form>
            </div>

            <p className="mt-4 text-center text-xs text-foreground/60">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </section>

      {/* Subtle corner accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-3xl" />
    </main>
  );
}
