import { IconShoppingBag, IconArrowRight } from "@tabler/icons-react";

const hats = [
  {
    id: "1",
    name: "Ivory Wide-Brim Hat",
    price: "₦28,500",
    badge: "New",
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
    name: "Black Church Hat",
    price: "₦35,000",
    badge: null,
    src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&q=80",
  },
  {
    id: "4",
    name: "Woven Boater Hat",
    price: "₦22,000",
    badge: "Limited",
    src: "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=600&q=80",
  },
  {
    id: "5",
    name: "Velvet Beret",
    price: "₦14,500",
    badge: null,
    src: "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=600&q=80",
  },
  {
    id: "6",
    name: "Summer Bucket Hat",
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
  <div className=" fade rounded-xl overflow-hidden group cursor-pointer">
    <div className="relative overflow-hidden">
      <img
        loading="lazy"
        src={src}
        alt={name}
        className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {badge && (
        <span className="badge badge-primary badge-xs absolute top-2 left-2">
          {badge}
        </span>
      )}
      <button className="btn btn-circle btn-accent btn-xs absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <IconShoppingBag size={12} />
      </button>
    </div>
    <div className="p-2">
      <h3 className="font-semibold text-xs leading-tight truncate">{name}</h3>
      <p className="text-primary font-bold text-xs">{price}</p>
    </div>
  </div>
);

export default function HatsGrid() {
  return (
    <section className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Hats</h2>
        <a className="link link-primary flex items-center gap-1 text-sm">
          View all <IconArrowRight size={14} />
        </a>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Category preview card */}
        <div className="relative h-[520px] rounded-2xl overflow-hidden group cursor-pointer">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=800&q=80"
            alt="Hats Collection"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <p className="text-sm uppercase tracking-widest text-white/70 mb-1">
              Collection
            </p>
            <h3 className="text-3xl font-bold mb-2">Women's Hats</h3>
            <p className="text-white/70 text-sm mb-4 max-w-xs">
              Handpicked styles for every occasion — from casual to couture.
            </p>
            <button className="btn btn-accent btn-sm rounded-full px-6">
              Shop Now
            </button>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-3 gap-3 content-start">
          {hats.map((hat) => (
            <GridCard key={hat.id} {...hat} />
          ))}
        </div>
      </div>
    </section>
  );
}
