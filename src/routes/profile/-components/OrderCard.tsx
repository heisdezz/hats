import { Link, useNavigate } from "@tanstack/react-router";
import { pb } from "#/client/pb";
import type {
  OrderItemsResponse,
  ProductsResponse,
  UserOrdersResponse,
} from "#/../pocketbase-types";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

const statusGradient: Record<string, string> = {
  pending: "from-warning/20 to-transparent",
  processing: "from-info/20 to-transparent",
  "in-transit": "from-primary/20 to-transparent",
  delivered: "from-success/20 to-transparent",
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
  const gradient = statusGradient[status] ?? "from-base-200 to-transparent";

  const items =
    ((order.expand as any)?.orderItems as ItemWithProduct[] | undefined) ?? [];
  const first = items[0];
  const previewProduct = (order.expand as any)?.preview as ProductsResponse | undefined;
  const firstProduct = (first?.expand as any)?.originalProduct as ProductsResponse | undefined;

  // use dedicated preview relation for the banner image
  const bannerProduct = previewProduct ?? firstProduct;
  const imgFile = bannerProduct?.preview || bannerProduct?.images?.[0];
  const imgUrl = imgFile && bannerProduct ? pb.files.getURL(bannerProduct, imgFile) : null;

  return (
    <Link
      to="/profile/orders/$orderId"
      params={{ orderId: order.id }}
      className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md active:scale-[0.99] transition-all overflow-hidden"
    >
      {/* Image banner */}
      <div className="relative h-36 bg-base-200">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={bannerProduct?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/10 to-transparent" />

        {/* Status badge top-right */}
        <div className="absolute top-3 right-3">
          <span className={`badge ${badgeClass} capitalize`}>{status}</span>
        </div>

        {/* Item count bottom-left */}
        {items.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="badge badge-neutral badge-sm">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Product name + colors */}
        {firstProduct && (
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate leading-tight">
                {firstProduct.title}
              </p>
              {first && (
                <p className="text-xs text-base-content/40 mt-0.5">
                  ×{first.amount ?? 1} · ₦{(first.price ?? 0).toLocaleString()}{" "}
                  each
                </p>
              )}
            </div>
            {(firstProduct.mainColor || firstProduct.secondaryColor) && (
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                {firstProduct.mainColor && (
                  <span
                    className="size-3.5 rounded-full border border-base-content/20"
                    style={{ backgroundColor: firstProduct.mainColor }}
                  />
                )}
                {firstProduct.secondaryColor && (
                  <span
                    className="size-3.5 rounded-full border border-base-content/20"
                    style={{ backgroundColor: firstProduct.secondaryColor }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className="divider my-0" />

        {/* Footer: date + ref + total */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-mono text-base-content/30">
              #{order.id.slice(0, 8)}
            </p>
            <p className="text-xs text-base-content/40">
              {new Date(order.created).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {order.ref && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nav({
                    to: "/profile/orders/",
                    search: { reference: order.ref, page: 1 },
                  });
                }}
                className="font-mono text-xs px-2 py-0.5 rounded-full bg-base-200 hover:bg-primary hover:text-primary-content transition-colors max-w-24 truncate"
                title={`Search: ${order.ref}`}
              >
                {order.ref}
              </button>
            )}
            <p className="font-bold text-primary text-sm">
              ₦{(order.totalPrice ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
