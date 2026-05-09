import { pb, ssr_pb } from "#/client/pb";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader";
import Pagination from "#/components/Pagination";
import GridContainer from "#/components/GridContainer";
import OrderCard from "./-components/orders/OrderCard";
import type { UserOrdersResponse } from "#/../pocketbase-types";

export const Route = createFileRoute("/admin/dashboard/orders/")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: Number(s.page) || 1,
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  component: RouteComponent,
  loader: () =>
    ssr_pb().collection("user_orders").getList(1, 20, {
      sort: "-created",
      expand: "preview,orderItems,user",
    }),
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const { page, status } = Route.useSearch();
  const nav = useNavigate();

  const query = useQuery({
    queryKey: ["admin-orders", page, status],
    queryFn: () =>
      pb.collection("user_orders").getList<UserOrdersResponse>(page, 20, {
        sort: "-created",
        expand: "preview,orderItems,user",
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

        <div className="join">
          <button
            onClick={() =>
              nav({
                to: "/admin/dashboard/orders",
                search: (prev) => ({ ...prev, page: 1, status: "pending" }),
              })
            }
            className={`join-item btn ${!status ? "btn-active" : "btn-ghost"}`}
          >
            All
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() =>
                nav({
                  to: "/admin/dashboard/orders",
                  search: { status: s, page: 1 },
                })
              }
              className={`join-item btn capitalize ${status === s ? "btn-active" : "btn-ghost"}`}
            >
              {s}
            </button>
          ))}
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
              <GridContainer>
                {data.items.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </GridContainer>
              <Pagination page={page} totalPages={data.totalPages} />
            </div>
          )
        }
      </PageLoader>
    </section>
  );
}
