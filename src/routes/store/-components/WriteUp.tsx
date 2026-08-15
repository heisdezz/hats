import { IconSparkles } from "@tabler/icons-react";

export default function WriteUp() {
  return (
    <section className="container mx-auto px-4 pb-8">
      <div className="bg-base-200/40 rounded-3xl border border-base-200 p-8 sm:p-12 text-center max-w-4xl mx-auto backdrop-blur-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <IconSparkles size={14} /> Artisanal Excellence
        </div>
        <h2 className="text-3xl sm:text-4xl font-logo font-bold text-base-content mb-4">
          Style That Tells Your Story
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-base-content/70 max-w-2xl mx-auto leading-relaxed">
          <p>
            At{" "}
            <span className="text-primary font-bold">Destinys Concept</span>,
            we believe that every headwear piece and accessory is a statement of royalty. From our handcrafted wide-brim hats and church fascinators to our fine coral beads and gold jewelry, each piece is thoughtfully crafted for the modern African woman — bold, elegant, and unapologetically her own.
          </p>
          <p>
            We source only the finest millinery fabrics and work with master Lagos artisans to ensure that every crown, necklace, and piece meets our uncompromising standards of luxury.
          </p>
        </div>
        <div className="divider max-w-xs mx-auto my-6" />
        <p className="text-xs text-base-content/50 font-medium tracking-wide">
          Handcrafted with love · Lagos, Nigeria · Ships Worldwide 🇳🇬
        </p>
      </div>
    </section>
  );
}
