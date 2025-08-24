import Image from "next/image";
import React from "react";

type LoaderProps = {
  label?: string;
  size?: number; // logo size in px
  fullscreen?: boolean; // covers entire screen
  className?: string;
};

/**
 * Loader — branded spinner with the Spider logo.
 * - Works in Server and Client Components (no hooks).
 * - Respects theme colors via Tailwind CSS variables.
 */
export function Loader({ label, size = 56, fullscreen, className }: LoaderProps) {
  const ring = size + 28; // outer ring is a bit larger than the logo

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className={
        (
          fullscreen
            ? "fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm"
            : "inline-flex items-center justify-center"
        ) + (className ? ` ${className}` : "")
      }
      aria-busy="true"
      role="status"
    >
      {children}
    </div>
  );

  return (
    <Wrapper>
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative"
          style={{ width: ring, height: ring }}
        >
          {/* spinning ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-muted border-t-primary animate-spin"
            style={{ animationDuration: "1100ms" }}
          />
          {/* inner glow */}
          <div className="absolute inset-2 rounded-full bg-primary/5 blur-[1px]" />
          {/* logo */}
          <div className="absolute inset-0 grid place-items-center">
            <Image
              src="/logo.svg"
              alt="Spider"
              width={size}
              height={size}
              priority
            />
          </div>
        </div>
        {label ? (
          <span className="text-sm text-muted-foreground select-none">{label}</span>
        ) : null}
      </div>
    </Wrapper>
  );
}

export default Loader;
