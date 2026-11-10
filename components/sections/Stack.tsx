"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Cloud, Code, Cpu, Database, Layers, Server } from "lucide-react";
import HudPanel from "../ui/HudPanel";
import SectionHeading from "../ui/SectionHeading";
import Tag from "../ui/Tag";
import XpBar from "../ui/XpBar";
import { useContent, usePreferences } from "@/lib/preferences";
import type { StackGroupIcon } from "@/lib/types";

const icons: Record<StackGroupIcon, typeof Server> = {
  server: Server,
  code: Code,
  cloud: Cloud,
  layers: Layers,
  database: Database,
  activity: Activity,
  cpu: Cpu,
};

export default function Stack() {
  const { ui, skills, stack } = useContent();
  const { motion } = usePreferences();
  const t = ui.stack;
  const sheet = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  // As barras enchem quando a ficha entra na tela.
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="stack" className="border-y border-line bg-deep/80 px-page py-section">
      <div className="mx-auto grid max-w-[1200px] gap-14">
        <SectionHeading index="02" title={t.title} lead={t.lead} />

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div ref={sheet}>
            <HudPanel label={t.sheetLabel} right={seen || !motion ? t.sheetSync : t.sheetIdle}>
              <div className="grid gap-5">
                {skills.map((skill) => (
                  <XpBar key={skill.label} {...skill} filled={seen} />
                ))}
              </div>
            </HudPanel>
          </div>

          <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {stack.map((group) => {
              const Icon = icons[group.icon];
              return (
                <li key={group.group} className="grid content-start gap-3 border-t border-line pt-4">
                  <h3 className="flex items-center gap-2.5 text-[15px] font-semibold">
                    <Icon className="size-4 text-accent-text" aria-hidden />
                    {group.group}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
