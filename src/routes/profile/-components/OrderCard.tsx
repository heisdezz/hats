import type { OrdersResponse } from "#/../pocketbase-types";
import { Link } from "@tanstack/react-router";
import { pb } from "#/client/pb";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

export default function OrderCard({ order }: { order: OrdersResponse }) {
  const status = order.status ?? "pending";
  const badgeClass = statusColor[status] ?? "badge-neutral";
  const item = (order as any).itemDetails as Checkout_CartItem | undefined;
  const pd = item?.product_details;
  const imgFile = pd?.preview || pd?.images?.[0];
  const imgUrl = imgFile && pd ? pb.files.getURL(pd, imgFile) : null;

  return (
    <Link
      to="/profile/orders/$orderId"
      params={{ orderId: order.id }}
      className="card bg-base-100 border border-base-200 shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="card-body gap-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-mono text-base-content/40">
              #{order.id.slice(0, 8)}
            </p>
            <p className="text-xs text-base-content/40">
              {new Date(order.created).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <span className={`badge badge-sm ${badgeClass} capitalize`}>
            {status}
          </span>
        </div>

        {/* Item row */}
        {item && pd && (
          <div className="flex items-center gap-3">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={pd.title}
                className="size-12 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="size-12 rounded-lg bg-base-300 shrink-0 flex items-center justify-center text-base-content/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
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
              <p className="text-sm font-medium truncate">{pd.title}</p>
              <p className="text-xs text-base-content/40">
                x{item.amount} &middot; ₦{item.price.toLocaleString()} each
              </p>
              {(pd.mainColor || pd.secondaryColor) && (
                <div className="flex items-center gap-1 mt-1">
                  {pd.mainColor && (
                    <span
                      className="size-3 rounded-full border border-base-content/20 inline-block"
                      style={{ backgroundColor: pd.mainColor }}
                    />
                  )}
                  {pd.secondaryColor && (
                    <span
                      className="size-3 rounded-full border border-base-content/20 inline-block"
                      style={{ backgroundColor: pd.secondaryColor }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="divider my-0" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-base-content/40 text-xs">Delivery</span>
              <span className="font-medium">
                ₦{(order.deliveryFee ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-base-content/40 text-xs">Total</span>
              <span className="font-semibold text-primary">
                ₦{(order.Price ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 text-base-content/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
