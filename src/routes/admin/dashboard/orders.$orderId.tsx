import { createFileRoute, Link } from "@tanstack/react-router";
import { ssr_pb, pb } from "#/client/pb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader.tsx";
import AllOrderItems from "./-components/orders/AllOrderItems";
import type {
  OrderItemsResponse,
  ProductsResponse,
  UserOrdersResponse,
  UsersResponse,
} from "#/../pocketbase-types";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["pending", "processing", "in-transit", "delivered"];

const statusGradient: Record<string, string> = {
  pending:    "from-warning/20 via-warning/5 to-base-200",
  processing: "from-info/20 via-info/5 to-base-200",
  "in-transit": "from-primary/20 via-primary/5 to-base-200",
  delivered:  "from-success/20 via-success/5 to-base-200",
};

const statusBadge: Record<string, string> = {
  pending:    "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered:  "badge-success",
};

const statusDot: Record<string, string> = {
  pending:    "bg-warning border-warning",
  processing: "bg-info border-info",
  "in-transit": "bg-primary border-primary",
  delivered:  "bg-success border-success",
};

type OrderExpand = {
  orderItems?: OrderItemsResponse<{ originalProduct: ProductsResponse }>;
  user?: UsersResponse;
};

export const Route = createFileRoute("/admin/dashboard/orders/$orderId")({
  component: RouteComponent,
  loader: ({ params }) =>
    ssr_pb()
      .collection("user_orders")
      .getOne(params.orderId, {
        expand: "orderItems,orderItems.originalProduct,user",
      }),
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () =>
      pb.collection("user_orders").getOne<UserOrdersResponse>(orderId, {
        expand: "orderItems,orderItems.originalProduct,user",
      }),
    initialData: loaderData,
  });

  const statusMut = useMutation({
    mutationFn: (status: string) =>
      pb.collection("user_orders").update(orderId, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order", orderId] }),
  });

  return (
    <main className="dash-wrap p-6 flex flex-col gap-6">
      <Link
        to="/admin/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content w-fit transition-colors"
      >
        <ArrowLeft size={14} />
        Orders
      </Link>

      <PageLoader query={query}>
        {(order) => {
          const expand = order.expand as OrderExpand | undefined;
          const item = expand?.orderItems;
          const user = expand?.user;
          const status = order.status ?? "pending";
          const gradient = statusGradient[status] ?? "from-base-200 to-base-200";
          const displayName =
            user?.username || user?.email || `#${order.user.slice(0, 8)}`;
          const currentStatusIdx = STATUSES.indexOf(status);

          return (
            <div className="flex flex-col gap-5">

              {/* Hero header */}
              <div className={`rounded-3xl bg-gradient-to-br ${gradient} p-7 relative overflow-hidden`}>
                {/* Decorative circle */}
                <div className="absolute -right-12 -top-12 size-48 rounded-full bg-current opacity-5" />
                <div className="absolute -right-4 -bottom-8 size-32 rounded-full bg-current opacity-5" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <span className={`badge badge-lg ${statusBadge[status] ?? "badge-neutral"} capitalize w-fit`}>
                      {status}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                        Order ID
                      </p>
                      <h1 className="text-2xl font-black font-mono tracking-tight mt-0.5">
                        #{order.id.slice(0, 12)}
                      </h1>
                    </div>
                    <p className="text-sm text-base-content/50">
                      {new Date(order.created).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Total pill */}
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-base-content/40 mb-0.5">Total</p>
                    <p className="text-3xl font-black tabular-nums">
                      ₦{(order.totalPrice ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="relative flex flex-wrap gap-4 mt-5 pt-5 border-t border-current/10">
                  <MetaPill label="Customer" value={displayName} />
                  {order.ref && (
                    <MetaPill label="Reference" value={order.ref} mono />
                  )}
                </div>
              </div>

              {/* Product */}
              {item && <AllOrderItems item={item} />}

              {/* Status stepper */}
              <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body p-6 gap-5">
                  <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                    Order progress
                  </p>

                  <div className="flex items-start">
                    {STATUSES.map((s, i) => {
                      const passed = i <= currentStatusIdx;
                      const active = i === currentStatusIdx;
                      return (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                          <button
                            className="flex flex-col items-center gap-2 group"
                            disabled={statusMut.isPending}
                            onClick={() =>
                              toast.promise(statusMut.mutateAsync(s), {
                                loading: "Updating...",
                                success: `Set to ${s}.`,
                                error: "Failed.",
                              })
                            }
                          >
                            <div
                              className={`size-9 rounded-full border-2 flex items-center justify-center transition-all
                                ${active ? `${statusDot[s]} text-white scale-110 shadow-md` : ""}
                                ${passed && !active ? `${statusDot[s]} text-white opacity-60` : ""}
                                ${!passed ? "border-base-300 bg-base-200 text-base-content/30" : ""}
                                group-hover:scale-110
                              `}
                            >
                              {passed ? (
                                <Check size={14} strokeWidth={3} />
                              ) : (
                                <span className="text-xs font-bold">{i + 1}</span>
                              )}
                            </div>
                            <span
                              className={`text-xs capitalize font-medium whitespace-nowrap ${active ? "text-base-content" : "text-base-content/40"}`}
                            >
                              {s}
                            </span>
                          </button>

                          {i < STATUSES.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                                i < currentStatusIdx ? "bg-success" : "bg-base-300"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          );
        }}
      </PageLoader>
    </main>
  );
}

function MetaPill({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-base-content/40">{label}</p>
      <p className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
