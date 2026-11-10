import { Mail, MessageCircle } from "lucide-react";
import ButtonLink from "./ButtonLink";
import SectionHeading from "./SectionHeading";
import { whatsappLink } from "@/lib/contact";
import { contact, siteConfig } from "@/lib/site-data";

export default function ContactBlock({ as = "h2" }: { as?: "h1" | "h2" }) {
  const { email, whatsapp } = siteConfig.contact;
  const { whatsappMessage, ...copy } = contact;

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <SectionHeading {...copy} align="center" as={as} />
      <div className="flex flex-wrap justify-center gap-3">
        {whatsapp && (
          <ButtonLink href={whatsappLink(whatsapp, whatsappMessage)}>
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </ButtonLink>
        )}
        {email && (
          <ButtonLink href={`mailto:${email}`} variant={whatsapp ? "outline" : "solid"}>
            <Mail className="size-4" aria-hidden /> {email}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
