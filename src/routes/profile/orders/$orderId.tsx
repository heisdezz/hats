import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import UserOrderItems from "#/routes/profile/-components/UserOrderItems";
import RelatedOrders from "#/routes/profile/-components/RelatedOrders";
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

const statusGradient: Record<string, string> = {
  pending: "from-warning/15 via-warning/5 to-base-100",
  processing: "from-info/15 via-info/5 to-base-100",
  "in-transit": "from-primary/15 via-primary/5 to-base-100",
  delivered: "from-success/15 via-success/5 to-base-100",
};

type OrderWithExpand = UserOrdersResponse<{
  orderItems?: OrderItemsResponse<{ originalProduct: ProductsResponse }>[];
}>;

export const Route = createFileRoute("/profile/orders/$orderId")({
  component: RouteComponent,
  validateSearch: (search: any): any => search,
});

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card bg-base-200 shadow-none">
      <div className="card-body p-5 gap-3">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

function RouteComponent() {
  const { orderId } = Route.useParams();
  const nav = useNavigate();

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () =>
      pb.collection("user_orders").getOne<OrderWithExpand>(orderId, {
        expand: "orderItems,orderItems.originalProduct",
      }),
  });

  return (
    <div className="page-wrap flex flex-col gap-5">
      <Link
        to="/profile/orders"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content w-fit transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Orders
      </Link>

      <PageLoader query={query}>
        {(order) => {
          const status = order.status ?? "pending";
          const badgeClass = statusColor[status] ?? "badge-neutral";
          const gradient =
            statusGradient[status] ?? "from-base-200 to-base-100";
          const items = ((order.expand as any)?.orderItems as
            | OrderItemsResponse<{ originalProduct: ProductsResponse }>[]
            | undefined) ?? [];

          return (
            <div className="flex flex-col gap-4">
              {/* Hero header */}
              <div
                className={`rounded-3xl bg-gradient-to-br ${gradient} p-6 relative overflow-hidden`}
              >
                <div className="absolute -right-8 -top-8 size-36 rounded-full bg-current opacity-[0.04]" />
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-base-content/40 font-semibold uppercase tracking-widest mb-1">
                        Order
                      </p>
                      <h2 className="text-xl font-black font-mono tracking-tight">
                        #{order.id.slice(0, 12)}
                      </h2>
                    </div>
                    <span
                      className={`badge badge-lg ${badgeClass} capitalize shrink-0`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-sm text-base-content/50">
                    {new Date(order.created).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-current/10">
                    <div>
                      <p className="text-xs text-base-content/40">Total</p>
                      <p className="text-2xl font-black">
                        ₦{(order.totalPrice ?? 0).toLocaleString()}
                      </p>
                    </div>

                    {order.ref && (
                      <button
                        onClick={() =>
                          nav({
                            to: "/profile/orders/",
                            search: { reference: order.ref, page: 1 },
                          })
                        }
                        className="flex flex-col items-end gap-0.5"
                      >
                        <p className="text-xs text-base-content/40">
                          Reference
                        </p>
                        <p className="font-mono text-sm px-2.5 py-1 rounded-full bg-base-200/80 hover:bg-primary hover:text-primary-content transition-colors">
                          {order.ref}
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order item */}
              {items.length > 0 && <UserOrderItems items={items} />}

              {/* Related orders */}
              {/*{order.ref && (
                <RelatedOrders reference={order.ref} currentId={order.id} />
              )}*/}
            </div>
          );
        }}
      </PageLoader>
    </div>
  );
}
