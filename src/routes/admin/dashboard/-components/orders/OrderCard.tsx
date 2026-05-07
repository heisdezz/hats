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

type OrderExpand = {
  orderItems?: OrderItemsResponse<{ originalProduct: ProductsResponse }>;
  user?: UsersResponse;
};

export default function OrderCard({ order }: { order: UserOrdersResponse }) {
  const status = order.status ?? "pending";
  const expand = order.expand as OrderExpand | undefined;

  const item = expand?.orderItems;
  const product = (item?.expand as any)?.originalProduct as
    | ProductsResponse
    | undefined;
  const user = expand?.user;

  const previewUrl = product?.preview
    ? pb.files.getURL(product, product.preview)
    : product?.images?.[0]
      ? pb.files.getURL(product, product.images[0])
      : null;

  const displayName =
    user?.username || user?.email || `#${order.user.slice(0, 8)}`;

  return (
    <Link
      to={`/admin/dashboard/orders/$orderId`}
      params={{ orderId: order.id }}
      className="card bg-base-100 border border-base-200 shadow-sm"
    >
      <div className="card-body p-5 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-base-content/40">
              #{order.id.slice(0, 10)}
            </p>
            <p className="text-xs text-base-content/40 mt-0.5">
              {new Date(order.created).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`badge ${statusColor[status] ?? "badge-neutral"} capitalize shrink-0`}
          >
            {status}
          </span>
        </div>

        {/* Item preview */}
        <div className="flex items-center gap-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={product?.title}
              className="size-14 rounded-xl object-cover shrink-0 bg-base-200"
            />
          ) : (
            <div className="size-14 rounded-xl bg-base-200 shrink-0 flex items-center justify-center text-base-content/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {product?.title ?? (
                <span className="text-base-content/30 italic">No product</span>
              )}
            </p>
            <p className="text-xs text-base-content/40">
              {item
                ? `x${item.amount ?? 1} · ₦${(item.price ?? 0).toLocaleString()}`
                : "—"}
            </p>
          </div>
        </div>

        <div className="divider my-0" />

        {/* User + total */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-base-content/40">Customer</p>
            <p className="text-sm font-medium truncate">{displayName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-base-content/40">Total</p>
            <p className="text-sm font-semibold text-primary">
              ₦{(order.totalPrice ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {order.ref && (
          <p className="font-mono text-xs text-base-content/30 truncate">
            Ref: {order.ref}
          </p>
        )}
      </div>
    </Link>
  );
}
