import { ShoppingBag } from "lucide-react";
import type { CartBreakdown } from "../index";
import { pb } from "#/client/pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PaystackPop from "@paystack/inline-js";
import { useProfile } from "#/store/user";
import { extract_message } from "#/helpers/api";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  breakdown: CartBreakdown | undefined;
  isLoading: boolean;
  refetch: () => void;
}

const paystackInstance = new PaystackPop();

export default function CartTotal({ breakdown, isLoading, refetch }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const profile = useProfile((state) => state.profile);

  const checkout_mutation = useMutation({
    mutationFn: async () => {
      let resp: {
        data: {
          key: string;
          total: number;
          access_code: string;
          reference: string;
        };
      } = await pb.send("/checkout", {
        method: "POST",
        body: {},
      });

      return resp;
    },
    onSuccess: (resp) => {
      const access_code = resp.data.access_code;
      if (!access_code) {
        toast.error("Failed to initialize Paystack checkout session.");
        return;
      }

      paystackInstance.resumeTransaction(access_code, {
        onSuccess: async (data) => {
          try {
            await pb.send("/checkout/validate", {
              method: "POST",
              body: { reference: data.reference },
            });
            toast.success("Payment verified! Your order has been placed successfully.");
            refetch();
            queryClient.invalidateQueries({ queryKey: ["cart-total"] });
            queryClient.invalidateQueries({ queryKey: ["user-orders"] });
            navigate({ to: "/profile/orders" });
          } catch (err: any) {
            toast.error(extract_message(err) || "Order validation failed. Please check your order history.");
          }
        },
        onCancel: () => {
          toast.info("Payment window closed.");
        },
      });
      return resp;
    },
    onError: (err: any) => {
      const msg = extract_message(err);
      if (msg?.toLowerCase().includes("delivery")) {
        toast.warning("Please update your delivery address before checking out.");
      } else {
        toast.error(msg || "Checkout failed.");
      }
    },
  });

  const subtotal = breakdown?.subtotal ?? 0;
  const isCartEmpty = subtotal <= 0;

  return (
    <div className="card bg-base-100 border border-base-200 shadow-xs sticky top-4">
      <div className="card-body gap-4 p-5">
        <h2 className="font-semibold text-base">Order Summary</h2>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-base-content/70">
            <span>Subtotal</span>
            {isLoading ? (
              <span className="skeleton h-4 w-16" />
            ) : (
              <span>₦{subtotal.toLocaleString()}</span>
            )}
          </div>
          <div className="divider my-0" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            {isLoading ? (
              <span className="skeleton h-5 w-20" />
            ) : (
              <span className="text-primary">₦{subtotal.toLocaleString()}</span>
            )}
          </div>
        </div>

        <button
          disabled={checkout_mutation.isPending || isCartEmpty || isLoading}
          className="btn btn-primary w-full gap-2 rounded-xl"
          onClick={() => {
            checkout_mutation.mutate();
          }}
        >

          <ShoppingBag className="size-4" />
          {checkout_mutation.isPending ? "Initializing..." : "Pay with Paystack"}
        </button>

        <p className="text-xs text-center text-base-content/40">
          Secure payment powered by Paystack 🔒
        </p>
      </div>
    </div>
  );
}

