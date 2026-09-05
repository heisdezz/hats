import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import type { LogisticsResponse, UserOrdersResponse } from "#/../pocketbase-types";
import {
  Truck,
  ShieldAlert,
  ShieldCheck,
  Check,
  Plus,
  RefreshCw,
  KeyRound,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface LogisticsManagerProps {
  order: UserOrdersResponse<{
    logisitics?: LogisticsResponse;
  }>;
  onOrderUpdated?: () => void;
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

export default function LogisticsManager({
  order,
  onOrderUpdated,
}: LogisticsManagerProps) {
  const qc = useQueryClient();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  // New courier form state
  const [newName, setNewName] = useState("");
  const [newProvider, setNewProvider] = useState<"bolt" | "glovo" | "gigl">("bolt");
  const [newCode, setNewCode] = useState(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );

  // Delivery confirmation code state
  const [verifyCode, setVerifyCode] = useState("");

  const currentLogistics = order.expand?.logisitics;
  const status = order.status ?? "pending";
  const isInTransit = status === "in-transit" || status === "in transit";
  const isDelivered = status === "delivered";

  // Query existing logistics records
  const logisticsQuery = useQuery({
    queryKey: ["logistics-list"],
    queryFn: () =>
      pb.collection("logistics").getFullList<LogisticsResponse>({
        sort: "-created",
      }),
  });

  // Assign logistics mutation
  const assignMut = useMutation({
    mutationFn: async (logisticsId: string) => {
      return await pb.collection("user_orders").update(order.id, {
        logisitics: logisticsId,
      });
    },
    onSuccess: () => {
      toast.success("Logistics courier assigned successfully.");
      setIsAssignModalOpen(false);
      qc.invalidateQueries({ queryKey: ["order", order.id] });
      onOrderUpdated?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to assign logistics provider.");
    },
  });

  // Create & assign new logistics mutation
  const createAndAssignMut = useMutation({
    mutationFn: async () => {
      if (!newName.trim()) throw new Error("Rider or courier name is required");
      const codeNum = parseInt(newCode, 10);
      if (isNaN(codeNum)) throw new Error("A valid 4-digit numeric code is required");

      const created = await pb.collection("logistics").create<LogisticsResponse>({
        name: newName.trim(),
        provider: newProvider,
        code: codeNum,
      });

      return await pb.collection("user_orders").update(order.id, {
        logisitics: created.id,
      });
    },
    onSuccess: () => {
      toast.success("New logistics dispatch created and assigned!");
      setIsAssignModalOpen(false);
      setNewName("");
      setNewCode(Math.floor(1000 + Math.random() * 9000).toString());
      qc.invalidateQueries({ queryKey: ["logistics-list"] });
      qc.invalidateQueries({ queryKey: ["order", order.id] });
      onOrderUpdated?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create dispatch courier.");
    },
  });

  // Mark delivered mutation with code verification
  const deliverMut = useMutation({
    mutationFn: async () => {
      const codeNum = parseInt(verifyCode, 10);
      if (isNaN(codeNum)) throw new Error("Please enter a valid numeric confirmation code");

      return await pb.collection("user_orders").update(order.id, {
        status: "delivered",
        code: codeNum,
      });
    },
    onSuccess: () => {
      toast.success("Order marked as DELIVERED with verified code!");
      setIsDeliverModalOpen(false);
      setVerifyCode("");
      qc.invalidateQueries({ queryKey: ["order", order.id] });
      onOrderUpdated?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Code verification failed. Does not match logistics code.");
    },
  });

  const providerMeta =
    currentLogistics?.provider && PROVIDER_INFO[currentLogistics.provider]
      ? PROVIDER_INFO[currentLogistics.provider]
      : {
          label: currentLogistics?.provider || "Standard Dispatch",
          badge: "badge-neutral",
          border: "border-base-200",
          bg: "bg-base-200/40",
        };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
      <div className="card-body p-6 gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-base-content leading-tight">
                Logistics & Dispatch Control
              </h2>
              <p className="text-xs text-base-content/50 mt-0.5">
                Manage courier dispatch assignments and delivery code verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentLogistics ? (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="btn btn-xs btn-outline rounded-lg text-xs gap-1.5"
              >
                Change Courier
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="btn btn-xs btn-primary rounded-lg text-xs gap-1.5 shadow-xs"
              >
                <Plus size={13} />
                Assign Courier
              </button>
            )}
          </div>
        </div>

        {/* Assigned Courier Details OR Missing Warning */}
        {currentLogistics ? (
          <div
            className={`p-4 rounded-2xl border ${providerMeta.border} ${providerMeta.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all`}
          >
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-xl bg-base-100 border border-base-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Truck className="size-5 text-base-content/70" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-base-content">
                    {currentLogistics.name || "Unnamed Courier"}
                  </span>
                  <span className={`badge badge-sm font-semibold capitalize ${providerMeta.badge}`}>
                    {currentLogistics.provider || "Courier"}
                  </span>
                </div>
                <p className="text-xs text-base-content/60">
                  Logistics ID: <span className="font-mono text-xs">{currentLogistics.id}</span>
                </p>
              </div>
            </div>

            {/* Delivery Confirmation Code Badge */}
            <div className="flex items-center gap-3 bg-base-100/90 border border-base-200 px-4 py-2.5 rounded-xl shadow-2xs w-fit">
              <KeyRound className="size-4 text-warning shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 leading-none">
                  Delivery Security Code
                </p>
                <p className="text-base font-black font-mono text-base-content tracking-wider mt-0.5">
                  {currentLogistics.code ?? "---"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-warning/30 bg-warning/5 flex items-start gap-3.5">
            <ShieldAlert className="size-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-base-content">No Logistics Courier Assigned</p>
              <p className="text-base-content/60 leading-relaxed">
                In accordance with fulfillment safeguards, updating this order to{" "}
                <span className="font-bold text-base-content">&apos;In Transit&apos;</span> requires an
                assigned courier. Please assign or register a courier dispatch above.
              </p>
            </div>
          </div>
        )}

        {/* Quick Action Bar for Delivery Verification */}
        {isInTransit && (
          <div className="p-4 rounded-2xl bg-base-200/50 border border-base-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-base-content/70">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>
                Order is currently in transit. Verify the confirmation code to complete delivery.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDeliverModalOpen(true)}
              className="btn btn-sm btn-success text-success-content rounded-xl text-xs gap-1.5 shadow-xs shrink-0 w-full md:w-auto"
            >
              <Check size={14} />
              Verify & Complete Delivery
            </button>
          </div>
        )}

        {isDelivered && (
          <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2 text-xs font-semibold text-success">
            <ShieldCheck size={16} />
            <span>Order delivered & verified with matching logistics security code ({order.code || currentLogistics?.code}).</span>
          </div>
        )}
      </div>

      {/* MODAL 1: Assign or Create Logistics */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-base-100 border border-base-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-base-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-base-content">Assign Logistics Courier</h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Select an active rider or register a new delivery dispatch
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="btn btn-sm btn-ghost btn-circle text-base-content/50"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-base-200 px-6 pt-2 bg-base-200/30">
              <button
                type="button"
                onClick={() => setActiveTab("existing")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  activeTab === "existing"
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/50 hover:text-base-content"
                }`}
              >
                Existing Couriers ({logisticsQuery.data?.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                  activeTab === "new"
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/50 hover:text-base-content"
                }`}
              >
                + Register New Dispatch
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === "existing" ? (
                <div className="space-y-2.5">
                  {logisticsQuery.isLoading && (
                    <div className="flex items-center justify-center py-8 text-xs text-base-content/40">
                      <RefreshCw className="size-4 animate-spin mr-2" />
                      Loading courier registry...
                    </div>
                  )}

                  {logisticsQuery.data && logisticsQuery.data.length === 0 && (
                    <div className="text-center py-8 space-y-2 text-xs text-base-content/50">
                      <p>No couriers registered yet.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("new")}
                        className="btn btn-xs btn-primary rounded-lg"
                      >
                        Create your first courier
                      </button>
                    </div>
                  )}

                  {logisticsQuery.data?.map((item) => {
                    const isSelected = order.logisitics === item.id;
                    const meta = PROVIDER_INFO[item.provider || "bolt"];
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-2xs"
                            : "bg-base-100 hover:bg-base-200/50 border-base-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-base-200 flex items-center justify-center font-bold text-xs text-base-content/70">
                            <Truck size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-base-content">{item.name}</p>
                              <span
                                className={`badge badge-xs capitalize font-semibold ${meta?.badge || "badge-neutral"}`}
                              >
                                {item.provider}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-base-content/50">
                              Code: <strong className="text-base-content">{item.code}</strong>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={assignMut.isPending || isSelected}
                          onClick={() => assignMut.mutate(item.id)}
                          className={`btn btn-xs rounded-lg text-xs ${
                            isSelected
                              ? "btn-neutral opacity-50 cursor-not-allowed"
                              : "btn-primary"
                          }`}
                        >
                          {isSelected ? "Assigned" : "Select"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="form-control space-y-1.5">
                    <label className="font-semibold text-base-content/70">Courier / Rider Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tunde Alabi (Bolt Delivery)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="input input-bordered input-sm rounded-xl w-full text-xs"
                    />
                  </div>

                  <div className="form-control space-y-1.5">
                    <label className="font-semibold text-base-content/70">Logistics Service Provider</label>
                    <select
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value as any)}
                      className="select select-bordered select-sm rounded-xl w-full text-xs"
                    >
                      <option value="bolt">Bolt Business / Express</option>
                      <option value="glovo">Glovo Courier</option>
                      <option value="gigl">GIG Logistics (GIGL)</option>
                    </select>
                  </div>

                  <div className="form-control space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-base-content/70">Delivery Confirmation Code</label>
                      <button
                        type="button"
                        onClick={() =>
                          setNewCode(Math.floor(1000 + Math.random() * 9000).toString())
                        }
                        className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <RefreshCw size={10} /> Generate Random
                      </button>
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 8844"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="input input-bordered input-sm font-mono tracking-wider font-bold rounded-xl w-full text-xs"
                    />
                    <p className="text-[11px] text-base-content/50">
                      The customer will give this code to the rider to confirm safe handoff.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={createAndAssignMut.isPending || !newName.trim()}
                    onClick={() => createAndAssignMut.mutate()}
                    className="btn btn-primary btn-sm w-full rounded-xl mt-2 text-xs font-bold shadow-xs"
                  >
                    {createAndAssignMut.isPending ? "Registering..." : "Register & Assign Courier"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Verify Delivery Code */}
      {isDeliverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-base-100 border border-base-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="size-11 rounded-2xl bg-success/15 text-success flex items-center justify-center shrink-0">
                <ShieldCheck size={24} />
              </div>
              <button
                type="button"
                onClick={() => setIsDeliverModalOpen(false)}
                className="btn btn-sm btn-ghost btn-circle text-base-content/50"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-bold text-lg text-base-content leading-tight">
                Verify Delivery Confirmation Code
              </h3>
              <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                To mark order <strong className="text-base-content">#{order.id.slice(0, 8)}</strong> as delivered,
                input the 4-digit code confirmed by the customer upon handover.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-base-200/50 border border-base-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-base-content/60">
                <span>Assigned Courier:</span>
                <span className="font-bold text-base-content">{currentLogistics?.name}</span>
              </div>
              <div className="flex items-center justify-between text-base-content/60">
                <span>Expected Code:</span>
                <span className="font-mono font-bold text-base-content">
                  {currentLogistics?.code ?? "None"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70">
                Enter Received Delivery Code
              </label>
              <input
                type="number"
                placeholder="e.g. 8844"
                autoFocus
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="input input-bordered input-lg font-mono text-center tracking-widest text-xl font-black rounded-2xl w-full"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (currentLogistics?.code) {
                    setVerifyCode(currentLogistics.code.toString());
                  }
                }}
                className="btn btn-sm btn-ghost text-xs rounded-xl flex-1"
              >
                Auto-Fill Code
              </button>
              <button
                type="button"
                disabled={deliverMut.isPending || !verifyCode.trim()}
                onClick={() => deliverMut.mutate()}
                className="btn btn-sm btn-success text-success-content text-xs font-bold rounded-xl flex-1 shadow-xs"
              >
                {deliverMut.isPending ? "Verifying..." : "Verify & Deliver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
