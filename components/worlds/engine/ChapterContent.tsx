"use client";

import { useState } from "react";
import { ArrowUpRight, FileDown } from "lucide-react";
import TechIcon from "@/components/ui/TechIcon";
import { useContent } from "@/lib/preferences";
import type { Chapter } from "./chapters";
import type { Skin } from "./skin";

const VISIBLE_BULLETS = 3;

function Bullets({ items, skin }: { items: string[]; skin: Skin }) {
  const { ui } = useContent();
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, VISIBLE_BULLETS);
  return (
    <>
      <ul className="grid gap-2.5">
        {shown.map((item) => (
          <li key={item} className={`flex gap-2.5 ${skin.bullet}`}>
            <span aria-hidden className={skin.marker}>
              {skin.markerChar}
            </span>
            {item}
          </li>
        ))}
      </ul>
      {items.length > VISIBLE_BULLETS && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`justify-self-start ${skin.link}`}>
          {open ? ui.worlds.less : `${ui.worlds.more} (${items.length})`}
        </button>
      )}
    </>
  );
}

/** O conteúdo de um capítulo, igual em todos os mundos; só a aparência (skin) muda. */
export default function ChapterContent({ chapter, index, skin }: { chapter: Chapter; index: number; skin: Skin }) {
  const { player, ui, builds, stats, skills, stack, education } = useContent();
  const number = String(index).padStart(2, "0");

  if (chapter.kind === "intro") {
    return (
      <div className={`grid gap-5 ${skin.panel}`}>
        <p className={skin.kicker}>
          {player.fullName} · {player.role}
        </p>
        <h1 className={skin.hero}>{ui.hero.headline}</h1>
        <p className={skin.body}>{player.summary}</p>
        <p className={skin.sub}>{builds.join(" / ")}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {stats.map((s) => (
            <li key={s.label} className={skin.sub}>
              <strong className={skin.title}>
                {s.value}
                {s.unit ? ` ${s.unit}` : ""}
              </strong>{" "}
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (chapter.kind === "origin") {
    return (
      <div className={`grid gap-5 ${skin.panel}`}>
        <p className={skin.kicker}>{number}</p>
        <h2 className={skin.title}>{ui.worlds.originTitle}</h2>
        <p className={skin.body}>{ui.worlds.originLead}</p>
        <ul className="grid gap-3">
          {[...education].reverse().map((e) => (
            <li key={e.course} className="grid gap-0.5">
              <span className={skin.bullet}>{e.course}</span>
              <span className={skin.sub}>{e.where}</span>
            </li>
          ))}
          <li className={skin.sub}>{ui.about.english}</li>
        </ul>
      </div>
    );
  }

  if (chapter.kind === "job" && chapter.job) {
    const job = chapter.job;
    return (
      <div className={`grid gap-4 ${skin.panel}`}>
        <p className={skin.kicker}>
          {number} · {job.period}
        </p>
        <div className="grid gap-1">
          <h2 className={skin.title}>{job.org}</h2>
          {job.role && <p className={skin.sub}>{job.role}</p>}
        </div>
        <Bullets items={job.bullets} skin={skin} />
        <div className={`flex flex-wrap gap-1.5 pt-1 ${skin.divider}`}>
          {job.stack.map((tech) => (
            <span key={tech.label} className={`inline-flex items-center gap-1.5 ${skin.tag}`}>
              {tech.icon && <TechIcon name={tech.icon} size={12} />}
              {tech.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (chapter.kind === "stack") {
    return (
      <div className={`grid gap-5 ${skin.panel}`}>
        <p className={skin.kicker}>{number}</p>
        <h2 className={skin.title}>{ui.stack.title}</h2>
        <ul className="grid gap-3">
          {skills.map((s) => (
            <li key={s.label} className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className={skin.bullet}>{s.label}</span>
                <span className={skin.sub}>{s.caption}</span>
              </div>
              <div className={`h-1.5 overflow-hidden ${skin.barTrack}`} role="meter" aria-label={s.label} aria-valuenow={s.value} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full ${skin.barFill}`} style={{ width: `${s.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className={`flex flex-wrap gap-1.5 pt-2 ${skin.divider}`}>
          {stack.flatMap((g) => g.items).map((item) => (
            <span key={item} className={skin.tag}>
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const phone = player.phone.replace(/[^\d+]/g, "");
  const channels = [
    { label: ui.contact.channels.linkedin, value: player.linkedin, href: `https://${player.linkedin}` },
    { label: ui.contact.channels.github, value: player.github, href: `https://${player.github}` },
    { label: ui.contact.channels.phone, value: player.phone, href: `tel:${phone}` },
  ];
  return (
    <div className={`grid gap-5 ${skin.panel}`}>
      <p className={skin.kicker}>{number}</p>
      <h2 className={skin.title}>{ui.contact.title}</h2>
      <p className={skin.body}>{ui.contact.lead}</p>
      <ul className="grid gap-1">
        {channels.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`group flex items-center justify-between gap-4 py-2 ${skin.divider}`}
            >
              <span className="grid">
                <span className={skin.sub}>{c.label}</span>
                <span className={skin.bullet}>{c.value}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <a href={player.resumeUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 justify-self-start ${skin.button}`}>
        <FileDown className="size-4" aria-hidden />
        {ui.resumeBtn}
      </a>
    </div>
  );
}
