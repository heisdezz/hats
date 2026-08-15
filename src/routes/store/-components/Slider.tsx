import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const slides = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=1200&q=80",
    alt: "Woman in elegant wide-brim hat",
    label: "New Arrival",
    title: "Elegant Wide-Brim Royal Hat",
    description:
      "Turn heads with our signature wide-brim silhouette. Perfect for weddings & church celebrations.",
    price: "₦28,500",
    category: "Hats",
    path: "/store/catalog/hats",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
    alt: "Fine jewelry necklace set",
    label: "Bestseller",
    title: "Layered Gold & Pearl Set",
    description:
      "Crafted statement neckpieces and drop earrings designed to elevate any traditional outfit.",
    price: "₦32,000",
    category: "Jewelry",
    path: "/store/catalog/jewelry",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1200&q=80",
    alt: "Woman in classic fedora hat",
    label: "Exclusive",
    title: "Bespoke Church Fascinators",
    description:
      "Timeless millinery craftsmanship meets modern African elegance.",
    price: "₦35,000",
    category: "Fascinators",
    path: "/store/catalog/hats",
  },
];

export default function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-full h-[280px] sm:h-[400px] lg:h-[520px]">
              <img
                loading="lazy"
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Product details overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                <div className="max-w-2xl">
                  <span className="badge badge-primary badge-sm font-bold uppercase tracking-wider mb-2">
                    {slide.label}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-bold font-logo leading-tight mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm max-w-lg mb-3 line-clamp-2">
                    {slide.description}
                  </p>
                  <p className="text-lg sm:text-xl font-extrabold text-primary mb-4">
                    {slide.price}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={slide.path}
                      className="btn btn-primary btn-sm sm:btn-md rounded-full px-6 text-xs font-bold shadow-md"
                    >
                      Shop Now
                    </Link>
                    <Link
                      to="/store/catalog"
                      className="btn btn-outline btn-sm sm:btn-md rounded-full px-6 text-xs text-white border-white hover:bg-white hover:text-black font-semibold"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev button */}
      <button
        type="button"
        onClick={scrollPrev}
        className="btn btn-circle btn-ghost btn-sm sm:btn-md absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white border-0 backdrop-blur-xs"
        aria-label="Previous slide"
      >
        <IconChevronLeft size={20} />
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={scrollNext}
        className="btn btn-circle btn-ghost btn-sm sm:btn-md absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white border-0 backdrop-blur-xs"
        aria-label="Next slide"
      >
        <IconChevronRight size={20} />
      </button>
    </div>
  );
}
