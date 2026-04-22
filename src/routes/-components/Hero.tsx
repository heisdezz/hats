import Categories from "./Categories";
import ImageSlider from "./Slider";

export default function Hero() {
  return (
    <div className="page-wrap flex gap-2">
      <Categories />

      <div className="flex-1 h-[520px] rounded-lg bg-base-200">
        <ImageSlider />
      </div>
    </div>
  );
}
