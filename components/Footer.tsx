"use client";

import { useContent } from "@/lib/preferences";

export default function Footer() {
  const { player } = useContent();
  return (
    <footer className="border-t border-line bg-deep px-page py-8">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 text-[13px] text-muted">
        <span className="font-display text-[12px] uppercase text-title">{player.name}</span>
        <span>
          {player.city} · © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
