import { ShoppingBag } from "lucide-react";
import type { CartBreakdown } from "../index";
import { pb } from "#/client/pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PaystackPop from "@paystack/inline-js";
import { useProfile } from "#/store/user";
import paystack_key from "#/client/paystack";
import { extract_message } from "#/helpers/api";
interface Props {
  breakdown: CartBreakdown | undefined;
  isLoading: boolean;
  refetch: () => void;
}

const paystackInstance = new PaystackPop();

export default function CartTotal({ breakdown, isLoading, refetch }: Props) {
  const queryClient = useQueryClient();
  const profile = useProfile((state) => state.profile);
  const checkout_mutation = useMutation({
    mutationFn: async () => {
      let resp: {
        data: {
          key: string;
          total: number;
          access_code: string;
        };
      } = await pb.send("/checkout", {
        method: "POST",
        body: { deliveryFee: breakdown?.deliveryFee ?? 0 },
      });

      return resp;
    },
    onSuccess: (resp) => {
      const access_code = resp.data.access_code;
      if (!access_code) throw new Error("Server Error ccured");
      paystackInstance.resumeTransaction(resp.data.access_code, {
        onSuccess: async (data) => {
          await pb.send("/checkout/validate", {
            method: "POST",
            body: {
              reference: data.reference,
              deliveryFee: breakdown?.deliveryFee ?? 0,
            },
          });
          toast.success("Checkout successful");
          refetch();
          queryClient.invalidateQueries({ queryKey: ["cart-total"] });
        },
      });
      // refetch();
      // queryClient.invalidateQueries({ queryKey: ["cart-total"] });
      return resp;
    },
  });
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

        <button
          disabled={checkout_mutation.isPending}
          className="btn btn-primary w-full gap-2"
          onClick={() => {
            toast.promise(checkout_mutation.mutateAsync, {
              loading: "loading",
              success: "checkout-info fetched",
              error: extract_message,
            });
          }}
        >
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
