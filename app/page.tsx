import ContactBlock from "@/components/ContactBlock";
import Faq from "@/components/Faq";
import FeatureGrid from "@/components/FeatureGrid";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import { about, faq, faqCopy, features, hero, servicesCopy } from "@/lib/site-data";

export default function Home() {
  return (
    <>
      <Hero content={hero} />

      <Reveal>
        <Section id="sobre" tone="alt">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <SectionHeading eyebrow={about.eyebrow} title={about.title} />
            <div className="flex flex-col gap-5 text-lg leading-[1.7] text-body">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <Section id="servicos">
          <div className="flex flex-col gap-12">
            <SectionHeading {...servicesCopy} />
            <FeatureGrid items={features} />
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <Section id="duvidas" tone="alt">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <SectionHeading {...faqCopy} />
            <Faq items={faq} />
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <Section id="contato">
          <ContactBlock />
        </Section>
      </Reveal>
    </>
  );
}
