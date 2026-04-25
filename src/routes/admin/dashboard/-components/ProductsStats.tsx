import { pb } from "#/client/pb";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, Gem } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProductsDataResponse } from "pocketbase-types";

const STATS: {
  key: keyof Pick<ProductsDataResponse, "totalProducts" | "hats" | "jewelry">;
  label: string;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
}[] = [
  {
    key: "totalProducts",
    label: "Total Products",
    icon: Package,
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    key: "hats",
    label: "Hats",
    icon: ShoppingBag,
    bg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    key: "jewelry",
    label: "Jewelry",
    icon: Gem,
    bg: "bg-accent/10",
    iconColor: "text-accent",
  },
];

export default function ProductStats() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["products-stats"],
    queryFn: () => pb.collection("productsData").getFullList(),
  });

  const record = data?.[0];

  if (isError) {
    return (
      <div className="alert alert-error">Failed to load product stats.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 px-0">
      {STATS.map(({ key, label, icon: Icon, bg, iconColor }) => (
        <div
          key={key}
          className="card bg-base-100 shadow-sm border border-base-200"
        >
          <div className="card-body gap-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-base-content/60 uppercase tracking-wider">
                {label}
              </span>
              <div className={`${bg} p-2.5 rounded-xl`}>
                <Icon size={20} className={iconColor} />
              </div>
            </div>
            {isPending ? (
              <div className="skeleton h-9 w-24" />
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
