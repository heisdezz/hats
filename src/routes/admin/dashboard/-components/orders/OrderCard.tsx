import { pb } from "#/client/pb";
import type {
  OrderItemsResponse,
  ProductsResponse,
  UserOrdersResponse,
  UsersResponse,
} from "#/../pocketbase-types";
import { Link } from "@tanstack/react-router";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

type ItemWithProduct = OrderItemsResponse<{ originalProduct: ProductsResponse }>;

type OrderExpand = {
  orderItems?: ItemWithProduct[];
  preview?: ProductsResponse;
  user?: UsersResponse;
};

export default function OrderCard({ order }: { order: UserOrdersResponse }) {
  const status = order.status ?? "pending";
  const expand = order.expand as OrderExpand | undefined;

  const items = expand?.orderItems ?? [];
  const first = items[0];
  const user = expand?.user;

  // use dedicated preview relation; fall back to first orderItem's product
  const previewProduct = expand?.preview
    ?? ((first?.expand as any)?.originalProduct as ProductsResponse | undefined);
  const imgFile = previewProduct?.preview || previewProduct?.images?.[0];
  const previewUrl = imgFile && previewProduct ? pb.files.getURL(previewProduct, imgFile) : null;
  // keep product reference for title/price info (still first item's product)
  const product = (first?.expand as any)?.originalProduct as ProductsResponse | undefined;
  const displayName = user?.username || user?.email || `#${order.user.slice(0, 8)}`;

  return (
    <Link
      to="/admin/dashboard/orders/$orderId"
      params={{ orderId: order.id }}
      className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md active:scale-[0.99] transition-all overflow-hidden"
    >
      {/* Image banner */}
      <div className="relative h-32 bg-base-200">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={product?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/10 to-transparent" />

        <div className="absolute top-3 right-3">
          <span className={`badge ${statusColor[status] ?? "badge-neutral"} capitalize`}>
            {status}
          </span>
        </div>

        {items.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="badge badge-neutral badge-sm">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Product info */}
        {product && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">
              {product.title}
            </p>
            {first && (
              <p className="text-xs text-base-content/40 mt-0.5">
                ×{first.amount ?? 1} · ₦{Math.round((first.price ?? 0) / (first.amount || 1)).toLocaleString()} each
              </p>
            )}
          </div>
        )}

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
    </Link>
  );
}
