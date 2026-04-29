import { ShoppingBag } from "lucide-react";
import type { CartBreakdown } from "../index";
import { pb } from "#/client/pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PaystackPop from "@paystack/inline-js";
import { useProfile } from "#/store/user";
import paystack_key from "#/client/paystack";
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
      // return await pb.send("/checkout/validate", {
      //   method: "POST",
      //   body: {
      //     key: "data.reference",
      //     // amount: data,
      //   },
      // });
      let resp: {
        data: {
          key: string;
          total: number;
        };
      } = await pb.send("/checkout", { method: "POST", body: {} });
      paystackInstance.newTransaction({
        key: paystack_key,
        email: profile?.email ?? "",
        amount: resp.data.total,
        reference: resp.data.key,
        onSuccess: async (data) => {
          await pb.send("/checkout/validate", {
            method: "POST",
            body: {
              reference: data.reference,
              // amount: data,
            },
          });
          refetch();
          queryClient.invalidateQueries({ queryKey: ["cart-total"] });
        },
      });
      return resp;
    },
    onSuccess: (resp) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["cart-total"] });
      console.log(resp);
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
              error: "error occured",
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
