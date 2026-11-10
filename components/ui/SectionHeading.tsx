type SectionHeadingProps = { index: string; title: string; lead?: string };

/** Título de seção. O índice é a posição real da seção na página. */
export default function SectionHeading({ index, title, lead }: SectionHeadingProps) {
  return (
    <header className="grid max-w-[64ch] gap-4">
      <div className="flex items-center gap-3 font-mono text-[12px] text-faint">
        <span>{index}</span>
        <span className="h-px w-9 bg-line-bright" aria-hidden />
      </div>
      <h2 className="font-display text-[26px] uppercase leading-[1.15] md:text-[34px]">{title}</h2>
      {lead && <p className="text-[17px] leading-[1.6] text-muted">{lead}</p>}
    </header>
  );
}
