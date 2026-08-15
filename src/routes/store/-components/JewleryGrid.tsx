import { IconShoppingBag, IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const jewelry = [
  {
    id: "1",
    name: "Layered Gold Choker Necklace",
    price: "₦32,000",
    badge: "Bestseller",
    src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
  },
  {
    id: "2",
    name: "Baroque Pearl Drop Earrings",
    price: "₦18,500",
    badge: "New",
    src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
  },
  {
    id: "3",
    name: "Traditional Coral Bead Set",
    price: "₦65,000",
    badge: "Luxury",
    src: "https://images.unsplash.com/photo-1611591475116-2d1066735e5d?w=600&q=80",
  },
  {
    id: "4",
    name: "Hammered Gold Cuff Bracelet",
    price: "₦24,000",
    badge: null,
    src: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&q=80",
  },
  {
    id: "5",
    name: "Crystal Statement Ring",
    price: "₦15,000",
    badge: "Trending",
    src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
  },
  {
    id: "6",
    name: "Gold Threaded Anklet",
    price: "₦11,500",
    badge: null,
    src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
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
    to="/store/catalog/jewelry"
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
        <span className="badge badge-secondary badge-xs absolute top-2.5 left-2.5 font-bold shadow-xs">
          {badge}
        </span>
      )}
      <button
        type="button"
        className="btn btn-circle btn-secondary btn-xs absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
        title="Add to cart"
      >
        <IconShoppingBag size={12} />
      </button>
    </div>
    <div className="p-3 flex flex-col justify-between flex-1">
      <h3 className="font-semibold text-xs leading-snug truncate text-base-content/90 group-hover:text-secondary transition-colors">
        {name}
      </h3>
      <p className="text-secondary font-bold text-xs mt-1">{price}</p>
    </div>
  </Link>
);

export default function JewelryGrid() {
  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fine Jewelry & Coral Beads</h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Statement neckpieces, earrings, and traditional African coral beads.
          </p>
        </div>
        <Link
          to="/store/catalog/jewelry"
          className="link link-secondary flex items-center gap-1 text-xs font-bold uppercase tracking-wider no-underline hover:underline"
        >
          View all <IconArrowRight size={14} />
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Products grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start order-2 lg:order-1">
          {jewelry.map((item) => (
            <GridCard key={item.id} {...item} />
          ))}
        </div>

        {/* Category banner card */}
        <div className="lg:col-span-5 relative min-h-[420px] rounded-2xl overflow-hidden group cursor-pointer shadow-md order-1 lg:order-2">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"
            alt="Jewelry Collection"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-secondary mb-2">
              <IconSparkles size={14} /> Traditional Elegance
            </span>
            <h3 className="text-3xl font-logo font-bold mb-2">Coral & Gold Accessories</h3>
            <p className="text-white/80 text-xs mb-6 max-w-xs leading-relaxed">
              Exquisite jewelry crafted to complement traditional attire and modern evening wear.
            </p>
            <Link
              to="/store/catalog/jewelry"
              className="btn btn-secondary btn-sm rounded-full px-6 text-xs font-bold shadow-md"
            >
              Explore Jewelry
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
