import { pb } from "#/client/pb";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader";
import OrderCard from "#/routes/profile/-components/OrderCard";
import OrderSearch from "#/routes/profile/-components/OrderSearch";
import Pagination from "#/components/Pagination";
import type {
  OrderItemsResponse,
  ProductsResponse,
  UserOrdersResponse,
} from "#/../pocketbase-types";
import GridContainer from "#/components/GridContainer";

export const Route = createFileRoute("/profile/orders/")({
  validateSearch: (search: Record<string, unknown>) => ({
    reference:
      typeof search.reference === "string" ? search.reference : undefined,
    page: Number(search.page) || 1,
  }),
  component: RouteComponent,
});

type OrderWithExpand = UserOrdersResponse<{
  orderItems?: OrderItemsResponse<{ originalProduct: ProductsResponse }>;
}>;

function RouteComponent() {
  const { reference, page } = Route.useSearch();
  const userId = pb.authStore.record?.id;

  const query = useQuery({
    queryKey: ["user-orders", reference, page, userId],
    queryFn: () => {
      const filters = [
        userId ? pb.filter("user = {:uid}", { uid: userId }) : "",
        reference ? pb.filter("ref = {:ref}", { ref: reference }) : "",
      ].filter(Boolean);

      return pb.collection("user_orders").getList<OrderWithExpand>(page, 10, {
        sort: "-created",
        expand: "orderItems,orderItems.originalProduct",
        filter: filters.length ? filters.join(" && ") : undefined,
      });
    },
    enabled: !!userId,
  });

  return (
    <div className="page-wrap flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Orders</h2>
      </div>

      <OrderSearch defaultValue={reference ?? ""} />

      {reference && (
        <p className="text-xs text-base-content/40">
          Showing results for reference{" "}
          <span className="font-mono text-base-content/60">{reference}</span>
        </p>
      )}

      <PageLoader query={query}>
        {(data) => (
          <div className="flex flex-col gap-4">
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
                <p className="text-sm">
                  {reference
                    ? "No orders match that reference."
                    : "No orders yet."}
                </p>
              </div>
            ) : (
              <GridContainer size="lg">
                {data.items.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </GridContainer>
            )}
            <Pagination page={page} totalPages={data.totalPages} />
          </div>
        )}
      </PageLoader>
    </div>
  );
}
