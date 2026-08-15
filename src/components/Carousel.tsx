import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import { Link } from "@tanstack/react-router";
import { IconChevronLeft, IconChevronRight, IconSparkles } from "@tabler/icons-react";
import type {
  CarouselResponse,
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
} from "pocketbase-types";

type ExpandedCarousel = CarouselResponse<{
  product?: ProductsResponse<{
    category?: CategoryResponse<{ parent?: SectionResponse }>;
  }>;
}>;

const FALLBACK_SLIDES = [
  {
    id: "fb-1",
    src: "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=1200&q=80",
    alt: "Handcrafted Luxury Millinery",
    label: "New Arrival",
    title: "Bespoke Royal Millinery & Hats",
    description: "Turn heads with our signature wide-brim silhouettes and fascinators crafted in Lagos.",
    price: "₦28,500",
    path: "/store/catalog/hats",
  },
  {
    id: "fb-2",
    src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
    alt: "Fine African Coral & Jewelry",
    label: "Bestseller",
    title: "Exquisite Traditional Coral & Gold",
    description: "Handcrafted statement necklaces, earrings, and ceremonial coral beads for milestone events.",
    price: "₦32,000",
    path: "/store/catalog/jewelry",
  },
  {
    id: "fb-3",
    src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1200&q=80",
    alt: "Ceremonial Church Fascinator",
    label: "Exclusive",
    title: "Couture Church & Wedding Headwear",
    description: "Timeless millinery craftsmanship tailored to your individual elegance.",
    price: "₦35,000",
    path: "/store/catalog/hats",
  },
];

type CarouselProps = {
  slides?: string[];
  alt?: string;
};

export default function Carousel({ slides, alt = "Image" }: CarouselProps) {
  // If slides prop is provided, render simple product image gallery
  if (slides !== undefined) {
    return <ImageGalleryCarousel slides={slides} alt={alt} />;
  }

  return <DynamicStoreCarousel />;
}

/**
 * 1. Image Gallery mode for Product Detail pages
 */
function ImageGalleryCarousel({ slides, alt }: { slides: string[]; alt: string }) {
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
      <div className="aspect-square bg-base-200 rounded-2xl grid place-items-center text-base-content/30 text-sm">
        No images available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 flex-1 p-3 h-full max-h-[520px]">
      <div
        className="relative overflow-hidden rounded-2xl flex-1 min-h-0 bg-base-200/40"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {slides.map((src, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-4"
            >
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                className="w-full h-full object-contain max-h-[460px]"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              type="button"
              className="btn btn-circle btn-primary btn-sm absolute left-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 shadow-md"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={scrollNext}
              type="button"
              className="btn btn-circle btn-primary btn-sm absolute right-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 shadow-md"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-1">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === selectedIndex ? "w-6 bg-primary" : "w-2 bg-base-300 hover:bg-base-content/30"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 2. Dynamic mode: Fetches records directly from PocketBase `carousel` collection
 */
function DynamicStoreCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const carouselQuery = useQuery({
    queryKey: ["store-carousel"],
    queryFn: () =>
      pb.collection("carousel").getFullList<ExpandedCarousel>({
        expand: "product.category.parent",
        sort: "-created",
      }),
    staleTime: 5 * 60 * 1000,
  });

  const carouselRecords = carouselQuery.data ?? [];
  const isLoading = carouselQuery.isLoading;

  // Transform dynamic items into unified slide format
  const activeSlides = carouselRecords.length > 0
    ? carouselRecords.map((item) => {
        const prod = item.expand?.product;
        const parentSec = (prod?.expand?.category as any)?.expand?.parent;
        const sectionName = parentSec?.name?.toLowerCase() || (prod?.expand?.category as any)?.name?.toLowerCase() || "hats";
        const normalizedSection = sectionName.includes("jewel") ? "jewelry" : "hats";

        const imageSrc =
          prod?.images && prod.images.length > 0
            ? pb.files.getURL(prod, prod.images[0])
            : prod?.preview || FALLBACK_SLIDES[0].src;

        const path = prod?.id
          ? `/store/catalog/products/${normalizedSection}/${prod.id}`
          : `/store/catalog`;

        return {
          id: item.id,
          src: imageSrc,
          alt: prod?.title || "Featured Piece",
          label: item.badge || "Featured",
          title: prod?.title || "Exclusive Collection",
          description:
            prod?.description ||
            "Discover handcrafted Nigerian luxury headwear and fine jewelry designed for unforgettable occasions.",
          price: prod?.price ? `₦${prod.price.toLocaleString()}` : "",
          path,
        };
      })
    : FALLBACK_SLIDES;

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[280px] sm:min-h-[400px] lg:min-h-[520px] rounded-2xl bg-base-200 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-base-content/40">
          <IconSparkles className="size-8 animate-spin" />
          <span className="text-xs font-semibold">Loading collection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl group">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {activeSlides.map((slide) => (
            <div
              key={slide.id}
              className="relative min-w-full h-[280px] sm:h-[400px] lg:h-[520px]"
            >
              <img
                loading="lazy"
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Product details overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                <div className="max-w-2xl">
                  {slide.label && (
                    <span className="badge badge-primary badge-sm font-bold uppercase tracking-wider mb-2 shadow-xs">
                      {slide.label}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-4xl font-bold font-logo leading-tight mb-2 drop-shadow-sm">
                    {slide.title}
                  </h2>
                  {slide.description && (
                    <p className="text-white/80 text-xs sm:text-sm max-w-lg mb-3 line-clamp-2 leading-relaxed">
                      {slide.description}
                    </p>
                  )}
                  {slide.price && (
                    <p className="text-lg sm:text-xl font-extrabold text-primary mb-4 font-mono">
                      {slide.price}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link
                      to={slide.path}
                      className="btn btn-primary btn-sm sm:btn-md rounded-full px-6 text-xs font-bold shadow-md hover:scale-105 transition-transform"
                    >
                      Shop Piece
                    </Link>
                    <Link
                      to="/store/catalog"
                      className="btn btn-outline btn-sm sm:btn-md rounded-full px-6 text-xs text-white border-white/80 hover:bg-white hover:text-black font-semibold backdrop-blur-xs"
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
        className="btn btn-circle btn-ghost btn-sm sm:btn-md absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white border-0 backdrop-blur-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <IconChevronLeft size={20} />
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={scrollNext}
        className="btn btn-circle btn-ghost btn-sm sm:btn-md absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white border-0 backdrop-blur-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <IconChevronRight size={20} />
      </button>
    </div>
  );
}
