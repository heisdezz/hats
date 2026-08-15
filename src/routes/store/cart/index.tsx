import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import CartItems from "./-components/CartItems";
import CartTotal from "./-components/CartTotal";
import { pb } from "#/client/pb";
import { useQuery } from "@tanstack/react-query";
import DeliverySettings from "#/components/DeliverySettings.tsx";
import { ShoppingBag, LogIn } from "lucide-react";

export type CartProductDetails = {
  id: string;
  collectionId: string;
  collectionName: string;
  title: string;
  price: number;
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
  product_details: CartProductDetails;
};

export type CartBreakdown = {
  deliveryFee: number;
  subtotal: number;
  total: number;
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

  return (
    <div className="page-wrap py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cart Items</h1>
        {items.length > 0 && (
          <span className="badge badge-neutral">
            {items.length} product{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
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
