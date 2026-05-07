import Categories from "./Categories";
import ImageSlider from "./Slider";

export default function Hero() {
  return (
    <div className="page-wrap flex flex-col lg:flex-row gap-2">
      <div className="hidden lg:block shrink-0">
        <Categories />
      </div>

      <div className="flex-1 h-[260px] sm:h-[380px] lg:h-[520px] rounded-lg bg-base-200">
        <ImageSlider />
      </div>

      {/* Mobile category pills */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          "Hats",
          "Millinery",
          "Fascinators",
          "Church Hats",
          "Berets",
          "Jewelry",
          "Necklaces",
          "Earrings",
          "Bracelets",
        ].map((cat) => (
          <button
            key={cat}
            className="btn btn-ghost btn-sm rounded-full border border-base-200 shrink-0 text-xs"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
