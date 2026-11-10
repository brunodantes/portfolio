import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Feature } from "@/lib/types";

export default function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-6">
      {items.map((item, index) => (
        <article
          key={item.title}
          className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface p-7"
        >
          <span className="font-display text-2xl text-highlight">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-[24px] leading-[1.2]">{item.title}</h3>
          <p className="leading-[1.6] text-body">{item.description}</p>
          {item.href && (
            <Link
              href={item.href}
              className="mt-auto inline-flex items-center gap-1 pt-2 text-sm hover:text-highlight"
            >
              Saiba mais <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
