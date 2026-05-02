import {
  ChevronDown,
  Package,
  Tag,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import ColorPicker from "#/components/inputs/ColorPicker";
import type { PRODUCT_RESULT } from "../../-components/products";
import RenderDescription from "#/routes/store/-components/RenderDescription";
import { useProfile } from "#/store/user";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";

type FormValues = {
  wristSize: string;
  mainColor: string;
  secondaryColor: string;
  extraInfo: string;
};

export default function JewelryPricing(props: { product: PRODUCT_RESULT }) {
  const user = useProfile((state) => state.profile);
  const product = props.product;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      mainColor: product.mainColor || "#000000",
      secondaryColor: product.secondaryColor || "#ffffff",
    },
  });

  const query = useQuery<{ data: boolean }>({
    queryKey: ["in-cart", props.product.id],
    queryFn: () =>
      pb.send("/cart/" + props.product.id, {
        method: "GET",
        params: { productId: props.product.id },
      }),
  });

  const add_to_cart = useMutation({
    mutationFn: (payload: any) => {
      const form_data = new FormData();
      for (const key in payload) {
        form_data.append(key, payload[key]);
      }
      return pb.collection("cart").create(form_data);
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload = {
      type: "JEWELRY",
      mainColor: data.mainColor,
      secondaryColor: data.secondaryColor,
      wristSize: data.wristSize,
      amount: 1,
      extraInfo: data.extraInfo,
      product: props.product.id,
    };
    toast.promise(add_to_cart.mutateAsync(payload), {
      loading: "Adding to cart...",
      success: "Added to cart!",
      error: "Failed to add to cart.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <ShortInfo product={product} />

      {product.price != null && (
        <div className="flex items-baseline gap-1">
          <span className="text-base text-base-content/50 font-medium">₦</span>
          <span className="text-3xl font-bold tracking-tight">
            {product.price.toLocaleString()}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-sm">Wrist Size</label>
            <span className="text-xs text-base-content/50">cm</span>
          </div>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 16.5"
            className={`input input-bordered w-full focus:input-primary ${errors.wristSize ? "input-error" : ""}`}
            {...register("wristSize", {
              required: "Please enter your wrist size",
              min: { value: 12, message: "Minimum 12 cm" },
              max: { value: 25, message: "Maximum 25 cm" },
            })}
          />
          {errors.wristSize ? (
            <p className="text-error text-xs">{errors.wristSize.message}</p>
          ) : (
            <p className="text-xs text-base-content/40">
              Typical range: 14–20 cm
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="mainColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                label="Main Color"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="secondaryColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                label="Secondary Color"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Additional Notes</label>
          <textarea
            rows={3}
            placeholder="Any special requests or extra information…"
            className="textarea textarea-bordered w-full focus:textarea-primary resize-none text-sm"
            {...register("extraInfo")}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="btn btn-primary btn-xl flex-1 gap-2"
            disabled={!user || query.isLoading || query.data?.data}
          >
            <ShoppingCart className="size-4" />
            {query.data?.data ? "In Cart" : "Add to Cart"}
          </button>
        </div>
      </form>

      {!user && (
        <section className="alert flex alert-info alert-soft ring fade">
          <span className="flex-1">
            You need to be logged in to add to cart
          </span>
          <Link className="btn btn-sm btn-soft ring fade btn-accent" to="/login">
            Login
          </Link>
        </section>
      )}

      <div className="flex flex-col gap-3">
        <details
          className="group bg-base-100 border border-base-200 rounded-2xl overflow-hidden"
          open
        >
          <summary className="flex justify-between items-center cursor-pointer px-4 py-3.5 font-semibold text-sm list-none hover:bg-base-200/50 transition-colors">
            Description & Details
            <ChevronDown className="size-4 text-base-content/50 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 text-sm text-base-content/70 leading-relaxed border-t border-base-200">
            <div className="pt-3">
              <RenderDescription
                text={product.description ?? "No description available."}
              />
            </div>
          </div>
        </details>

        <details
          className="group bg-base-100 border border-base-200 rounded-2xl overflow-hidden"
          open
        >
          <summary className="flex justify-between items-center cursor-pointer px-4 py-3.5 font-semibold text-sm list-none hover:bg-base-200/50 transition-colors">
            Shipping
            <ChevronDown className="size-4 text-base-content/50 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4 border-t border-base-200">
            <div className="pt-3 grid grid-cols-2 gap-2.5 text-sm">
              {[
                { icon: Tag, label: "Discount", value: "50% off" },
                { icon: Package, label: "Package", value: "Regular" },
                { icon: Truck, label: "Delivery", value: "3–4 Working Days" },
                { icon: Truck, label: "Est. Arrival", value: "10–12 Oct 2024" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-2.5 bg-base-200/60 rounded-xl p-3"
                >
                  <Icon className="size-4 text-base-content/40 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-base-content/50 text-xs">{label}</p>
                    <p className="font-medium text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

const ShortInfo = ({ product }: { product: PRODUCT_RESULT }) => {
  const section = product.expand?.category?.expand?.parent?.name;
  const category = product.expand?.category?.name;
  const description = product.description ?? "";
  return (
    <div className="flex flex-col gap-4">
      {(section || category) && (
        <div className="flex items-center border-b fade pb-2 gap-2 text-sm text-base-content/80">
          {section && <span>{section}</span>}
          {section && category && <span>/</span>}
          {category && <span>{category}</span>}
        </div>
      )}
      <h1 className="text-2xl font-bold leading-snug">
        {product.title ?? "Untitled"}
      </h1>
      <RenderDescription text={description} />
    </div>
  );
};
