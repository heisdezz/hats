import Categories from "./Categories";
import ImageSlider from "./Slider";
import { Link } from "@tanstack/react-router";

const mobilePills = [
  { name: "Hats", path: "/store/catalog/hats" },
  { name: "Millinery", path: "/store/catalog/hats" },
  { name: "Fascinators", path: "/store/catalog/hats" },
  { name: "Church Hats", path: "/store/catalog/hats" },
  { name: "Berets", path: "/store/catalog/hats" },
  { name: "Jewelry", path: "/store/catalog/jewelry" },
  { name: "Necklaces", path: "/store/catalog/jewelry" },
  { name: "Earrings", path: "/store/catalog/jewelry" },
  { name: "Bracelets", path: "/store/catalog/jewelry" },
];

export default function Hero() {
  return (
    <div className="page-wrap flex flex-col lg:flex-row gap-6 pt-4 pb-0">
      {/* Desktop Category Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Categories />
      </div>

      {/* Hero Carousel Banner */}
      <div className="flex-1 h-[280px] sm:h-[400px] lg:h-[520px] rounded-2xl overflow-hidden shadow-lg bg-base-200 border border-base-200">
        <ImageSlider />
      </div>

      {/* Mobile Category Quick-Pills */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {mobilePills.map((cat, idx) => (
          <Link
            key={idx}
            to={cat.path}
            className="btn btn-outline btn-sm rounded-full border-base-300 text-xs shrink-0 font-medium hover:btn-primary transition-all"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
