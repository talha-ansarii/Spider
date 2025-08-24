import Loader from "@/components/ui/loader";

// Global route-level loading state for Next.js App Router.
// Displayed during initial route streaming or suspense boundaries at the root.
export default function Loading() {
  return <Loader fullscreen label="Preparing Spider..." />;
}
