import { IconShoppingBag, IconArrowRight } from "@tabler/icons-react";

const jewelry = [
  {
    id: "1",
    name: "Gold Layered Necklace",
    price: "₦18,000",
    badge: "New",
    src: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80",
  },
  {
    id: "2",
    name: "Pearl Drop Earrings",
    price: "₦11,500",
    badge: "Bestseller",
    src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
  },
  {
    id: "3",
    name: "Rose Gold Bracelet",
    price: "₦14,000",
    badge: null,
    src: "https://images.unsplash.com/photo-1573408301185-9519f94715f6?w=600&q=80",
  },
  {
    id: "4",
    name: "Diamond-Cut Ring",
    price: "₦22,500",
    badge: "Limited",
    src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
  },
  {
    id: "5",
    name: "Dainty Anklet Chain",
    price: "₦8,500",
    badge: null,
    src: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80",
  },
  {
    id: "6",
    name: "Floral Brooch Pin",
    price: "₦9,000",
    badge: "Trending",
    src: "https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=600&q=80",
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

export default function JewelryGrid() {
  return (
    <section className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Jewelry</h2>
        <a className="link link-primary flex items-center gap-1 text-sm">
          View all <IconArrowRight size={14} />
        </a>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Products grid */}
        <div className="grid grid-cols-3 gap-3 content-start">
          {jewelry.map((item) => (
            <GridCard key={item.id} {...item} />
          ))}
        </div>

        {/* Category preview card */}
        <div className="relative h-[520px] rounded-2xl overflow-hidden group cursor-pointer">
          <img
            loading="lazy"
            src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80"
            alt="Jewelry Collection"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <p className="text-sm uppercase tracking-widest text-white/70 mb-1">
              Collection
            </p>
            <h3 className="text-3xl font-bold mb-2">Fine Jewelry</h3>
            <p className="text-white/70 text-sm mb-4 max-w-xs">
              Elegant pieces crafted to complement every look and occasion.
            </p>
            <button className="btn btn-accent btn-sm rounded-full px-6">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
