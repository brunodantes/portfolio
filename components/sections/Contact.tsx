"use client";

import { ArrowUpRight, ExternalLink, FileDown, GitBranch, Phone } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Switch from "../ui/Switch";
import { setPreferences, useContent, usePreferences } from "@/lib/preferences";

export default function Contact() {
  const { ui, player } = useContent();
  const { motion } = usePreferences();
  const t = ui.contact;
  const phone = player.phone.replace(/[^\d+]/g, "");

  const channels = [
    { icon: ExternalLink, label: t.channels.linkedin, hint: t.hints.linkedin, value: player.linkedin, href: `https://${player.linkedin}`, external: true },
    { icon: GitBranch, label: t.channels.github, hint: t.hints.github, value: player.github, href: `https://${player.github}`, external: true },
    { icon: Phone, label: t.channels.phone, hint: t.hints.phone, value: player.phone, href: `tel:${phone}`, external: false },
    { icon: FileDown, label: t.channels.resume, hint: t.hints.resume, value: "PDF", href: player.resumeUrl, external: true },
  ];

  return (
    <section id="contato" className="px-page py-section">
      <div className="mx-auto grid max-w-[1200px] gap-14">
        <SectionHeading index="03" title={t.title} lead={t.lead} />

        <ul className="grid border-t border-line">
          {channels.map(({ icon: Icon, ...channel }) => (
            <li key={channel.label} className="border-b border-line">
              <a
                href={channel.href}
                {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-6 transition-colors sm:grid-cols-[auto_200px_1fr_auto]"
              >
                <Icon className="size-5 text-accent-text" aria-hidden />
                <span className="text-[15px] font-semibold text-title">{channel.label}</span>
                <span className="col-start-2 row-start-2 text-[14px] text-muted sm:col-start-auto sm:row-start-auto">
                  <span className="block break-all font-mono text-[15px] text-body transition-colors group-hover:text-accent-text sm:text-[17px]">
                    {channel.value}
                  </span>
                  {channel.hint}
                </span>
                <ArrowUpRight
                  className="col-start-3 row-span-2 row-start-1 size-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text sm:col-start-auto sm:row-span-1 sm:row-start-auto"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>

        <Switch checked={motion} onChange={(value) => setPreferences({ motion: value })} label={t.motion} />
      </div>
    </section>
  );
}
