"use client";

import { ShieldCheck } from "lucide-react";
import HudPanel from "../ui/HudPanel";
import SectionHeading from "../ui/SectionHeading";
import Tag from "../ui/Tag";
import { useContent } from "@/lib/preferences";

/** Trajetória: linha do tempo, da experiência atual para a mais antiga. */
export default function Experience() {
  const { ui, experience, education } = useContent();
  const t = ui.about;

  return (
    <section id="trajetoria" className="px-page py-section">
      <div className="mx-auto grid max-w-[1200px] gap-14">
        <SectionHeading index="01" title={t.title} lead={t.lead} />

        <ol className="grid">
          {experience.map((job, index) => (
            <li
              key={job.org}
              className="relative grid gap-3 pb-12 pl-8 last:pb-0 md:grid-cols-[180px_1fr] md:gap-10 md:pl-0"
            >
              {/* Trilho e nó da linha do tempo. */}
              <span
                aria-hidden
                className={`absolute top-2 bottom-0 left-[5px] w-px bg-line-strong md:left-[199px] ${index === experience.length - 1 ? "hidden" : ""}`}
              />
              <span
                aria-hidden
                className={`absolute top-1 left-0 size-[11px] rounded-full border md:left-[194px] ${job.current ? "pulse-dot border-accent bg-accent" : "border-line-bright bg-bg"}`}
              />

              <div className="grid content-start gap-1 md:pt-0.5 md:text-right">
                <span className={`font-mono text-[13px] ${job.current ? "text-accent-text" : "text-muted"}`}>{job.period}</span>
                {job.current && <span className="hud text-accent-text">{t.current}</span>}
              </div>

              <article className="grid gap-4 md:pl-10">
                <header className="grid gap-1">
                  <h3 className="font-display text-[17px] uppercase leading-snug">{job.org}</h3>
                  {job.role && <p className="text-[14px] text-accent-text">{job.role}</p>}
                </header>
                <ul className="grid max-w-[78ch] gap-2.5">
                  {job.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2.5 text-[15px] leading-[1.6] text-body">
                      <span aria-hidden className="font-mono text-accent">▸</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                  {job.stack.map((tech) => (
                    <Tag key={tech.label} icon={tech.icon}>
                      {tech.label}
                    </Tag>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className="max-w-[480px] md:ml-[220px]">
          <HudPanel label={t.education} right="FATEC · ETEC">
            <ul className="grid gap-4">
              {education.map((item) => (
                <li key={item.course} className="grid gap-1">
                  <span className="text-[15px] text-title">{item.course}</span>
                  <span className="font-mono text-[12px] text-muted">{item.where}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-[14px] text-body">
              <ShieldCheck className="size-4 text-signal" aria-hidden />
              {t.english}
            </p>
          </HudPanel>
        </div>
      </div>
    </section>
  );
}
