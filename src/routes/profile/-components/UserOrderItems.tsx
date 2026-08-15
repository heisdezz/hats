import { pb } from "#/client/pb";
import type {
  CategoryResponse,
  OrderItemsResponse,
  ProductsResponse,
  SectionResponse,
} from "#/../pocketbase-types";
import { Link } from "@tanstack/react-router";
import { ExternalLink, ShoppingBag, Sparkles, Tag } from "lucide-react";

type ItemWithProduct = OrderItemsResponse<{
  originalProduct?: ProductsResponse<{
    category?: CategoryResponse<{ parent?: SectionResponse }>;
  }>;
}>;

function getProductUrl(product?: ProductsResponse) {
  if (!product) return null;
  const file = product.preview || product.images?.[0];
  return file ? pb.files.getURL(product, file) : null;
}

function getStoreLink(product?: ProductsResponse<{ category?: CategoryResponse<{ parent?: SectionResponse }> }>) {
  if (!product?.id) return "/store/catalog";
  const sectionName = product.expand?.category?.expand?.parent?.name?.toLowerCase() || "";
  const isJewelry = sectionName.includes("jewelry");
  return `/store/catalog/products/${isJewelry ? "jewelry" : "hats"}/${product.id}`;
}

export default function UserOrderItems({
  items,
}: {
  items: ItemWithProduct[];
}) {
  if (!items.length) return null;

  return (
    <div className="card bg-base-100 border border-base-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-200/30">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          <h3 className="font-bold text-sm text-base-content">
            Purchased Items ({items.length})
          </h3>
        </div>
        <span className="text-xs text-base-content/50">
          Click item to view in store
        </span>
      </div>

      {/* Items List */}
      <div className="divide-y divide-base-200">
        {items.map((item, idx) => {
          const product = (item.expand as any)?.originalProduct;
          const imgUrl = getProductUrl(product);
          const storeUrl = getStoreLink(product);
          const unitPrice = Math.round((item.price ?? 0) / (item.amount || 1));
          const mainColor = (item as any).mainColor || product?.mainColor;
          const secondaryColor = (item as any).secondaryColor || product?.secondaryColor;
          const size = (item as any).headSize || (item as any).wristSize;
          const sizeType = (item as any).headSize ? "Head Size" : "Wrist Size";

          return (
            <div
              key={item.id ?? idx}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-base-200/30 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Product Thumbnail with Store Link */}
                <Link
                  to={storeUrl}
                  className="relative size-20 md:size-24 rounded-2xl overflow-hidden bg-base-200 shrink-0 border border-base-200 group"
                  title="View piece in store"
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={product?.title ?? "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base-content/20">
                      <ShoppingBag className="size-8 stroke-1" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ExternalLink className="size-5" />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {product?.expand?.category?.name && (
                      <span className="badge badge-xs badge-neutral text-[10px] uppercase font-bold">
                        {product.expand.category.name}
                      </span>
                    )}
                    {size && (
                      <span className="badge badge-xs badge-ghost text-[10px]">
                        {sizeType}: {size} cm
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-base-content leading-snug line-clamp-2">
                    <Link
                      to={storeUrl}
                      className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      {product?.title ?? "Custom Artisan Piece"}
                      <ExternalLink className="size-3.5 opacity-40 shrink-0" />
                    </Link>
                  </h4>

                  {/* Quantity & Unit Pricing */}
                  <div className="flex items-center gap-3 text-xs text-base-content/60 flex-wrap">
                    <span className="font-medium">
                      Qty: <strong className="text-base-content">{item.amount ?? 1}</strong>
                    </span>
                    <span>•</span>
                    <span>₦{unitPrice.toLocaleString()} each</span>
                  </div>

                  {/* Colors & Customization Info */}
                  <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                    {(mainColor || secondaryColor) && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-base-content/50">Palette:</span>
                        <div className="flex items-center gap-1">
                          {mainColor && (
                            <span
                              className="size-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: mainColor }}
                              title={`Primary: ${mainColor}`}
                            />
                          )}
                          {secondaryColor && (
                            <span
                              className="size-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: secondaryColor }}
                              title={`Secondary: ${secondaryColor}`}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {item.extraInfo && (
                      <div className="text-[11px] text-base-content/60 italic line-clamp-1 bg-base-200/60 px-2 py-0.5 rounded-md max-w-xs">
                        Notes: "{item.extraInfo}"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-base-200 gap-2">
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-base-content/40 uppercase font-bold tracking-wider">
                    Item Total
                  </p>
                  <p className="text-lg font-extrabold text-primary">
                    ₦{(item.price ?? 0).toLocaleString()}
                  </p>
                </div>

                <Link
                  to={storeUrl}
                  className="btn btn-sm btn-ghost border border-base-200 hover:btn-primary rounded-xl text-xs gap-1.5"
                >
                  <Sparkles className="size-3.5" />
                  <span>View in Store</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
