import Image from "next/image";
import ButtonLink from "./ButtonLink";
import Placeholder from "./Placeholder";
import type { HeroContent } from "@/lib/types";

export default function Hero({ content }: { content: HeroContent }) {
  const { eyebrow, titleStart, titleEm, titleEnd, lead, primaryCta, secondaryCta, image } = content;

  return (
    <section className="px-6 pt-14 pb-16 md:px-12 md:pt-24 md:pb-26">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div className="flex flex-col gap-7">
          <span className="text-sm font-medium text-eyebrow">
            {eyebrow}
          </span>
          <h1 className="font-display text-[44px] leading-[1.04] md:text-[68px]">
            {titleStart} {titleEm && <em className="text-accent">{titleEm}</em>} {titleEnd}
          </h1>
          <p className="max-w-[48ch] text-lg leading-[1.65] text-body">{lead}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={primaryCta.href}>{primaryCta.label}</ButtonLink>
            {secondaryCta && (
              <ButtonLink href={secondaryCta.href} variant="outline">
                {secondaryCta.label}
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full max-w-[460px] justify-self-center overflow-hidden rounded-[28px]">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 768px) 460px, 100vw"
              className="object-cover"
            />
          ) : (
            <Placeholder label="Imagem principal" className="size-full" />
          )}
        </div>
      </div>
    </section>
  );
}
