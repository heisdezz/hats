import { pb } from "#/client/pb";
import type {
  OrderItemsResponse,
  ProductsResponse,
  UserOrdersResponse,
  UsersResponse,
} from "#/../pocketbase-types";
import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

type ItemWithProduct = OrderItemsResponse<{
  originalProduct: ProductsResponse;
}>;

type OrderExpand = {
  orderItems?: ItemWithProduct[];
  preview?: ProductsResponse;
  user?: UsersResponse;
};

export type OrderWithExpand = UserOrdersResponse<OrderExpand>;

export default function OrderCard({
  order,
}: {
  order: OrderWithExpand | UserOrdersResponse<any>;
}) {
  const status = order.status ?? "pending";
  const badgeClass = statusColor[status] ?? "badge-neutral";
  const expand = order.expand as OrderExpand | undefined;

  const items = expand?.orderItems ?? [];
  const previewProduct = expand?.preview;
  const first = items[0];
  const user = expand?.user;

  // Extract up to 4 preview images from orderItems
  const productImages: { url: string; title?: string }[] = [];

  items.forEach((item) => {
    const prod = (item.expand as any)?.originalProduct as
      | ProductsResponse
      | undefined;
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

  // keep product reference for title/price info (still first item's product)
  const product = (first?.expand as any)?.originalProduct as
    | ProductsResponse
    | undefined;
  const displayName =
    user?.username ||
    user?.email ||
    (order.user ? `#${order.user.slice(0, 8)}` : "Guest");

  return (
    <Link
      to="/admin/dashboard/orders/$orderId"
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

        <div className="p-4 flex flex-col gap-3">
          {/* Product info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight group-hover:text-primary transition-colors">
              {product?.title || `Order #${order.id.slice(0, 8)}`}
            </p>
            {items.length > 1 ? (
              <p className="text-xs text-base-content/50 mt-0.5">
                + {items.length - 1} other{" "}
                {items.length - 1 === 1 ? "item" : "items"}
              </p>
            ) : first ? (
              <p className="text-xs text-base-content/40 mt-0.5">
                ×{first.amount ?? 1} · ₦
                {Math.round(
                  (first.price ?? 0) / (first.amount || 1),
                ).toLocaleString()}{" "}
                each
              </p>
            ) : null}
          </div>

          <div className="divider my-0" />

          {/* Customer + total */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-base-content/40">Customer</p>
              <p className="text-sm font-medium truncate">{displayName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-base-content/40">Total</p>
              <p className="text-sm font-bold text-primary">
                ₦{(order.totalPrice ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-base-content/30">
              #{order.id.slice(0, 8)}
            </p>
            {order.ref && (
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-base-200 text-base-content/50 truncate max-w-28">
                {order.ref}
              </span>
            )}
            <p className="text-xs text-base-content/30">
              {new Date(order.created).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
