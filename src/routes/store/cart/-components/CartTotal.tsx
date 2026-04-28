import { ShoppingBag } from "lucide-react";
import type { CartBreakdown } from "../index";

interface Props {
  breakdown: CartBreakdown | undefined;
  isLoading: boolean;
}

export default function CartTotal({ breakdown, isLoading }: Props) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm sticky top-4">
      <div className="card-body gap-4 p-5">
        <h2 className="font-semibold text-base">Order Summary</h2>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-base-content/70">
            <span>Subtotal</span>
            {isLoading ? (
              <span className="skeleton h-4 w-16" />
            ) : (
              <span>₦{(breakdown?.subtotal ?? 0).toLocaleString()}</span>
            )}
          </div>
          <div className="flex justify-between text-base-content/70">
            <span>Delivery</span>
            {isLoading ? (
              <span className="skeleton h-4 w-16" />
            ) : (
              <span>₦{(breakdown?.deliveryFee ?? 0).toLocaleString()}</span>
            )}
          </div>
          <div className="divider my-0" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            {isLoading ? (
              <span className="skeleton h-5 w-20" />
            ) : (
              <span>₦{(breakdown?.total ?? 0).toLocaleString()}</span>
            )}
          </div>
        </div>

        <button className="btn btn-primary w-full gap-2" disabled={isLoading}>
          <ShoppingBag className="size-4" />
          Checkout
        </button>

        <p className="text-xs text-center text-base-content/40">
          Taxes and fees calculated at checkout
        </p>
      </div>
    </div>
  );
}
