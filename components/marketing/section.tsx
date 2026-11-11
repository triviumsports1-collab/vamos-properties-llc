import type { ReactNode } from "react";

const tones = {
  white: "bg-panel text-ink",
  mist: "bg-mist text-ink",
  navy: "bg-navy text-white",
} as const;

export function Section({
  tone = "white",
  children,
  id,
  className = "",
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-24">{children}</div>
    </section>
  );
}
