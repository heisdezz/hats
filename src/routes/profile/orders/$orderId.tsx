import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import ProductDetails from "#/routes/profile/-components/ProductDetails";
import RelatedOrders from "#/routes/profile/-components/RelatedOrders";
import type { OrdersResponse, ProductsResponse } from "#/../pocketbase-types";
import { Link, useNavigate } from "@tanstack/react-router";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

export const Route = createFileRoute("/profile/orders/$orderId")({
  component: RouteComponent,
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
      pb
        .collection("orders")
        .getOne<OrdersResponse<{ product: ProductsResponse }>>(orderId, {
          expand: "product",
        }),
  });

  return (
    <div className="page-wrap flex flex-col gap-5">
      <Link
        to="/profile/orders"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content w-fit"
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
          const product = order.expand?.product;
          const subtotal = (order.price ?? 0) - (order.deliveryFee ?? 0);
          const order_item_details = (order as any).itemDetails as
            | Checkout_CartItem[]
            | undefined;

          return (
            <div className="flex flex-col gap-4">
              {/* Page header */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Order details</h2>
                    <p className="text-xs font-mono text-base-content/40 mt-1">
                      #{order.id}
                    </p>
                  </div>
                  <span className={`badge badge-lg ${badgeClass} capitalize shrink-0`}>
                    {status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-base-content/40">
                  <span>
                    Placed{" "}
                    {new Date(order.created).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {order.reference && (
                    <span className="flex items-center gap-1.5">
                      <span>Ref:</span>
                      <button
                        onClick={() =>
                          nav({
                            to: "/profile/orders/",
                            search: { reference: order.reference, page: 1 },
                          })
                        }
                        className="font-mono px-2 py-0.5 rounded-full bg-base-200 hover:bg-primary hover:text-primary-content transition-colors text-base-content/60"
                        title="Search orders by this reference"
                      >
                        {order.reference}
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Product (expanded) */}
              {product && <ProductDetails product={product} />}

              {/* Items from checkout */}
              {order_item_details && order_item_details.length > 0 && (
                <Section label={`Items (${order_item_details.length})`}>
                  <div className="flex flex-col gap-4">
                    {order_item_details.map((item, i) => {
                      const pd = item.product_details;
                      const imgFile = pd.preview || pd.images?.[0];
                      const imgUrl = imgFile
                        ? pb.files.getURL(pd, imgFile)
                        : null;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={pd.title}
                              className="size-14 rounded-xl object-cover shrink-0 bg-base-300"
                            />
                          ) : (
                            <div className="size-14 rounded-xl bg-base-300 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {pd.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {pd.mainColor && (
                                <span
                                  className="size-3.5 rounded-full border border-base-content/20"
                                  style={{ backgroundColor: pd.mainColor }}
                                />
                              )}
                              {pd.secondaryColor && (
                                <span
                                  className="size-3.5 rounded-full border border-base-content/20"
                                  style={{ backgroundColor: pd.secondaryColor }}
                                />
                              )}
                              <span className="text-xs text-base-content/40">
                                x{item.amount}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold shrink-0">
                            ₦{(item.price * item.amount).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Summary */}
              <Section label="Summary">
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Delivery fee</span>
                    <span>₦{(order.deliveryFee ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="divider my-0" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-primary">
                      ₦{(order.price ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Section>

              {/* Delivery address */}
              {order.fullAdress && (
                <Section label="Delivery address">
                  <p className="text-sm leading-relaxed">{order.fullAdress}</p>
                </Section>
              )}

              {/* Extra info */}
              {order.extraInfo && (
                <Section label="Extra info">
                  <p className="text-sm text-base-content/70 leading-relaxed">
                    {order.extraInfo}
                  </p>
                </Section>
              )}

              {/* Related orders */}
              {order.reference && (
                <RelatedOrders
                  reference={order.reference}
                  currentId={order.id}
                />
              )}
            </div>
          );
        }}
      </PageLoader>
    </div>
  );
}
