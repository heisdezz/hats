import { IconShoppingBag, IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import type { CategoryResponse, ProductsResponse, SectionResponse } from "pocketbase-types";

type ProductWithCategory = ProductsResponse<{
  category?: CategoryResponse<{ parent?: SectionResponse }>;
}>;

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80";

function JewelryItemCard({ product }: { product: ProductWithCategory }) {
  const imageUrl = product.images && product.images.length > 0
    ? pb.files.getURL(product, product.images[0])
    : product.preview || FALLBACK_IMAGE;

  const categoryName = product.expand?.category?.name;
  const priceFormatted = product.price ? `₦${product.price.toLocaleString()}` : "Price upon request";

  return (
    <Link
      to="/store/catalog/products/jewelry/$id"
      params={{ id: product.id }}
      className="bg-base-100 rounded-xl overflow-hidden border border-base-200 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col"
    >
      <div className="relative overflow-hidden aspect-square bg-base-200">
        <img
          loading="lazy"
          src={imageUrl}
          alt={product.title || "Jewelry"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {categoryName && (
          <span className="badge badge-secondary badge-xs absolute top-2.5 left-2.5 font-bold shadow-xs">
            {categoryName}
          </span>
        )}
        <button
          type="button"
          className="btn btn-circle btn-secondary btn-xs absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
          title="View product"
        >
          <IconShoppingBag size={12} />
        </button>
      </div>
      <div className="p-3 flex flex-col justify-between flex-1">
        <h3 className="font-semibold text-xs leading-snug truncate text-base-content/90 group-hover:text-secondary transition-colors">
          {product.title || "Untitled Jewelry"}
        </h3>
        <p className="text-secondary font-bold text-xs mt-1">{priceFormatted}</p>
      </div>
    </Link>
  );
}

export default function JewelryGrid() {
  const sectionQuery = useQuery({
    queryKey: ["section-jewelry"],
    queryFn: async () => {
      try {
        return await pb.collection("section").getFirstListItem<SectionResponse>('name ~ "jewel"');
      } catch (_) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ["store-jewelry-products"],
    queryFn: () =>
      pb.collection("products").getList<ProductWithCategory>(1, 6, {
        filter: "published = true && (category.parent.name ~ 'jewel' || category.parent.name ~ 'jewl')",
        expand: "category.parent",
        sort: "-created",
      }),
    staleTime: 5 * 60 * 1000,
  });

  const section = sectionQuery.data;
  const products = productsQuery.data?.items ?? [];
  const isLoading = productsQuery.isLoading;

  const sectionTitle = section?.display_name || "Fine Jewelry & Coral Beads";
  const sectionDesc = section?.description || "Statement neckpieces, earrings, and traditional African coral beads.";

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{sectionTitle}</h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            {sectionDesc}
          </p>
        </div>
        <Link
          to="/store/catalog"
          search={{ section: section?.id }}
          className="link link-secondary flex items-center gap-1 text-xs font-bold uppercase tracking-wider no-underline hover:underline"
        >
          View all <IconArrowRight size={14} />
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Products grid */}
        <div className="lg:col-span-7 order-2 lg:order-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton aspect-square w-full rounded-xl" />
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
              {products.map((item) => (
                <JewelryItemCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl bg-base-200/40 border border-base-200 text-center gap-3">
              <p className="text-sm text-base-content/60">New handcrafted jewelry and coral beads are being added soon.</p>
              <Link to="/store/catalog" className="btn btn-sm btn-secondary rounded-xl">
                Browse All Products
              </Link>
            </div>
          )}
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
            <h3 className="text-3xl font-logo font-bold mb-2">{sectionTitle}</h3>
            <p className="text-white/80 text-xs mb-6 max-w-xs leading-relaxed">
              {sectionDesc}
            </p>
            <Link
              to="/store/catalog"
              search={{ section: section?.id }}
              className="btn btn-secondary btn-sm rounded-full px-6 text-xs font-bold shadow-md"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
