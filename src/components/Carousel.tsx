import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

type CarouselProps = {
  slides: string[];
  alt?: string;
};

export default function Carousel({ slides, alt = "Image" }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!slides.length) {
    return (
      <div className="aspect-square bg-base-200 rounded-box grid place-items-center text-base-content/30">
        No image
      </div>
    );
  }

  return (
    <div className="flex  ring fade rounded-xl bg-base-200 flex-col gap-3 flex-1 p-4 h-full">
      <div
        className="relative overflow-hidden rounded-box flex-1 min-h-0"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {slides.map((src, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] min-w-0 h-full bg-base-200   flex p-4"
            >
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                className="w-full h-full object-contain"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="btn btn-circle btn-primary absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={scrollNext}
              className="btn btn-circle  btn-primary absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === selectedIndex ? "bg-primary" : "bg-base-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
