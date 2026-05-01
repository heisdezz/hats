import { pb } from "#/client/pb";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader";
import OrderCard from "#/routes/profile/-components/OrderCard";
import type { OrdersResponse } from "#/../pocketbase-types";
import GridContainer from "#/components/GridContainer";

export const Route = createFileRoute("/profile/orders/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      pb.collection("orders").getList<OrdersResponse>(1, 10, {
        sort: "-created",
      }),
  });

  return (
    <div className="page-wrap">
      <h2 className="text-lg font-semibold">My Orders</h2>
      <PageLoader query={query}>
        {(data) => (
          <div className="flex flex-col gap-3">
            {data.items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-base-content/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <GridContainer>
                {data.items.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </GridContainer>
            )}
          </div>
        )}
      </PageLoader>
    </div>
  );
}
