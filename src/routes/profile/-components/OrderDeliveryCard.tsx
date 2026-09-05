import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import type { LogisticsResponse, UserOrdersResponse } from "#/../pocketbase-types";
import {
  Truck,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  MapPin,
  Package,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface OrderDeliveryCardProps {
  order: UserOrdersResponse<{
    logisitics?: LogisticsResponse;
  }>;
}

const PROVIDER_INFO: Record<
  string,
  { label: string; badge: string; border: string; bg: string }
> = {
  bolt: {
    label: "Bolt Business / Express",
    badge: "badge-success text-success-content",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
  },
  glovo: {
    label: "Glovo Courier",
    badge: "badge-warning text-warning-content",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
  },
  gigl: {
    label: "GIG Logistics",
    badge: "badge-info text-info-content",
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
  },
};

export default function OrderDeliveryCard({ order }: OrderDeliveryCardProps) {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const queryClient = useQueryClient();

  const logistics = order.expand?.logisitics;
  const status = order.status ?? "pending";
  const isInTransit = status === "in-transit" || status === "in transit";
  const isDelivered = status === "delivered";

  // Code to show: logistics code or order confirmation code
  const confirmationCode = logistics?.code ?? order.code;

  const handleCopyCode = (code: number | string) => {
    navigator.clipboard.writeText(code.toString());
    setCopied(true);
    toast.success("Delivery code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const completeDeliveryMutation = useMutation({
    mutationFn: async (codeVal: number) => {
      return await pb.collection("user_orders").update(order.id, {
        status: "delivered",
        code: codeVal,
      });
    },
    onSuccess: () => {
      toast.success("Delivery confirmed! Your order has been marked as delivered.");
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      queryClient.invalidateQueries({ queryKey: ["user_orders"] });
      setInputCode("");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.message ||
        err?.message ||
        "Failed to complete delivery. Please ensure the code is correct.";
      toast.error(msg);
    },
  });

  const handleCompleteDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) {
      toast.error("Please enter the delivery confirmation code.");
      return;
    }
    const num = Number(clean);
    if (isNaN(num)) {
      toast.error("Delivery code must be a valid number.");
      return;
    }
    completeDeliveryMutation.mutate(num);
  };

  const providerMeta =
    logistics?.provider && PROVIDER_INFO[logistics.provider]
      ? PROVIDER_INFO[logistics.provider]
      : {
          label: logistics?.provider || "Dedicated Courier",
          badge: "badge-neutral",
          border: "border-base-200",
          bg: "bg-base-100",
        };

  // Case 1: Order is IN TRANSIT (Show Live Delivery, Safety Code & Completion Form)
  if (isInTransit) {
    return (
      <div className="card bg-base-100 border-2 border-primary/40 shadow-md overflow-hidden relative">
        {/* Top active pulse bar */}
        <div className="bg-primary px-6 py-2.5 flex items-center justify-between text-primary-content text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-white"></span>
            </span>
            <span>Live Dispatch — Your Package is on the Way</span>
          </div>
          <span className="badge badge-xs bg-white text-primary border-0 font-extrabold uppercase">
            En Route
          </span>
        </div>

        <div className="card-body p-6 gap-6">
          {/* Dispatcher and Code Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-base-content leading-tight">
                  Dispatched with {logistics?.name || "Express Courier"}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`badge badge-sm capitalize font-bold ${providerMeta.badge}`}>
                    {logistics?.provider || "Courier"}
                  </span>
                  <span className="text-xs text-base-content/50">
                    Lagos Metro Fast Dispatch
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Confirmation Code Pill */}
            {confirmationCode && (
              <div className="bg-gradient-to-br from-warning/15 via-warning/5 to-base-100 border-2 border-warning/40 rounded-2xl p-4 flex flex-col items-center md:items-end gap-1.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-warning-content/80 uppercase tracking-wider">
                  <KeyRound size={13} className="text-warning" />
                  <span>Your Delivery Safety Code</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-black tracking-widest text-base-content">
                    {confirmationCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(confirmationCode)}
                    className="btn btn-xs btn-outline rounded-lg text-xs gap-1 border-base-300"
                    title="Copy code"
                  >
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-base-content/60 text-center md:text-right mt-0.5">
                  Share this code with your dispatch rider to confirm handover.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Customer Delivery Completion Form */}
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary shrink-0" />
                <h4 className="font-bold text-sm text-base-content">
                  Received Your Package? Complete Delivery
                </h4>
              </div>
              {confirmationCode && (
                <button
                  type="button"
                  onClick={() => setInputCode(String(confirmationCode))}
                  className="text-xs text-primary hover:underline font-semibold text-left sm:text-right"
                >
                  Fill with my code ({confirmationCode})
                </button>
              )}
            </div>

            <p className="text-xs text-base-content/70">
              Once your order has arrived, enter your 4-digit confirmation code below to mark this delivery as complete and safely received.
            </p>

            <form onSubmit={handleCompleteDelivery} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 4-digit code (e.g. 1234)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  disabled={completeDeliveryMutation.isPending}
                  className="input input-bordered input-md w-full font-mono text-center sm:text-left text-base tracking-widest font-bold placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={completeDeliveryMutation.isPending || !inputCode.trim()}
                className="btn btn-primary btn-md gap-2 rounded-xl text-sm font-bold shadow-sm"
              >
                {completeDeliveryMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Confirm Receipt</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-200 flex items-center gap-2.5 text-xs text-base-content/70">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <span>
              <strong>Safe Handover Protocol:</strong> Delivery completion requires matching your security code with the assigned courier record.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Order is DELIVERED (Show Verified Completion)
  if (isDelivered) {
    return (
      <div className="card bg-base-100 border border-success/30 shadow-xs overflow-hidden">
        <div className="card-body p-6 gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-2xl bg-success/15 text-success flex items-center justify-center shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-base-content leading-tight">
                    Delivered & Verified
                  </h3>
                  <span className="badge badge-sm badge-success text-success-content font-bold capitalize">
                    Completed
                  </span>
                </div>
                <p className="text-xs text-base-content/60 mt-1">
                  Successfully handed over via {logistics?.name || "Courier Service"}.
                </p>
              </div>
            </div>

            {order.code && (
              <div className="flex items-center gap-2 text-xs bg-base-200/60 px-3.5 py-2 rounded-xl border border-base-200 font-mono text-base-content/70">
                <span>Verified Code:</span>
                <strong className="text-base-content">{order.code}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Order is PENDING or PROCESSING (Show Preparation Timeline)
  return (
    <div className="card bg-base-100 border border-base-200 p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-base-200 text-base-content/70 flex items-center justify-center">
            <Package size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content">
              Shipping & Courier Preparation
            </h3>
            <p className="text-xs text-base-content/50 mt-0.5">
              Lagos Atelier Handcrafted Fulfillment
            </p>
          </div>
        </div>

        <span className="badge badge-sm badge-ghost text-xs font-semibold">
          Step 1 & 2 of 4
        </span>
      </div>

      <div className="space-y-2.5 text-xs text-base-content/70 pt-2 border-t border-base-200">
        <div className="flex items-start gap-2.5">
          <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base-content">Atelier Crafting & Quality Inspection</p>
            <p className="text-base-content/50 mt-0.5">
              Your bespoke headpiece is being shaped and finished. Once packaged, a courier will be assigned and your 4-digit security code will appear here.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-2 border-t border-base-200/60">
          <MapPin className="size-4 text-base-content/40 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base-content">Secure Local Delivery</p>
            <p className="text-base-content/50 mt-0.5">
              Dispatched via verified express couriers (Bolt, Glovo, or GIGL) direct to your shipping address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
