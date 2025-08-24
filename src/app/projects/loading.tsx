import Loader from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <Loader label="Loading projects..." />
    </div>
  );
}
