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

type OrderWithExpand = UserOrdersResponse<{
  orderItems?: OrderItemsResponse<{ originalProduct: ProductsResponse }>;
}>;

export default function OrderCard({ order }: { order: OrderWithExpand }) {
  const nav = useNavigate();
  const status = order.status ?? "pending";
  const badgeClass = statusColor[status] ?? "badge-neutral";

  const item = (order.expand as any)?.orderItems as
    | OrderItemsResponse<{ originalProduct: ProductsResponse }>
    | undefined;
  const product = (item?.expand as any)?.originalProduct as
    | ProductsResponse
    | undefined;

  const imgFile = product?.preview || product?.images?.[0];
  const imgUrl = imgFile && product ? pb.files.getURL(product, imgFile) : null;

  return (
    <Link
      to="/profile/orders/$orderId"
      params={{ orderId: order.id }}
      className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
    >
      <div className="card-body gap-0 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-mono text-base-content/40">
              #{order.id.slice(0, 10)}
            </p>
            <p className="text-xs text-base-content/40">
              {new Date(order.created).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <span className={`badge ${badgeClass} capitalize shrink-0`}>
            {status}
          </span>
        </div>

        {/* Item row */}
        {product && (
          <div className="flex items-center gap-4 mb-4">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={product.title}
                className="size-14 rounded-xl object-cover shrink-0 bg-base-200"
              />
            ) : (
              <div className="size-14 rounded-xl bg-base-200 shrink-0 flex items-center justify-center text-base-content/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <p className="text-sm font-semibold truncate leading-tight">
                {product.title}
              </p>
              {item && (
                <p className="text-xs text-base-content/40">
                  ×{item.amount ?? 1} &middot; ₦{(item.price ?? 0).toLocaleString()} each
                </p>
              )}
              {(product.mainColor || product.secondaryColor) && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {product.mainColor && (
                    <span className="size-3.5 rounded-full border border-base-content/20" style={{ backgroundColor: product.mainColor }} />
                  )}
                  {product.secondaryColor && (
                    <span className="size-3.5 rounded-full border border-base-content/20" style={{ backgroundColor: product.secondaryColor }} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="divider my-0 mb-4" />

        {/* Reference */}
        {order.ref && (
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs text-base-content/40">Reference</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nav({ to: "/profile/orders/", search: { reference: order.ref, page: 1 } });
              }}
              className="font-mono text-xs px-2.5 py-1 rounded-full bg-base-200 hover:bg-primary hover:text-primary-content transition-colors truncate max-w-[60%]"
            >
              {order.ref}
            </button>
          </div>
        )}

        {/* Total + chevron */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-base-content/40 mb-0.5">Total</p>
            <p className="text-sm font-semibold text-primary">
              ₦{(order.totalPrice ?? 0).toLocaleString()}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4 text-base-content/30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
