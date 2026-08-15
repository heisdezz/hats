import { IconShoppingBag, IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const hats = [
  {
    id: "1",
    name: "Ivory Wide-Brim Royal Hat",
    price: "₦28,500",
    badge: "New Arrival",
    src: "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=600&q=80",
  },
  {
    id: "2",
    name: "Classic Straw Fedora",
    price: "₦19,000",
    badge: "Bestseller",
    src: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=600&q=80",
  },
  {
    id: "3",
    name: "Signature Church Hat",
    price: "₦35,000",
    badge: null,
    src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&q=80",
  },
  {
    id: "4",
    name: "Artisanal Woven Boater",
    price: "₦22,000",
    badge: "Limited Edition",
    src: "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&q=80",
  },
  {
    id: "5",
    name: "Luxury Velvet Beret",
    price: "₦14,500",
    badge: null,
    src: "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=600&q=80",
  },
  {
    id: "6",
    name: "Lagos Summer Bucket Hat",
    price: "₦12,000",
    badge: "Trending",
    src: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80",
  },
];

const GridCard = ({
  name,
  price,
  badge,
  src,
}: {
  name: string;
  price: string;
  badge: string | null;
  src: string;
}) => (
  <Link
    to="/store/catalog/hats"
    className="bg-base-100 rounded-xl overflow-hidden border border-base-200 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col"
  >
    <div className="relative overflow-hidden aspect-square bg-base-200">
      <img
        loading="lazy"
        src={src}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {badge && (
        <span className="badge badge-primary badge-xs absolute top-2.5 left-2.5 font-bold shadow-xs">
          {badge}
        </span>
      )}
      <button
        type="button"
        className="btn btn-circle btn-primary btn-xs absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
        title="Add to cart"
      >
        <IconShoppingBag size={12} />
      </button>
    </div>
    <div className="p-3 flex flex-col justify-between flex-1">
      <h3 className="font-semibold text-xs leading-snug truncate text-base-content/90 group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="text-primary font-bold text-xs mt-1">{price}</p>
    </div>
  </Link>
);

export default function HatsGrid() {
  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hats & Millinery</h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Handcrafted headwear designed for weddings, events, and everyday elegance.
          </p>
        </div>
        <Link
          to="/store/catalog/hats"
          className="link link-primary flex items-center gap-1 text-xs font-bold uppercase tracking-wider no-underline hover:underline"
        >
          View all <IconArrowRight size={14} />
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Category banner card */}
        <div className="lg:col-span-5 relative min-h-[420px] rounded-2xl overflow-hidden group cursor-pointer shadow-md">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=800&q=80"
            alt="Hats Collection"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary mb-2">
              <IconSparkles size={14} /> Exclusive Collection
            </span>
            <h3 className="text-3xl font-logo font-bold mb-2">Bespoke Millinery</h3>
            <p className="text-white/80 text-xs mb-6 max-w-xs leading-relaxed">
              Handpicked fascinators and statement hats crafted by master artisans in Lagos.
            </p>
            <Link
              to="/store/catalog/hats"
              className="btn btn-primary btn-sm rounded-full px-6 text-xs font-bold shadow-md"
            >
              Explore Hats Collection
            </Link>
          </div>
        </div>

        {/* Products grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          {hats.map((hat) => (
            <GridCard key={hat.id} {...hat} />
          ))}
        </div>
      </div>
    </section>
  );
}
