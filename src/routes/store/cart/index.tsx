import { createFileRoute } from "@tanstack/react-router";
import CartItems from "./-components/CartItems";
import CartTotal from "./-components/CartTotal";

export const Route = createFileRoute("/store/cart/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="page-wrap space-y-4">
      <div className="h2 text-xl font-bold">Cart Items</div>
      <section className="flex gap-2">
        <div className="flex-1">
          <CartItems />
        </div>
        <div className="flex-1 max-w-xs">
          <CartTotal />
        </div>
      </section>
    </div>
  );
}
