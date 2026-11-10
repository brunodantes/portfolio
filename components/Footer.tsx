import Link from "next/link";
import { navLinks, siteConfig, socialLinks } from "@/lib/site-data";

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6">
        <span className="font-display text-lg">{siteConfig.name}</span>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-6 text-sm">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-soft hover:text-accent">
              {link.label}
            </Link>
          ))}
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-soft hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <span className="text-[13px] text-soft">
          © {new Date().getFullYear()} {siteConfig.name}
        </span>
      </div>
    </footer>
  );
}
