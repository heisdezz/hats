import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import ProductDetails from "#/routes/profile/-components/ProductDetails";
import type { OrdersResponse, ProductsResponse } from "#/../pocketbase-types";
import { Link } from "@tanstack/react-router";

const statusColor: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

export const Route = createFileRoute("/profile/orders/$orderId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
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
    <div className="page-wrap">
      <Link
        to="/profile/orders"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content mb-4"
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
          const subtotal = (order.Price ?? 0) - (order.deliveryFee ?? 0);
          const order_item_details = (order as any).itemDetails as
            | Checkout_CartItem[]
            | undefined;
          return (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">Order details</h2>
                  <p className="text-xs font-mono text-base-content/40 mt-0.5">
                    #{order.id}
                  </p>
                </div>
                <span className={`badge ${badgeClass} capitalize`}>
                  {status}
                </span>
              </div>

              <div className="text-xs text-base-content/40">
                Placed on{" "}
                {new Date(order.created).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {product && <ProductDetails product={product} />}

              {order_item_details && order_item_details.length > 0 && (
                <div className="card bg-base-200 shadow-none">
                  <div className="card-body p-4 gap-3">
                    <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                      Items ({order_item_details.length})
                    </p>
                    <div className="flex flex-col gap-3">
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
                                className="size-12 rounded-lg object-cover shrink-0 bg-base-300"
                              />
                            ) : (
                              <div className="size-12 rounded-lg bg-base-300 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {pd.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {pd.mainColor && (
                                  <span
                                    className="size-3 rounded-full border border-base-content/20 inline-block"
                                    style={{ backgroundColor: pd.mainColor }}
                                  />
                                )}
                                {pd.secondaryColor && (
                                  <span
                                    className="size-3 rounded-full border border-base-content/20 inline-block"
                                    style={{
                                      backgroundColor: pd.secondaryColor,
                                    }}
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
                  </div>
                </div>
              )}

              <div className="card bg-base-200 shadow-none">
                <div className="card-body p-4 gap-3">
                  <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                    Summary
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Subtotal</span>
                      <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Delivery</span>
                      <span>₦{(order.deliveryFee ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="divider my-0" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">
                        ₦{(order.Price ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {order.fullAdress && (
                <div className="card bg-base-200 shadow-none">
                  <div className="card-body p-4 gap-2">
                    <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                      Delivery address
                    </p>
                    <p className="text-sm">{order.fullAdress}</p>
                  </div>
                </div>
              )}

              {order.extraInfo && (
                <div className="card bg-base-200 shadow-none">
                  <div className="card-body p-4 gap-2">
                    <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                      Extra info
                    </p>
                    <p className="text-sm text-base-content/70">
                      {order.extraInfo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </PageLoader>
    </div>
  );
}
