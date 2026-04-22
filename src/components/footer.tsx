import { IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";
import {
  IconBrandInstagram,
  IconBrandX,
  IconBrandFacebook,
} from "@tabler/icons-react";

const links = {
  shop: [
    { label: "All Hats", href: "/hats" },
    { label: "All Jewelry", href: "/jewelry" },
    { label: "New Arrivals", href: "/" },
    { label: "Bestsellers", href: "/" },
    { label: "Custom Orders", href: "/" },
  ],
  help: [
    { label: "FAQ", href: "/" },
    { label: "Shipping & Returns", href: "/" },
    { label: "Track Order", href: "/" },
    { label: "Size Guide", href: "/" },
    { label: "Contact Us", href: "/" },
  ],
};

const socials = [
  { icon: IconBrandInstagram, href: "/", label: "Instagram" },
  { icon: IconBrandX, href: "/", label: "Twitter" },
  { icon: IconBrandFacebook, href: "/", label: "Facebook" },
];

export const Footer = () => {
  return (
    <footer className="bg-base-200 mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-logo font-bold">Destinys Concept</h3>
          <p className="text-sm text-base-content/60 leading-relaxed">
            Handcrafted hats and jewelry for the modern African woman. Style,
            elegance, and quality — delivered to your door.
          </p>
          <div className="flex gap-3 mt-1">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="btn btn-circle btn-ghost btn-sm ring fade"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Shop</h4>
          <ul className="flex flex-col gap-2">
            {links.shop.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm text-base-content/60 hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Help links */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Help</h4>
          <ul className="flex flex-col gap-2">
            {links.help.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm text-base-content/60 hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Contact</h4>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-2 text-sm text-base-content/60">
              <IconMapPin size={14} className="mt-0.5 shrink-0 text-primary" />
              Lagos, Nigeria
            </li>
            <li className="flex items-center gap-2 text-sm text-base-content/60">
              <IconPhone size={14} className="shrink-0 text-primary" />
              +234 800 000 0000
            </li>
            <li className="flex items-center gap-2 text-sm text-base-content/60">
              <IconMail size={14} className="shrink-0 text-primary" />
              hello@destinysconcept.ng
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-base-300">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-base-content/40">
          <span>
            © {new Date().getFullYear()} Destinys Concept. All rights reserved.
          </span>
          <span>Built with care in Lagos 🇳🇬</span>
        </div>
      </div>
    </footer>
  );
};
