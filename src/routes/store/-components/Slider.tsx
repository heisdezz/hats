"";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const slides = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=1200&q=80",
    alt: "Woman in elegant wide-brim hat",
    label: "New Arrival",
    title: "Elegant Wide-Brim Hat",
    description:
      "Turn heads with our signature wide-brim silhouette. Perfect for any occasion.",
    price: "₦28,500",
    category: "Wide-Brim",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=1200&q=80",
    alt: "Woman in stylish summer hat",
    label: "Bestseller",
    title: "Summer Straw Hat",
    description:
      "Lightweight, breathable, and endlessly stylish — your summer essential.",
    price: "₦19,000",
    category: "Straw Hats",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1200&q=80",
    alt: "Woman in classic fedora hat",
    label: "Classic",
    title: "Classic Fedora",
    description:
      "Timeless design meets modern craftsmanship. A staple for every wardrobe.",
    price: "₦22,000",
    category: "Fedoras",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=1200&q=80",
    alt: "Woman in boater hat",
    label: "Limited Edition",
    title: "Structured Boater Hat",
    description:
      "Crisp, structured, and effortlessly chic. Limited pieces available.",
    price: "₦31,000",
    category: "Boaters",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=1200&q=80",
    alt: "Woman in trendy bucket hat",
    label: "Trending",
    title: "Bucket Hat Collection",
    description:
      "Street-ready style with a luxe finish. Available in 8 colourways.",
    price: "₦15,500",
    category: "Bucket Hats",
  },
];

export default function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-full h-[520px]">
              <img
                loading="lazy"
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Product details overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="container mx-auto">
                  <span className="badge badge-secondary mb-3">
                    {slide.label}
                  </span>
                  <h2 className="text-3xl font-bold mb-1">{slide.title}</h2>
                  <p className="text-white/80 text-sm max-w-md mb-1">
                    {slide.description}
                  </p>
                  <p className="text-xl font-semibold mb-4">{slide.price}</p>
                  <div className="flex gap-3">
                    <button className="btn btn-accent btn-sm rounded-full px-6">
                      Order Now
                    </button>
                    <button className="btn btn-outline btn-sm rounded-full px-6 text-white border-white hover:bg-white hover:text-black">
                      Browse {slide.category}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <button
        onClick={scrollPrev}
        className="btn btn-circle btn-ghost absolute left-4 top-1/2 -translate-y-1/2 bg-base-100/60 hover:bg-base-100/90 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <IconChevronLeft size={20} />
      </button>

      {/* Next button */}
      <button
        onClick={scrollNext}
        className="btn btn-circle btn-ghost absolute right-4 top-1/2 -translate-y-1/2 bg-base-100/60 hover:bg-base-100/90 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <IconChevronRight size={20} />
      </button>
    </div>
  );
}
