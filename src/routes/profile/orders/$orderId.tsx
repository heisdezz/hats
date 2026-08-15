import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb, ssr_pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import UserOrderItems from "#/routes/profile/-components/UserOrderItems";
import type {
  CategoryResponse,
  OrderItemsResponse,
  ProductsResponse,
  SectionResponse,
  UserOrdersResponse,
} from "#/../pocketbase-types";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  HelpCircle,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

const ORDER_STEPS = [
  { id: "pending", label: "Order Placed", icon: Clock },
  { id: "processing", label: "Crafting & Prep", icon: Package },
  { id: "in-transit", label: "In Transit", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
];

type ItemWithProduct = OrderItemsResponse<{
  originalProduct?: ProductsResponse<{
    category?: CategoryResponse<{ parent?: SectionResponse }>;
  }>;
}>;

type OrderWithExpand = UserOrdersResponse<{
  orderItems?: ItemWithProduct[];
}>;

export const Route = createFileRoute("/profile/orders/$orderId")({
  component: RouteComponent,
  validateSearch: (search: any): any => search,
  loader: async ({ params }) => {
    return await ssr_pb()
      .collection("user_orders")
      .getOne<OrderWithExpand>(params.orderId, {
        expand: "orderItems,orderItems.originalProduct,orderItems.originalProduct.category.parent",
      });
  },
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const nav = useNavigate();
  const [copiedRef, setCopiedRef] = useState(false);

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () =>
      pb.collection("user_orders").getOne<OrderWithExpand>(orderId, {
        expand: "orderItems,orderItems.originalProduct,orderItems.originalProduct.category.parent",
      }),
    initialData: loaderData,
  });

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    toast.success("Order reference copied to clipboard!");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="page-wrap py-6 space-y-6 max-w-5xl">
      {/* Back Button */}
      <Link
        to="/profile/orders"
        search={{ page: 1, reference: undefined }}
        className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-base-content transition-colors font-medium"
      >
        <ArrowLeft className="size-4" />
        <span>Back to My Orders</span>
      </Link>

      <PageLoader query={query}>
        {(order) => {
          const status = order.status ?? "pending";
          const badgeClass = statusColor[status] ?? "badge-neutral";
          const gradient = statusGradient[status] ?? "from-base-200 to-base-100";
          const items =
            ((order.expand as any)?.orderItems as ItemWithProduct[] | undefined) ?? [];

          const currentStepIndex = ORDER_STEPS.findIndex((s) => s.id === status);

          return (
            <div className="space-y-6">
              {/* Hero Status Banner */}
              <div
                className={`rounded-3xl bg-gradient-to-br ${gradient} border border-base-200/80 p-6 md:p-8 relative overflow-hidden shadow-xs`}
              >
                <div className="relative flex flex-col gap-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-base-content/50">
                          Order Confirmation
                        </span>
                        <span className={`badge badge-sm font-bold uppercase tracking-wider ${badgeClass}`}>
                          {status}
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-3xl font-mono font-black tracking-tight text-base-content mt-1">
                        #{order.id}
                      </h1>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-base-content/50 uppercase font-bold tracking-wider">
                        Total Amount Paid
                      </p>
                      <p className="text-2xl md:text-3xl font-extrabold text-primary">
                        ₦{(order.totalPrice ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-base-content/10 text-xs text-base-content/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-base-content/40" />
                      <span>
                        Placed on{" "}
                        <strong>
                          {new Date(order.created).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>

                    {order.ref && (
                      <div className="flex items-center gap-2">
                        <span className="text-base-content/40">Paystack Ref:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(order.ref!)}
                          className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-base-100/80 hover:bg-base-100 border border-base-200 shadow-2xs inline-flex items-center gap-1.5 transition-all"
                          title="Click to copy reference"
                        >
                          <span>{order.ref}</span>
                          <Copy className="size-3 text-base-content/40" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Progress Stepper */}
                  <div className="pt-4 border-t border-base-content/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
                      Order Fulfillment Status
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {ORDER_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div
                            key={step.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                              isCurrent
                                ? "bg-base-100 border-primary shadow-xs font-bold"
                                : isDone
                                ? "bg-base-100/80 border-success/30 text-success"
                                : "bg-base-100/30 border-base-200 opacity-40"
                            }`}
                          >
                            <div
                              className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isCurrent
                                  ? "bg-primary text-primary-content"
                                  : isDone
                                  ? "bg-success/15 text-success"
                                  : "bg-base-200 text-base-content/30"
                              }`}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="text-xs">
                              <p className="font-semibold leading-tight text-base-content">
                                {step.label}
                              </p>
                              <p className="text-[10px] text-base-content/50">
                                {isDone ? (isCurrent ? "In Progress" : "Completed") : "Upcoming"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && <UserOrderItems items={items} />}

              {/* Order Info & Assistance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fulfillment / Delivery Info */}
                <div className="card bg-base-100 border border-base-200 p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-base-content">
                    <Truck className="size-4 text-primary" />
                    <span>Shipping & Dispatch</span>
                  </div>

                  <div className="space-y-2 text-xs text-base-content/70">
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 text-base-content/40 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-base-content">Studio Pickup or Courier</p>
                        <p className="text-base-content/50 mt-0.5">
                          Orders are prepared and dispatched from our Lagos studio within 2–4 business days.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2 border-t border-base-200">
                      <CreditCard className="size-4 text-base-content/40 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-base-content">Payment Verified</p>
                        <p className="text-base-content/50 mt-0.5">
                          Secured via Paystack Inline checkout with automated fulfillment verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Support */}
                <div className="card bg-base-100 border border-base-200 p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-base-content">
                    <HelpCircle className="size-4 text-primary" />
                    <span>Need Assistance with this Order?</span>
                  </div>

                  <p className="text-xs text-base-content/60 leading-relaxed">
                    Have questions regarding custom sizing, bespoke modifications, or delivery timelines? Our artisan studio team is available to help.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <Link
                      to="/store/catalog"
                      className="btn btn-sm btn-ghost border border-base-200 rounded-xl text-xs flex-1"
                    >
                      Browse More Pieces
                    </Link>
                    <a
                      href={`mailto:support@dezzhats.com?subject=Inquiry for Order #${order.id}`}
                      className="btn btn-sm btn-primary rounded-xl text-xs flex-1"
                    >
                      Contact Studio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </PageLoader>
    </div>
  );
}
