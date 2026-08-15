import { IconScissors, IconPalette, IconRuler, IconMessageCircle } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const perks = [
  { icon: IconScissors, label: "Handcrafted to order by Lagos master milliners" },
  { icon: IconPalette, label: "Custom color matching & premium fabric selection" },
  { icon: IconRuler, label: "Precision head sizing & custom wrist fit" },
];

export default function CustomMade() {
  return (
    <section className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden border border-base-200 shadow-md">
        {/* Image */}
        <div className="relative h-80 lg:h-auto min-h-80 group">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
            alt="Artisan crafting a custom hat"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white max-w-xs">
            <span className="badge badge-accent badge-sm font-bold mb-2">Bespoke Studio</span>
            <h4 className="text-xl font-bold font-logo">Crafted for your Royal Moments</h4>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center gap-6 p-8 lg:p-12 bg-base-200/60 backdrop-blur-sm">
          <div>
            <span className="badge badge-primary badge-sm font-bold uppercase tracking-wider mb-3">
              Bespoke Custom Orders
            </span>
            <h2 className="text-3xl font-bold leading-tight mb-3">
              Need something <br className="hidden lg:block" /> uniquely yours?
            </h2>
            <p className="text-base-content/70 text-xs sm:text-sm leading-relaxed max-w-md">
              We specialise in bespoke hats, church fascinators, and bridal jewelry sets crafted to your exact taste and event outfit color palette.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {perks.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                <span className="bg-primary/10 text-primary rounded-full p-2 shrink-0">
                  <Icon size={16} />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/store/catalog"
              className="btn btn-primary rounded-full px-8 text-xs font-bold gap-2 shadow-md"
            >
              <IconMessageCircle size={16} />
              Book Bespoke Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
