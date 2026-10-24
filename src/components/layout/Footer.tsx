import Link from "next/link";
import { Mail, Phone, MapPin, Share2, MessageCircle, PlayCircle } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Find My Kit", href: "/find-kit" },
    { label: "Universities", href: "/universities" },
    { label: "All Packages", href: "/packages" },
    { label: "Individual Products", href: "/products" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Order Tracking", href: "/track" },
    { label: "Returns & Refunds", href: "/returns" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Partners", href: "/partners" },
  ],
};

const universities = [
  "Cairo University",
  "Ain Shams University",
  "Alexandria University",
  "Future University Egypt",
  "Misr International University",
];

export function Footer() {
  return (
    <footer className="bg-[#0A2540] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#00B4D8] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
                  <path d="M8 6c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2H8z" fill="currentColor" opacity="0.7" />
                </svg>
              </div>
              <div>
                <span className="font-display font-bold text-xl leading-none">DentalKit</span>
                <span className="block text-[11px] text-[#00B4D8] tracking-widest uppercase leading-none">Egypt</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              Egypt's first dedicated marketplace for dental students. Get the exact equipment packages required by your university.
            </p>
            <div className="space-y-2.5">
              <a href="mailto:hello@dentalkit.eg" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#00B4D8] transition-colors cursor-pointer">
                <Mail size={14} />
                hello@dentalkit.eg
              </a>
              <a href="tel:+201234567890" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#00B4D8] transition-colors cursor-pointer">
                <Phone size={14} />
                +20 123 456 7890
              </a>
              <span className="flex items-center gap-2.5 text-sm text-white/60">
                <MapPin size={14} />
                Cairo, Egypt
              </span>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Share2, href: "#", label: "Instagram" },
                { Icon: MessageCircle, href: "#", label: "Facebook" },
                { Icon: PlayCircle, href: "#", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#00B4D8] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-sm tracking-wide uppercase text-[#00B4D8] mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm tracking-wide uppercase text-[#00B4D8] mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm tracking-wide uppercase text-[#00B4D8] mb-4">Universities</h4>
            <ul className="space-y-2.5">
              {universities.map((uni) => (
                <li key={uni}>
                  <span className="text-sm text-white/60">{uni}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} DentalKit Egypt. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-xs text-white/40 hover:text-white/70 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
