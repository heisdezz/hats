import { pb } from "#/client/pb";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { OrdersResponse } from "#/../pocketbase-types";
import CompLoader from "#/components/layouts/ComponentLoader";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

const loadingSkeleton = (
  <div className="card bg-base-200 shadow-none">
    <div className="card-body p-4 gap-3">
      <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
        Related orders
      </p>
      <div className="flex flex-col gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default function RelatedOrders({
  reference,
  currentId,
}: {
  reference: string;
  currentId: string;
}) {
  const query = useQuery({
    queryKey: ["orders-by-ref", reference],
    queryFn: () =>
      pb
        .collection("orders")
        .getFullList<OrdersResponse>({ filter: `reference = "${reference}"` }),
    enabled: !!reference,
  });

  return (
    <CompLoader query={query} customLoading={loadingSkeleton}>
      {(data) => {
        const others = data.filter((o) => o.id !== currentId);
        if (others.length === 0)
          return (
            <div className="card bg-base-200 shadow-none">
              <div className="card-body p-4 gap-1">
                <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                  Related orders
                </p>
                <p className="text-sm text-base-content/40">
                  No other orders from this reference.
                </p>
              </div>
            </div>
          );

        return (
          <div className="card bg-base-200 shadow-none">
            <div className="card-body p-4 gap-3">
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                Related orders ({others.length})
              </p>
              <div className="flex flex-col gap-2">
                {others.map((order) => {
                  const status = order.status ?? "pending";
                  const badgeClass = statusColor[status] ?? "badge-neutral";
                  return (
                    <Link
                      key={order.id}
                      to="/profile/orders/$orderId"
                      params={{ orderId: order.id }}
                      className="flex items-center justify-between gap-3 rounded-lg bg-base-100 px-3 py-2.5 hover:bg-base-300 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="text-xs font-mono text-base-content/40 truncate">
                          #{order.id.slice(0, 10)}
                        </p>
                        <p className="text-xs text-base-content/40">
                          {new Date(order.created).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold">
                          ₦{(order.price ?? 0).toLocaleString()}
                        </span>
                        <span
                          className={`badge badge-sm ${badgeClass} capitalize`}
                        >
                          {status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }}
    </CompLoader>
  );
}
