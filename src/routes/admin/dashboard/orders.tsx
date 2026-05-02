import { pb, ssr_pb } from "#/client/pb";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader";
import Pagination from "#/components/Pagination";
import type { OrdersResponse } from "#/../pocketbase-types";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

export const Route = createFileRoute("/admin/dashboard/orders")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: Number(s.page) || 1,
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  component: RouteComponent,
  loader: ({ context }) =>
    ssr_pb().collection("orders").getList(1, 20, { sort: "-created" }),
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const { page, status } = Route.useSearch();

  const query = useQuery({
    queryKey: ["admin-orders", page, status],
    queryFn: () =>
      pb.collection("orders").getList<OrdersResponse>(page, 20, {
        sort: "-created",
        filter: status ? `status = "${status}"` : undefined,
      }),
    initialData: page === 1 && !status ? loaderData : undefined,
  });

  const statuses = ["pending", "processing", "in-transit", "delivered"];

  return (
    <section className="page-wrap flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Orders</h2>
          {query.data && (
            <p className="text-sm text-base-content/40 mt-0.5">
              {query.data.totalItems} total
            </p>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusFilter current={status} statuses={statuses} />
        </div>
      </div>

      <PageLoader query={query}>
        {(data) =>
          data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-base-content/40">
              <p className="text-sm">No orders found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto rounded-xl border border-base-200">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/60 text-xs uppercase tracking-wider text-base-content/50">
                      <th>Order ID</th>
                      <th>Reference</th>
                      <th>Date</th>
                      <th className="text-center">Status</th>
                      <th className="text-right">Delivery</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((order) => {
                      const orderStatus = order.status ?? "pending";
                      const badgeClass =
                        statusColor[orderStatus] ?? "badge-neutral";
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-base-200/40 transition-colors"
                        >
                          <td>
                            <span className="font-mono text-xs text-base-content/60">
                              #{order.id.slice(0, 10)}
                            </span>
                          </td>
                          <td>
                            {order.reference ? (
                              <span className="font-mono text-xs bg-base-200 px-2 py-0.5 rounded-full">
                                {order.reference}
                              </span>
                            ) : (
                              <span className="text-xs text-base-content/30">—</span>
                            )}
                          </td>
                          <td className="text-xs text-base-content/60 whitespace-nowrap">
                            {new Date(order.created).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="text-center">
                            <span
                              className={`badge badge-sm ${badgeClass} capitalize`}
                            >
                              {orderStatus}
                            </span>
                          </td>
                          <td className="text-right text-sm">
                            ₦{(order.deliveryFee ?? 0).toLocaleString()}
                          </td>
                          <td className="text-right font-semibold text-sm text-primary">
                            ₦{(order.price ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination page={page} totalPages={data.totalPages} />
            </div>
          )
        }
      </PageLoader>
    </section>
  );
}

function StatusFilter({
  current,
  statuses,
}: {
  current: string | undefined;
  statuses: string[];
}) {
  return (
    <div className="join">
      <a
        href="/admin/dashboard/orders?page=1"
        className={`join-item btn btn-xs ${!current ? "btn-active" : "btn-ghost"}`}
      >
        All
      </a>
      {statuses.map((s) => (
        <a
          key={s}
          href={`/admin/dashboard/orders?status=${s}&page=1`}
          className={`join-item btn btn-xs capitalize ${current === s ? "btn-active" : "btn-ghost"}`}
        >
          {s}
        </a>
      ))}
    </div>
  );
}
