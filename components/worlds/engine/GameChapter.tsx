"use client";

import { useState } from "react";
import { ArrowUpRight, Check, FileDown, Trophy } from "lucide-react";
import TechIcon from "@/components/ui/TechIcon";
import { useContent } from "@/lib/preferences";
import type { Chapter } from "./chapters";
import type { Skin } from "./skin";

const VISIBLE = 3;

/** Objetivos da missão (os bullets da experiência), todos concluídos. */
function Objectives({ items, skin }: { items: string[]; skin: Skin }) {
  const { ui } = useContent();
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, VISIBLE);
  return (
    <div className="grid gap-2">
      <p className={skin.sub}>{ui.game.objectives}</p>
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
          {open ? ui.worlds.less : `${ui.worlds.more} (${items.length})`}
        </button>
      )}
    </div>
  );
}

function Badges({ items, skin }: { items: string[]; skin: Skin }) {
  const { ui } = useContent();
  return (
    <div className="grid gap-2">
      <p className={skin.sub}>{ui.game.achievements}</p>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((a) => (
          <li key={a} className={`inline-flex items-center gap-1.5 ${skin.badge ?? skin.tag}`}>
            <Trophy aria-hidden className="size-3.5 shrink-0" />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Capítulo em formato de jogo: perfil, tutorial, missões, árvore de habilidades e nova missão. */
export default function GameChapter({ chapter, index, skin }: { chapter: Chapter; index: number; skin: Skin }) {
  const { player, ui, builds, stats, skills, stack, education } = useContent();
  const g = ui.game;

  if (chapter.kind === "intro") {
    return (
      <div className={`grid gap-5 ${skin.panel}`}>
        <p className={skin.kicker}>
          {g.player} · {player.level}
        </p>
        <div className="grid gap-1">
          <p className={skin.sub}>{player.fullName}</p>
          <h1 className={skin.hero}>{ui.hero.headline}</h1>
        </div>
        <p className={skin.body}>{player.summary}</p>
        <dl className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`grid gap-0.5 ${skin.divider} pt-2`}>
              <dt className={skin.sub}>{s.label}</dt>
              <dd className={skin.title}>
                {s.value}
                {s.unit ? <span className={skin.sub}> {s.unit}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className={skin.sub}>{builds.join(" / ")}</p>
        <p className={skin.link}>{g.start} ↓</p>
      </div>
    );
  }

  if (chapter.kind === "origin") {
    return (
      <div className={`grid gap-5 ${skin.panel}`}>
        <p className={skin.kicker}>
          {g.tutorial} · LV 01
        </p>
        <h2 className={skin.title}>{ui.worlds.originTitle}</h2>
        <p className={skin.body}>{ui.worlds.originLead}</p>
        <Objectives items={[...education].reverse().map((e) => `${e.course} · ${e.where}`)} skin={skin} />
        <Badges items={[ui.about.english]} skin={skin} />
      </div>
    );
  }

  if (chapter.kind === "job" && chapter.job) {
    const job = chapter.job;
    const mission = String(index - 1).padStart(2, "0");
    return (
      <div className={`grid gap-4 ${skin.panel}`}>
        <p className={skin.kicker}>
          {g.mission} {mission} · {job.current ? g.active : g.done} · LV {String(job.level).padStart(2, "0")}
        </p>
        <div className="grid gap-1">
          <h2 className={skin.title}>{job.org}</h2>
          <p className={skin.sub}>
            {job.role ? `${job.role} · ` : ""}
            {job.period}
          </p>
        </div>
        <Objectives items={job.bullets} skin={skin} />
        <Badges items={job.achievements} skin={skin} />
        <div className="grid gap-2">
          <p className={skin.sub}>{g.gear}</p>
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
        <p className={skin.kicker}>{player.level}</p>
        <h2 className={skin.title}>{g.skillTree}</h2>
        <ul className="grid gap-3">
          {skills.map((s) => (
            <li key={s.label} className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className={skin.bullet}>{s.label}</span>
                <span className={skin.sub}>Lv {s.value} · {s.caption}</span>
              </div>
              <div className={`h-1.5 overflow-hidden ${skin.barTrack}`} role="meter" aria-label={s.label} aria-valuenow={s.value} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full ${skin.barFill}`} style={{ width: `${s.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className={`flex flex-wrap gap-1.5 pt-2 ${skin.divider}`}>
          {stack.flatMap((group) => group.items).map((item) => (
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
    { label: ui.contact.channels.github, value: player.github, href: `https://${player.github}` },
    { label: ui.contact.channels.phone, value: player.phone, href: `tel:${phone}` },
  ];
  return (
    <div className={`grid gap-5 ${skin.panel}`}>
      <p className={skin.kicker}>{g.newMission}</p>
      <h2 className={skin.title}>{ui.contact.title}</h2>
      <p className={skin.body}>{ui.contact.lead}</p>
      <a
        href={`https://${player.linkedin}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 justify-self-start ${skin.button}`}
      >
        {g.accept}
        <ArrowUpRight className="size-4" aria-hidden />
      </a>
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
              <ArrowUpRight className="size-4 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <a href={player.resumeUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${skin.link}`}>
        <FileDown className="size-4" aria-hidden />
        {ui.resumeBtn} (PDF)
      </a>
    </div>
  );
}
