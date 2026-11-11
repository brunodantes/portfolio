"use client";

import { useState } from "react";
import { ArrowDown, ArrowUpRight, Check, FileDown, Target } from "lucide-react";
import TechIcon from "@/components/ui/TechIcon";
import { useContent } from "@/lib/preferences";
import type { Chapter } from "./chapters";
import type { Skin } from "./skin";

const VISIBLE = 3;

/** Objetivos cumpridos (os bullets da experiência): 3 visíveis, o resto sob "Ver tudo". */
function Objectives({ items, skin }: { items: string[]; skin: Skin }) {
  const { ui } = useContent();
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, VISIBLE);
  return (
    <div className="grid gap-2">
      <p className={skin.sub}>{ui.op.objectives}</p>
      <ul className="grid gap-2">
        {shown.map((item) => (
          <li key={item} className={`flex gap-2.5 ${skin.bullet}`}>
            <Check aria-hidden className={`mt-1 size-3.5 shrink-0 ${skin.check ?? ""}`} strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
      {items.length > VISIBLE && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`justify-self-start ${skin.link}`}>
          {open ? ui.less : `${ui.more} (${items.length})`}
        </button>
      )}
    </div>
  );
}

/** Resultados (conquistas) da operação. */
function Results({ items, skin }: { items: string[]; skin: Skin }) {
  const { ui } = useContent();
  return (
    <div className="grid gap-2">
      <p className={skin.sub}>{ui.op.results}</p>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((a) => (
          <li key={a} className={`inline-flex items-center gap-1.5 ${skin.badge ?? skin.tag}`}>
            <Target aria-hidden className="size-3.5 shrink-0" />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}

type GameChapterProps = { chapter: Chapter; skin: Skin; code: string };

/** Capítulo: briefing (perfil e formação), operações (empresas), capacidades e contato. */
export default function GameChapter({ chapter, skin, code }: GameChapterProps) {
  const { player, ui, builds, stats, skills, stack, education } = useContent();

  if (chapter.kind === "intro") {
    return (
      <div className={`grid gap-5 ${skin.panel}`}>
        <p className={skin.kicker}>
          {ui.briefing.kicker} · {player.level}
        </p>
        <div className="grid gap-1.5">
          <p className={skin.sub}>
            {player.fullName} · {player.role}
          </p>
          <h1 className={skin.hero}>{ui.headline}</h1>
        </div>
        <p className={skin.body}>{player.summary}</p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`grid gap-0.5 pt-2 ${skin.divider}`}>
              <dt className={skin.sub}>{s.label}</dt>
              <dd className={skin.title}>
                {s.value}
                {s.unit ? <span className={skin.sub}> {s.unit}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-1">
          <p className={skin.sub}>{ui.briefing.specialties}</p>
          <p className={skin.bullet}>{builds.join(" · ")}</p>
        </div>
        <div className="grid gap-1">
          <p className={skin.sub}>{ui.briefing.education}</p>
          {education.map((e) => (
            <p key={e.course} className={skin.bullet}>
              {e.course} · {e.where}
            </p>
          ))}
          <p className={skin.bullet}>{ui.briefing.english}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="#job-0" className={`inline-flex items-center gap-2 ${skin.button}`}>
            {ui.briefing.ctaPrimary}
            <ArrowDown className="size-4" aria-hidden />
          </a>
          <a href={player.resumeUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${skin.link}`}>
            <FileDown className="size-4" aria-hidden />
            {ui.briefing.ctaResume}
          </a>
        </div>
      </div>
    );
  }

  if (chapter.kind === "job" && chapter.job) {
    const job = chapter.job;
    return (
      <div className={`grid gap-4 ${skin.panel}`}>
        <p className={skin.kicker}>
          {code} · {job.current ? ui.op.active : ui.op.done} · LV {String(job.level).padStart(2, "0")}
        </p>
        <div className="grid gap-1">
          <h2 className={skin.title}>{job.org}</h2>
          <p className={skin.sub}>
            {job.role ? `${job.role} · ` : ""}
            {job.period}
          </p>
        </div>
        <Objectives items={job.bullets} skin={skin} />
        <Results items={job.achievements} skin={skin} />
        <div className="grid gap-2">
          <p className={skin.sub}>{ui.op.gear}</p>
          <div className="flex flex-wrap gap-1.5">
            {job.stack.map((tech) => (
              <span key={tech.label} className={`inline-flex items-center gap-1.5 ${skin.tag}`}>
                {tech.icon && <TechIcon name={tech.icon} size={12} />}
                {tech.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (chapter.kind === "stack") {
    return (
      <div className={`grid gap-5 ${skin.panel}`}>
        <p className={skin.kicker}>
          {ui.skills.kicker} · {player.level}
        </p>
        <div className="grid gap-1.5">
          <h2 className={skin.title}>{ui.skills.title}</h2>
          <p className={skin.body}>{ui.skills.lead}</p>
        </div>
        <ul className="grid gap-3">
          {skills.map((s) => (
            <li key={s.label} className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className={skin.bullet}>{s.label}</span>
                <span className={skin.sub}>
                  Lv {s.value} · {s.caption}
                </span>
              </div>
              <div
                className={`h-1.5 overflow-hidden ${skin.barTrack}`}
                role="meter"
                aria-label={s.label}
                aria-valuenow={s.value}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={`h-full ${skin.barFill}`} style={{ width: `${s.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className={`flex flex-wrap gap-1.5 pt-2 ${skin.divider}`}>
          {stack
            .flatMap((group) => group.items)
            .map((item) => (
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
    { label: ui.contact.github, value: player.github, href: `https://${player.github}` },
    { label: ui.contact.phone, value: player.phone, href: `tel:${phone}` },
    { label: ui.contact.resume, value: "PDF", href: player.resumeUrl },
  ];
  return (
    <div className={`grid gap-5 ${skin.panel}`}>
      <p className={skin.kicker}>
        {code} · {ui.contact.kicker}
      </p>
      <h2 className={skin.title}>{ui.contact.title}</h2>
      <p className={skin.body}>{ui.contact.lead}</p>
      <a
        href={`https://${player.linkedin}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 justify-self-start ${skin.button}`}
      >
        {ui.contact.cta}
        <ArrowUpRight className="size-4" aria-hidden />
      </a>
      <ul className="grid gap-1">
        {channels.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              {...(c.href.startsWith("tel:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
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
      <p className={skin.sub}>{player.city}</p>
    </div>
  );
}
