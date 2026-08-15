import { pb } from "#/client/pb";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { Package, LogIn } from "lucide-react";

export const Route = createFileRoute("/profile/orders/")({
  validateSearch: (search: Record<string, unknown>) => ({
    reference:
      typeof search.reference === "string" ? search.reference : undefined,
    page: Number(search.page) || 1,
  }),
  component: RouteComponent,
});

type OrderWithExpand = UserOrdersResponse<{
  orderItems?: OrderItemsResponse<{ originalProduct: ProductsResponse }>[];
  preview?: ProductsResponse;
}>;

function RouteComponent() {
  const { reference, page } = Route.useSearch();
  const isAuthenticated = pb.authStore.isValid;
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
        expand: "preview,orderItems,orderItems.originalProduct",
        filter: filters.length ? filters.join(" && ") : undefined,
      });
    },
    enabled: !!userId && isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="page-wrap py-12 flex flex-col items-center justify-center text-center">
        <div className="card bg-base-100 border border-base-200 shadow-xs max-w-md p-8 flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Package className="size-8" />
          </div>
          <h2 className="text-xl font-bold">My Orders</h2>
          <p className="text-sm text-base-content/60">
            Please log in to view your order history and track order statuses.
          </p>
          <Link to="/login" search={{ redirect: "/profile/orders" }} className="btn btn-primary rounded-xl gap-2 mt-2">
            <LogIn className="size-4" /> Log In to View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">My Orders</h2>
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
              <div className="flex flex-col items-center gap-2 py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200">
                <Package className="size-12 opacity-40" />
                <p className="text-sm font-semibold">
                  {reference
                    ? "No orders match that reference."
                    : "No orders placed yet."}
                </p>
                <p className="text-xs text-base-content/50">
                  {reference
                    ? "Try clearing your search reference filter."
                    : "Your completed orders will appear here."}
                </p>
              </div>
            ) : (
              <GridContainer size="lg">
                {data.items.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </GridContainer>
            )}
            {data.totalPages > 1 && (
              <Pagination page={page} totalPages={data.totalPages} />
            )}
          </div>
        )}
      </PageLoader>
    </div>
  );
}

