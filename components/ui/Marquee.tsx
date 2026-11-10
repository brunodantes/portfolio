/** Faixa de tecnologias rolando. Decorativa: a lista completa está na seção Stack. */
export default function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div aria-hidden className="overflow-hidden border-y border-line bg-deep">
      <div className="marquee-track flex w-max gap-6 py-2.5">
        {row.map((item, index) => (
          <span key={index} className="hud inline-flex items-center gap-6 whitespace-nowrap text-muted">
            {item}
            <span className="text-accent">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
