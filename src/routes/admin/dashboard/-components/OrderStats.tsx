import { pb } from "#/client/pb";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { OrderDataResponse } from "#/../pocketbase-types";

const STATS: {
  key: keyof Pick<
    OrderDataResponse,
    "totalOrders" | "pending" | "inTransit" | "delivered"
  >;
  label: string;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
}[] = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ShoppingCart,
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    bg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    key: "inTransit",
    label: "In Transit",
    icon: Truck,
    bg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    bg: "bg-success/10",
    iconColor: "text-success",
  },
];

export default function OrderStats() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["order-stats"],
    queryFn: () => pb.collection("orderData").getFullList<OrderDataResponse>(),
  });

  const record = data?.[0];

  if (isError) {
    return <div className="alert alert-error">Failed to load order stats.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(({ key, label, icon: Icon, bg, iconColor }) => (
        <div
          key={key}
          className="card bg-base-100 shadow-sm border border-base-200"
        >
          <div className="card-body gap-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
                {label}
              </span>
              <div className={`${bg} p-2.5 rounded-xl`}>
                <Icon size={18} className={iconColor} />
              </div>
            </div>
            {isPending ? (
              <div className="skeleton h-9 w-20" />
            ) : (
              <p className="text-4xl font-bold tracking-tight">
                {record?.[key] ?? 0}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
