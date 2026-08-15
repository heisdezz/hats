import { createFileRoute, Link } from "@tanstack/react-router";
import ProductStats from "./-components/ProductsStats";
import WelcomeHeader from "./-components/Welcomeheader";
import OrderStats from "./-components/OrderStats";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import OrderCard from "./-components/orders/OrderCard";
import GridContainer from "#/components/GridContainer";
import { ArrowRight, ShoppingCart } from "lucide-react";
import type { UserOrdersResponse } from "#/../pocketbase-types";

export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const recentOrdersQuery = useQuery({
    queryKey: ["recent-admin-orders"],
    queryFn: () =>
      pb.collection("user_orders").getList<UserOrdersResponse>(1, 6, {
        sort: "-created",
        expand: "preview,orderItems,user",
      }),
  });

  return (
    <div className="dash-wrap pb-12 space-y-8">
      <WelcomeHeader />

      {/* Orders Performance */}
      <div className="flex flex-col gap-3 px-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
            Order Metrics
          </p>
        </div>
        <OrderStats />
      </div>

      {/* Products Performance */}
      <div className="flex flex-col gap-3 px-6">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          Catalog Snapshot
        </p>
        <ProductStats />
      </div>

      {/* Recent Orders Stream */}
      <div className="flex flex-col gap-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" />
            <h2 className="text-base font-bold">Recent Orders</h2>
          </div>
          <Link
            to="/admin/dashboard/orders"
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            View All Orders <ArrowRight className="size-3" />
          </Link>
        </div>

        <PageLoader query={recentOrdersQuery}>
          {({ items }) =>
            items.length === 0 ? (
              <div className="card bg-base-100 border border-base-200 p-8 text-center text-base-content/40 text-sm">
                No recent orders placed.
              </div>
            ) : (
              <GridContainer>
                {items.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </GridContainer>
            )
          }
        </PageLoader>
      </div>
    </div>
  );
}
