import { IconScissors, IconPalette, IconRuler, IconMessageCircle } from "@tabler/icons-react";

const perks = [
  { icon: IconScissors, label: "Handcrafted to order" },
  { icon: IconPalette, label: "Choose your colours & materials" },
  { icon: IconRuler, label: "Perfect fit, every time" },
];

export default function CustomMade() {
  return (
    <section className="container mx-auto">
      <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden ring fade">
        {/* Image */}
        <div className="relative h-80 lg:h-auto min-h-72">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
            alt="Artisan crafting a custom hat"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center gap-6 p-10 bg-base-200">
          <div>
            <span className="badge badge-primary mb-3">Custom Orders</span>
            <h2 className="text-3xl font-bold leading-tight mb-3">
              Need something <br className="hidden lg:block" /> uniquely yours?
            </h2>
            <p className="text-base-content/60 text-sm leading-relaxed max-w-sm">
              We specialise in bespoke hats and jewelry crafted to your exact
              taste. Whether it's a wedding fascinator or a one-of-a-kind
              statement piece — we bring your vision to life.
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {perks.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className="bg-primary/10 text-primary rounded-full p-1.5">
                  <Icon size={14} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <button className="btn btn-accent rounded-full w-fit px-8 gap-2">
            <IconMessageCircle size={16} />
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}
