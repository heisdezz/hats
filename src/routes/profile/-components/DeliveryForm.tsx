import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { pb } from "#/client/pb";
import { useDeliverySettings } from "#/store/delivery";
import { PlacesInput } from "./PlacesInput";

type FormValues = {
  full_address: string;
  city: string;
  state: string;
  location: { lat: number; lon: number };
};

type Props = { onSuccess: () => void };

export default function DeliveryForm({ onSuccess }: Props) {
  const updateDelivery = useDeliverySettings((s) => s.updateDeliverySettings);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      full_address: "",
      city: "",
      state: "",
      location: { lat: 0, lon: 0 },
    },
  });

  const handlePlaceSelected = (place: any) => {
    const components = place.address_components ?? [];

    const get = (type: string) =>
      components.find((c: any) => c.types.includes(type))?.long_name ?? "";

    setValue("full_address", place.formatted_address ?? "");
    setValue("city", get("locality") || get("administrative_area_level_2"));
    setValue("state", get("administrative_area_level_1"));
    setValue("location", {
      lat: place.geometry?.location?.lat() ?? 0,
      lon: place.geometry?.location?.lng() ?? 0,
    });
  };

  const onSubmit = async (data: FormValues) => {
    const promise = pb.send("/delivery/", {
      method: "POST",
      body: data,
    });
    toast.promise(promise, {
      loading: "Saving delivery settings…",
      success: () => {
        updateDelivery({
          fullAdress: data.full_address,
          city: data.city,
          state: data.state,
          location: { lat: data.location.lat, lon: data.location.lon },
        });
        onSuccess();
        return "Delivery settings saved!";
      },
      error: (err) => err?.message ?? "Failed to save delivery settings.",
    });

    await promise.catch(() => {});
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register("full_address")} />
      <input type="hidden" {...register("location.lat")} />
      <input type="hidden" {...register("location.lon")} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Full Address</label>
        <PlacesInput
          onPlaceSelected={handlePlaceSelected}
          placeholder="Start typing your address…"
          className="input input-bordered w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">City</label>
          <input
            {...register("city")}
            type="text"
            readOnly
            placeholder="Auto-filled"
            className="input input-bordered w-full bg-base-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">State</label>
          <input
            {...register("state")}
            type="text"
            readOnly
            placeholder="Auto-filled"
            className="input input-bordered w-full bg-base-200"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full mt-1"
      >
        {isSubmitting ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          "Save address"
        )}
      </button>
    </form>
  );
}
