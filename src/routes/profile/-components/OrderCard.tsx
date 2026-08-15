import { Link, useNavigate } from "@tanstack/react-router";
import { pb } from "#/client/pb";
import type {
  OrderItemsResponse,
  ProductsResponse,
  UserOrdersResponse,
} from "#/../pocketbase-types";
import { Package, Calendar, Tag as TagIcon } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

type ItemWithProduct = OrderItemsResponse<{
  originalProduct: ProductsResponse;
}>;

type OrderWithExpand = UserOrdersResponse<{
  orderItems?: ItemWithProduct[];
  preview?: ProductsResponse;
}>;

export default function OrderCard({ order }: { order: OrderWithExpand }) {
  const nav = useNavigate();
  const status = order.status ?? "pending";
  const badgeClass = statusColor[status] ?? "badge-neutral";

  const items =
    ((order.expand as any)?.orderItems as ItemWithProduct[] | undefined) ?? [];
  const previewProduct = (order.expand as any)?.preview as ProductsResponse | undefined;

  // Extract up to 4 preview images from orderItems
  const productImages: { url: string; title?: string }[] = [];

  items.forEach((item) => {
    const prod = (item.expand as any)?.originalProduct as ProductsResponse | undefined;
    if (prod) {
      const file = prod.preview || prod.images?.[0];
      if (file) {
        const url = pb.files.getURL(prod, file);
        productImages.push({ url, title: prod.title });
      }
    }
  });

  // Fallback to order.preview if no images gathered from items
  if (productImages.length === 0 && previewProduct) {
    const file = previewProduct.preview || previewProduct.images?.[0];
    if (file) {
      productImages.push({
        url: pb.files.getURL(previewProduct, file),
        title: previewProduct.title,
      });
    }
  }

  const first = items[0];
  const firstProduct = (first?.expand as any)?.originalProduct as ProductsResponse | undefined;
  const remainingItemCount = items.length > 1 ? items.length - 1 : 0;

  return (
    <Link
      to="/profile/orders/$orderId"
      params={{ orderId: order.id }}
      className="card bg-base-100 border border-base-200 shadow-xs hover:shadow-md active:scale-[0.99] transition-all duration-300 overflow-hidden flex flex-col justify-between group"
    >
      <div>
        {/* Multi-image preview grid (max 4 images) */}
        <div className="relative h-44 w-full bg-base-200 overflow-hidden">
          {productImages.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-base-content/20 gap-1.5">
              <Package size={36} strokeWidth={1.5} />
              <span className="text-xs">No preview image</span>
            </div>
          ) : productImages.length === 1 ? (
            <img
              src={productImages[0].url}
              alt={productImages[0].title ?? "Product"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : productImages.length === 2 ? (
            <div className="grid grid-cols-2 h-full gap-1 p-1 bg-base-200/60">
              {productImages.slice(0, 2).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-full overflow-hidden rounded-xl bg-base-300"
                >
                  <img
                    src={img.url}
                    alt={img.title ?? "Product"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          ) : productImages.length === 3 ? (
            <div className="grid grid-cols-2 h-full gap-1 p-1 bg-base-200/60">
              <div className="relative h-full overflow-hidden rounded-xl bg-base-300">
                <img
                  src={productImages[0].url}
                  alt={productImages[0].title ?? "Product"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="grid grid-rows-2 gap-1 h-full">
                {productImages.slice(1, 3).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative h-full overflow-hidden rounded-xl bg-base-300"
                  >
                    <img
                      src={img.url}
                      alt={img.title ?? "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 4 or more images grid */
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-1 bg-base-200/60">
              {productImages.slice(0, 4).map((img, idx) => {
                const isFourth = idx === 3;
                const extraItems = items.length > 4 ? items.length - 4 : 0;
                return (
                  <div
                    key={idx}
                    className="relative h-full overflow-hidden rounded-xl bg-base-300"
                  >
                    <img
                      src={img.url}
                      alt={img.title ?? "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {isFourth && extraItems > 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white font-bold text-xs tracking-wider">
                        +{extraItems} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Top Status & Item Count Badges */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <span
              className={`badge badge-sm font-bold uppercase tracking-wider shadow-sm ${badgeClass}`}
            >
              {status}
            </span>
          </div>

          {items.length > 0 && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="badge badge-neutral/90 backdrop-blur-md badge-xs text-[11px] shadow-sm">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
          )}
        </div>

        {/* Order Details Body */}
        <div className="p-4 space-y-3">
          {/* Main item title */}
          <div>
            <h3 className="font-bold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {firstProduct?.title || `Order #${order.id.slice(0, 8)}`}
            </h3>
            {remainingItemCount > 0 && (
              <p className="text-xs text-base-content/50 mt-0.5">
                + {remainingItemCount} other {remainingItemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {/* Colors swatch if present */}
          {firstProduct && (firstProduct.mainColor || firstProduct.secondaryColor) && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-base-content/50">Palette:</span>
              <div className="flex items-center gap-1">
                {firstProduct.mainColor && (
                  <span
                    className="size-3 rounded-full border border-black/20"
                    style={{ backgroundColor: firstProduct.mainColor }}
                    title={firstProduct.mainColor}
                  />
                )}
                {firstProduct.secondaryColor && (
                  <span
                    className="size-3 rounded-full border border-black/20"
                    style={{ backgroundColor: firstProduct.secondaryColor }}
                    title={firstProduct.secondaryColor}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-0">
        <div className="border-t border-base-200/70 pt-3 flex items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <p className="font-mono text-[11px] text-base-content/40">
              #{order.id.slice(0, 8)}
            </p>
            <p className="text-base-content/50 flex items-center gap-1 text-[11px]">
              <Calendar className="size-3" />
              {new Date(order.created).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            {order.ref && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nav({
                    to: "/profile/orders",
                    search: { reference: order.ref, page: 1 },
                  });
                }}
                className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-base-200/80 hover:bg-primary hover:text-primary-content transition-colors max-w-28 truncate"
                title={`Search reference: ${order.ref}`}
              >
                {order.ref}
              </button>
            )}
            <p className="font-extrabold text-primary text-sm">
              ₦{(order.totalPrice ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
