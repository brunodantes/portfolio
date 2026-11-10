import Link from "next/link";
import type { ReactNode } from "react";
import { isExternal } from "@/lib/contact";

type ButtonLinkProps = {
  href: string;
  variant?: "solid" | "outline";
  children: ReactNode;
};

export default function ButtonLink({ href, variant = "solid", children }: ButtonLinkProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-[0.04em] transition-colors";
  const styles =
    variant === "solid"
      ? "bg-accent text-paper hover:bg-accent-strong hover:text-paper"
      : "border border-line-strong text-ink hover:border-accent hover:text-accent";

  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles}`}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
