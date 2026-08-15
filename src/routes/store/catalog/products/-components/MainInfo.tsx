import { pb } from "#/client/pb";
import Carousel from "#/components/Carousel";
import RenderDescription from "#/routes/store/-components/RenderDescription";
import ProductReviews from "#/components/ProductReviews";
import { Link } from "@tanstack/react-router";
import { normalizeTagItem } from "#/routes/admin/dashboard/products/-components/TagsInput";
import { Tag as TagIcon, Sparkles, ShieldCheck, Palette } from "lucide-react";

import type {
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
} from "pocketbase-types";

export default function MainInfo(props: {
  product: ProductsResponse<{
    category: CategoryResponse<{ parent: SectionResponse }>;
  }>;
}) {
  const { product } = props;

  const slides = (product.images ?? []).map((img) =>
    pb.files.getURL(product, img),
  );

  const category = product.expand?.category?.name;
  const categoryId = product.expand?.category?.id;
  const section = product.expand?.category?.expand?.parent?.name;
  const sectionId = product.expand?.category?.expand?.parent?.id;

  const tags = normalizeTagItem(
    product.tags || (product.expand as any)?.tags || [],
  );
  const mainColor = (product as any).mainColor;
  const secondaryColor = (product as any).secondaryColor;
  const colorSelection = (product as any).color_selection !== false;

  return (
    <main className="flex-1 flex flex-col gap-8">
      {/* Product Image Gallery Carousel */}
      <div className="w-full rounded-2xl overflow-hidden bg-base-200/20 border border-base-200 shadow-xs">
        {slides.length > 0 ? (
          <Carousel slides={slides} alt={product.title ?? "Product"} />
        ) : (
          <div className="h-96 flex items-center justify-center text-base-content/30 text-sm">
            No images available for this piece
          </div>
        )}
      </div>

      {/* Main Details */}
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-base-content/50 flex-wrap">
          <Link to="/store" className="hover:text-primary transition-colors">
            Store
          </Link>
          <span>/</span>
          <Link
            to="/store/catalog"
            className="hover:text-primary transition-colors"
          >
            Catalog
          </Link>
          {section && (
            <>
              <span>/</span>
              <Link
                to="/store/catalog"
                search={{ section: sectionId } as any}
                className="hover:text-primary transition-colors"
              >
                {section}
              </Link>
            </>
          )}
          {category && (
            <>
              <span>/</span>
              <Link
                to="/store/catalog"
                search={{ category: categoryId } as any}
                className="hover:text-primary transition-colors"
              >
                {category}
              </Link>
            </>
          )}
        </nav>

        {/* Title & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {section && (
              <span className="badge badge-sm badge-neutral font-semibold uppercase tracking-wider text-[10px]">
                {section}
              </span>
            )}
            {category && (
              <span className="badge badge-sm badge-outline font-semibold uppercase tracking-wider text-[10px]">
                {category}
              </span>
            )}
            <span
              className={`badge badge-sm text-[10px] font-semibold ${
                colorSelection
                  ? "badge-primary badge-soft text-primary"
                  : "badge-ghost text-base-content/50"
              }`}
            >
              {colorSelection
                ? "Custom Colors Supported"
                : "Standard Collection"}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
            {product.title ?? "Untitled Piece"}
          </h1>

          {product.price != null && (
            <p className="text-2xl md:text-3xl font-extrabold text-primary pt-1">
              ₦{product.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Color Palette Preview Bar */}
        {(mainColor || secondaryColor) && (
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-base-200/50 border border-base-200 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-base-content/70">
              <Palette className="size-4 text-primary" />
              <span>Base Palette:</span>
            </div>
            <div className="flex items-center gap-3">
              {mainColor && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-4 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: mainColor }}
                  />
                  <span className="font-mono text-base-content/60">
                    {mainColor}
                  </span>
                </div>
              )}
              {secondaryColor && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-4 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="font-mono text-base-content/60">
                    {secondaryColor}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Story / Description */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
            Craftsmanship & Design
          </h2>
          <div className="prose prose-sm max-w-none text-base-content/80 leading-relaxed">
            <RenderDescription
              text={
                product.description ??
                "Handcrafted with bespoke millinery techniques."
              }
            />
          </div>
        </div>

        {/* Tags Badges */}
        {tags.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-base-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
              <TagIcon className="size-3.5" />
              <span>Attributes & Style:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t.tagName}
                  className="badge badge-sm badge-ghost text-xs px-2.5 py-2 rounded-lg"
                >
                  {t.tagName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Luxury Quality Guarantee Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-base-200/40 border border-base-200 flex items-start gap-3">
            <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-base-content">
                Handmade Bespoke Artistry
              </p>
              <p className="text-base-content/60">
                Each piece is custom crafted with meticulous attention to
                detail.
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-base-200/40 border border-base-200 flex items-start gap-3">
            <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-base-content">
                Authenticity Guaranteed
              </p>
              <p className="text-base-content/60">
                Carefully inspected and securely packaged prior to dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-4 border-t border-base-200">
        <ProductReviews productId={product.id} />
      </div>
    </main>
  );
}
