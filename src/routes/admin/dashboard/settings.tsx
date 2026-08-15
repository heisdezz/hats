import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb, ssr_pb } from "#/client/pb";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Store, ShieldCheck, MapPin, Truck, CheckCircle2 } from "lucide-react";
import type { ShopLocationResponse } from "#/../pocketbase-types";

export const Route = createFileRoute("/admin/dashboard/settings")({
  component: RouteComponent,
  loader: async () => {
    try {
      return await ssr_pb().collection("shop_location").getFirstListItem("");
    } catch (_) {
      return null;
    }
  },
});

type ShopFormValues = {
  fullAddress: string;
  city: string;
  state: string;
};

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const queryClient = useQueryClient();
  const adminUser = pb.authStore.record;

  const locationQuery = useQuery({
    queryKey: ["shop-location"],
    queryFn: async () => {
      try {
        return await pb.collection("shop_location").getFirstListItem<ShopLocationResponse>("");
      } catch (_) {
        return null;
      }
    },
    initialData: loaderData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShopFormValues>({
    values: {
      fullAddress: locationQuery.data?.fullAddress ?? "",
      city: locationQuery.data?.city ?? "Lagos",
      state: locationQuery.data?.state ?? "Lagos State",
    },
  });

  const saveLocationMut = useMutation({
    mutationFn: async (values: ShopFormValues) => {
      const existing = locationQuery.data;
      if (existing) {
        return await pb.collection("shop_location").update(existing.id, values);
      } else {
        return await pb.collection("shop_location").create(values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-location"] });
      toast.success("Shop location updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update shop location.");
    },
  });

  const onSubmit = (data: ShopFormValues) => {
    saveLocationMut.mutate(data);
  };

  return (
    <main className="dash-wrap p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-sm text-base-content/60 mt-0.5">
          Configure physical store details, delivery parameters, and payment webhook integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shop Location Card */}
          <div className="card bg-base-100 border border-base-200 shadow-xs">
            <div className="card-body p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-base-200">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Store & Pickup Address</h2>
                  <p className="text-xs text-base-content/50">
                    Physical location displayed for customer orders and shipping calculations.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-base-content/70">Full Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                    className={`input input-bordered w-full text-sm rounded-xl ${
                      errors.fullAddress ? "input-error" : ""
                    }`}
                    {...register("fullAddress", { required: "Address is required" })}
                  />
                  {errors.fullAddress && (
                    <p className="text-xs text-error">{errors.fullAddress.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-base-content/70">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Lekki"
                      className="input input-bordered w-full text-sm rounded-xl"
                      {...register("city")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-base-content/70">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Lagos State"
                      className="input input-bordered w-full text-sm rounded-xl"
                      {...register("state")}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saveLocationMut.isPending}
                    className="btn btn-primary rounded-xl px-6"
                  >
                    {saveLocationMut.isPending ? "Saving..." : "Save Location"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Delivery Threshold Rules */}
          <div className="card bg-base-100 border border-base-200 shadow-xs">
            <div className="card-body p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-base-200">
                <div className="p-2 rounded-xl bg-info/10 text-info">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Delivery Thresholds</h2>
                  <p className="text-xs text-base-content/50">
                    Automated shipping calculation parameters configured in PocketBase hooks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-base-200/50 space-y-1 border border-base-200">
                  <span className="font-bold text-base-content/60">Free Shipping Rule</span>
                  <p className="text-sm font-extrabold text-primary">Orders above ₦150,000</p>
                  <p className="text-base-content/50">Applies automatically for Lagos addresses.</p>
                </div>

                <div className="p-4 rounded-xl bg-base-200/50 space-y-1 border border-base-200">
                  <span className="font-bold text-base-content/60">Standard Shipping</span>
                  <p className="text-sm font-extrabold text-base-content">Flat rate / distance based</p>
                  <p className="text-base-content/50">Calculated based on customer delivery address.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-6">
          {/* Admin Account */}
          <div className="card bg-base-100 border border-base-200 shadow-xs">
            <div className="card-body p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="size-4 text-primary" />
                <span>Admin Profile</span>
              </div>
              <div className="divider my-0" />
              <div className="space-y-1 text-xs">
                <p className="text-base-content/50">Signed in as:</p>
                <p className="font-bold text-sm truncate">{adminUser?.email || "Admin User"}</p>
                <p className="text-base-content/40 font-mono">ID: {adminUser?.id}</p>
              </div>
              <span className="badge badge-success badge-sm gap-1 self-start font-semibold">
                <CheckCircle2 className="size-3" /> Superuser Authenticated
              </span>
            </div>
          </div>

          {/* Paystack Webhook Status */}
          <div className="card bg-base-100 border border-base-200 shadow-xs">
            <div className="card-body p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Store className="size-4 text-primary" />
                <span>Paystack Integration</span>
              </div>
              <div className="divider my-0" />

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-base-content/60">Webhook URL</span>
                  <span className="badge badge-xs badge-neutral">Active</span>
                </div>
                <p className="font-mono bg-base-200 p-2 rounded-lg text-[10px] break-all">
                  https://rabii.duckdns.org/paystack/webhook
                </p>

                <div className="pt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-success font-semibold">
                    <CheckCircle2 className="size-3.5" /> Raw HMAC SHA512 Signature
                  </div>
                  <div className="flex items-center gap-1.5 text-success font-semibold">
                    <CheckCircle2 className="size-3.5" /> 20-min Cron Reconciliation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
