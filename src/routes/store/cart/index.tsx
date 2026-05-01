import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import CartItems from "./-components/CartItems";
import CartTotal from "./-components/CartTotal";
import { pb } from "#/client/pb";
import { useQuery } from "@tanstack/react-query";

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
  const query = useQuery<BreakdownResponse>({
    queryKey: ["cart-total"],
    queryFn: () => pb.send("/cart/breakdown", { method: "GET" }),
  });

  const breakdown = query.data?.data.cart_breakdown;
  const items = query.data?.data.cart_items ?? [];

  return (
    <div className="page-wrap space-y-4">
      <div className="h2 text-xl font-bold">Cart Items</div>
      <section className="flex gap-6 items-start">
        <div className="flex-1">
          <CartItems items={items} isLoading={query.isLoading} />
        </div>
        <div className="w-72 shrink-0">
          <ClientOnly
            fallback={
              <div className="fade ring p-4 rounded-xl fade">
                <h2 className="text-lg font-bold">...loading cart breakdown</h2>
              </div>
            }
          >
            <CartTotal
              refetch={query.refetch}
              breakdown={breakdown}
              isLoading={query.isLoading}
            />
          </ClientOnly>
        </div>
      </section>
    </div>
  );
}
