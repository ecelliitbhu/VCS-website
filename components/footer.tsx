"use client";

import Link from "next/link";
import { Linkedin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import Image from "next/image";

const socials = [
  { href: "https://www.linkedin.com/company/ecelliitbhu/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://www.instagram.com/ecelliitbhu/", label: "Instagram", Icon: Instagram },
  { href: "https://www.facebook.com/ecelliitvaranasi", label: "Facebook", Icon: Facebook },
  { href: "https://twitter.com/ecelliitbhu", label: "Twitter", Icon: Twitter },
  { href: "https://www.youtube.com/channel/UCUme5nNmSKY1GiUBUhlAnOQ", label: "YouTube", Icon: Youtube },
  { href: "https://discord.com/invite/EPm5mfbCKP", label: "Discord", Icon: FaDiscord },
];

const links = [
  { href: "/", label: "Home", external: false },
  { href: "/course", label: "Course", external: false },
  { href: "https://www.ecelliitbhu.com/events/", label: "Events", external: true },
  { href: "https://www.ecelliitbhu.com/gallery/", label: "Gallery", external: true },
  { href: "https://www.ecelliitbhu.com/team/", label: "Team", external: true },
  { href: "https://www.ecelliitbhu.com/contacts/", label: "Contact", external: true },
];

const Label = ({ children }: { children: React.ReactNode }) => (
  <h5 className="mb-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#F86531]">{children}</h5>
);

const Footer = () => {
  return (
    <footer className="relative mt-8 border-t border-white/[0.08] bg-[#091522]/80 px-4 pb-8 pt-14 backdrop-blur-sm md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.2fr]">
          {/* Brand */}
          <div className="space-y-5">
            <Image src="/esummit-logo.webp" alt="IIT BHU E-Summit '27" width={200} height={74} className="h-14 w-auto" />
            <p className="max-w-xs text-sm leading-relaxed text-[#94A3B8]">
              A hands-on venture capital programme. Learn how investors find, test and back startups.
            </p>
          </div>

          {/* Links */}
          <div>
            <Label>Navigate</Label>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="scout-link"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <Label>Contact</Label>
            <address className="space-y-3 text-sm not-italic leading-relaxed text-[#94A3B8]">
              <p>
                Indian Institute of Technology (BHU)
                <br />
                Varanasi, India 221005
              </p>
              <p>
                <a href="mailto:ecell@iitbhu.ac.in" className="scout-link">ecell@iitbhu.ac.in</a>
              </p>
              <p className="font-mono text-xs">+91 9120787959</p>
            </address>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-white/[0.08] text-[#94A3B8] transition-all duration-200 hover:border-[#F86531] hover:text-[#F86531]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <Label>Stay updated</Label>
            <div className="isolate overflow-hidden rounded-[2px] border border-white/[0.08] bg-[#0D2136]/80">
              <iframe
                src="https://ecelliitbhu.substack.com/embed"
                title="E-Cell IIT (BHU) newsletter subscription"
                className="h-[170px] w-full [filter:invert(1)_hue-rotate(180deg)]"
                scrolling="no"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/[0.08] pt-6 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#94A3B8] sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} VC Scout &middot; E-Cell IIT BHU</p>
          <p>A pre-event of E-Summit &rsquo;27</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
