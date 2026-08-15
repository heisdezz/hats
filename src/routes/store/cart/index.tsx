import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import CartItems from "./-components/CartItems";
import CartTotal from "./-components/CartTotal";
import { pb } from "#/client/pb";
import { useQuery } from "@tanstack/react-query";
import DeliverySettings from "#/components/DeliverySettings.tsx";
import { ShoppingBag, LogIn, PackageOpen, Sparkles } from "lucide-react";

export type CartProductDetails = {
  id: string;
  collectionId: string;
  collectionName: string;
  title: string;
  price: number;
  cart_space?: number;
  images: string[];
  preview: string;
  mainColor: string;
  secondaryColor: string;
  description: string;
  category: string;
  tags: string[];
  published: boolean;
  created: string;
  updated: string;
};

export type CartItemData = {
  id: string;
  amount: number;
  price: number;
  cart_space?: number;
  item_total_space?: number;
  is_hat?: boolean;
  product_details: CartProductDetails;
};

export type CartBreakdown = {
  deliveryFee: number;
  subtotal: number;
  total: number;
  total_cart_space?: number;
  max_cart_space?: number;
  hat_count?: number;
  base_fee?: number;
  additional_hat_fee?: number;
  distanceKm?: number;
  isFreeShipping?: boolean;
};

type BreakdownResponse = {
  data: {
    cart_breakdown: CartBreakdown;
    cart_items: CartItemData[];
  };
  message: string;
};

export const Route = createFileRoute("/store/cart/")({
  component: RouteComponent,
});

function RouteComponent() {
  const isAuthenticated = pb.authStore.isValid;

  const query = useQuery<BreakdownResponse>({
    queryKey: ["cart-total"],
    queryFn: () => pb.send("/cart/breakdown", { method: "GET" }),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="page-wrap py-12 flex flex-col items-center justify-center text-center">
        <div className="card bg-base-100 border border-base-200 shadow-xs max-w-md p-8 flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="size-8" />
          </div>
          <h2 className="text-xl font-bold">Your Shopping Cart</h2>
          <p className="text-sm text-base-content/60">
            Please log in or create an account to view your saved cart items and proceed to checkout.
          </p>
          <Link to="/login" search={{ redirect: "/store/cart" }} className="btn btn-primary rounded-xl gap-2 mt-2">
            <LogIn className="size-4" /> Log In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = query.data?.data.cart_breakdown;
  const items = query.data?.data.cart_items ?? [];
  const currentSpace = breakdown?.total_cart_space ?? items.reduce((acc, item) => acc + (item.item_total_space ?? item.amount), 0);
  const maxSpace = breakdown?.max_cart_space ?? 20;
  const spacePercentage = Math.min(100, Math.round((currentSpace / maxSpace) * 100));

  return (
    <div className="page-wrap py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Review your chosen headwear & accessories before secure Paystack checkout.
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="badge badge-neutral text-xs font-semibold">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
            <span className={`badge ${currentSpace >= maxSpace ? "badge-error" : currentSpace >= 15 ? "badge-warning" : "badge-outline"} text-xs font-semibold gap-1`}>
              <PackageOpen className="size-3" />
              {currentSpace}/{maxSpace} Space Units
            </span>
          </div>
        )}
      </div>

      {/* Cart Capacity Alert / Status Bar */}
      {items.length > 0 && (
        <div className="p-4 rounded-2xl bg-base-200/60 border border-base-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-base-content/80">
              <PackageOpen className="size-4 text-primary" />
              Cart Packaging Space: <strong>{currentSpace} of {maxSpace} units</strong>
            </span>
            <span className="text-base-content/50 font-mono">{spacePercentage}% Full</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                currentSpace >= maxSpace ? "bg-error" : currentSpace >= 15 ? "bg-warning" : "bg-primary"
              }`}
              style={{ width: `${spacePercentage}%` }}
            />
          </div>
          {currentSpace >= 16 && (
            <p className="text-[11px] text-base-content/60 flex items-center gap-1 pt-1">
              <Sparkles className="size-3 text-warning" />
              Ordering in bulk for a wedding or large event? <Link to="/about" className="link link-primary font-bold">Contact our bespoke team</Link> directly for special event handling.
            </p>
          )}
        </div>
      )}

      <section className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          <CartItems items={items} isLoading={query.isLoading} />
        </div>
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <ClientOnly
            fallback={
              <div className="p-4 rounded-xl border border-base-200">
                <h2 className="text-sm font-bold">Loading cart breakdown...</h2>
              </div>
            }
          >
            <CartTotal
              refetch={query.refetch}
              breakdown={breakdown}
              isLoading={query.isLoading}
            />
          </ClientOnly>
          <DeliverySettings />
        </div>
      </section>
    </div>
  );
}
