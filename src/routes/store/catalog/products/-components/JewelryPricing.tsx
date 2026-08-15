import {
  ChevronDown,
  Package,
  ShoppingCart,
  Truck,
  Sparkles,
  Check,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import ColorPicker from "#/components/inputs/ColorPicker";
import type { PRODUCT_RESULT } from "../../-components/products";
import { useProfile } from "#/store/user";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import { useState } from "react";

type FormValues = {
  wristSize: string;
  mainColor: string;
  secondaryColor: string;
  extraInfo: string;
};

export default function JewelryPricing(props: { product: PRODUCT_RESULT }) {
  const user = useProfile((state) => state.profile);
  const product = props.product;
  const [quantity, setQuantity] = useState(1);
  const colorSelection = (product as any).color_selection !== false;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      wristSize: "",
      mainColor: (product as any).mainColor || "#D4AF37",
      secondaryColor: (product as any).secondaryColor || "#FFFFFF",
      extraInfo: "",
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

  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["cart-total"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload = {
      type: "JEWELRY",
      mainColor: data.mainColor,
      secondaryColor: data.secondaryColor,
      wristSize: data.wristSize,
      amount: quantity,
      extraInfo: data.extraInfo,
      product: props.product.id,
    };

    toast.promise(add_to_cart.mutateAsync(payload), {
      loading: "Adding fine jewelry to bag...",
      success: "Added to your shopping bag!",
      error: "Failed to add to cart.",
    });
  };

  const totalPrice = (product.price ?? 0) * quantity;

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden p-6 space-y-6">
      {/* Pricing Header */}
      <div className="space-y-1 pb-4 border-b border-base-200">
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
          Fine Jewelry Piece
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-base-content/50">₦</span>
            <span className="text-3xl font-extrabold text-base-content tracking-tight">
              {totalPrice.toLocaleString()}
            </span>
          </div>
          {quantity > 1 && (
            <span className="text-xs text-base-content/50">
              (₦{(product.price ?? 0).toLocaleString()} each)
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Wrist Size Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-xs flex items-center gap-1.5">
              <span>Wrist / Sizing (cm)</span>
              <span className="text-error">*</span>
            </label>
            <span className="text-[11px] text-base-content/50">Standard: 14–18 cm</span>
          </div>

          <input
            type="number"
            step="0.1"
            placeholder="e.g. 16.5"
            className={`input input-sm input-bordered w-full rounded-xl text-xs focus:input-primary ${
              errors.wristSize ? "input-error" : ""
            }`}
            {...register("wristSize", {
              required: "Please specify wrist / band size in cm",
              min: { value: 10, message: "Minimum size is 10 cm" },
              max: { value: 30, message: "Maximum size is 30 cm" },
            })}
          />
          {errors.wristSize ? (
            <p className="text-error text-xs">{errors.wristSize.message}</p>
          ) : (
            <p className="text-[11px] text-base-content/40">
              Measure around your wrist where you normally wear a bracelet.
            </p>
          )}
        </div>

        {/* Color Palette Section */}
        {colorSelection ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>Custom Tone & Gem Options</span>
              </label>
              <span className="badge badge-primary badge-xs text-[9px] uppercase font-bold">
                Customizable
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Controller
                name="mainColor"
                control={control}
                render={({ field }) => (
                  <ColorPicker
                    label="Primary Metal / Base"
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
                    label="Accent / Stone"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        ) : (
          ((product as any).mainColor || (product as any).secondaryColor) && (
            <div className="p-3.5 rounded-xl bg-base-200/50 border border-base-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-base-content/70">
                  Standard Metal & Palette
                </span>
                <span className="badge badge-ghost badge-xs text-[9px] uppercase">
                  Standard Piece
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {(product as any).mainColor && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: (product as any).mainColor }}
                    />
                    <span className="font-mono text-[11px] text-base-content/70">
                      {(product as any).mainColor}
                    </span>
                  </div>
                )}
                {(product as any).secondaryColor && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: (product as any).secondaryColor }}
                    />
                    <span className="font-mono text-[11px] text-base-content/70">
                      {(product as any).secondaryColor}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Quantity Controls */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-base-200/40 border border-base-200">
          <span className="text-xs font-bold">Quantity</span>
          <div className="join border border-base-300 rounded-xl overflow-hidden bg-base-100">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="join-item btn btn-xs btn-ghost px-2.5 font-bold"
            >
              -
            </button>
            <span className="join-item px-3 flex items-center text-xs font-bold font-mono">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="join-item btn btn-xs btn-ghost px-2.5 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Custom Order Notes */}
        <div className="space-y-1.5">
          <label className="font-bold text-xs">Special Requests / Engraving</label>
          <textarea
            rows={2}
            placeholder="Add any specific requests or engraving notes…"
            className="textarea textarea-sm textarea-bordered w-full rounded-xl focus:textarea-primary resize-none text-xs"
            {...register("extraInfo")}
          />
        </div>

        {/* Add to Cart CTA */}
        <div className="pt-2">
          {user ? (
            <button
              type="submit"
              className="btn btn-primary rounded-xl w-full gap-2 text-sm shadow-sm"
              disabled={add_to_cart.isPending}
            >
              {add_to_cart.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : query.data?.data ? (
                <>
                  <Check className="size-4" /> Added to Bag (Add Another)
                </>
              ) : (
                <>
                  <ShoppingCart className="size-4" /> Add to Shopping Bag
                </>
              )}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-base-200/60 border border-base-200 text-center space-y-2.5">
              <p className="text-xs text-base-content/70">
                Please sign in to configure and purchase this piece.
              </p>
              <Link to="/login" className="btn btn-sm btn-primary rounded-xl w-full">
                Sign In to Order
              </Link>
            </div>
          )}
        </div>
      </form>

      {/* Accordion Info */}
      <div className="space-y-2 pt-2 border-t border-base-200">
        <details className="group bg-base-200/30 rounded-xl overflow-hidden text-xs">
          <summary className="flex justify-between items-center cursor-pointer p-3 font-bold list-none hover:bg-base-200/60 transition-colors">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-primary" /> Delivery & Handcraft Timeline
            </span>
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="p-3 pt-0 text-base-content/70 space-y-1.5 border-t border-base-200/40 mt-1">
            <p>• Handcrafting & preparation: 2–4 working days</p>
            <p>• Nationwide insured delivery via verified courier</p>
            <p>• Complimentary studio pickup available in Lagos</p>
          </div>
        </details>

        <details className="group bg-base-200/30 rounded-xl overflow-hidden text-xs">
          <summary className="flex justify-between items-center cursor-pointer p-3 font-bold list-none hover:bg-base-200/60 transition-colors">
            <span className="flex items-center gap-1.5">
              <Package className="size-3.5 text-primary" /> Packaging & Presentation
            </span>
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="p-3 pt-0 text-base-content/70 space-y-1.5 border-t border-base-200/40 mt-1">
            <p>• Packaged in a velvet jewelry pouch and signature gift box</p>
            <p>• Includes polishing cloth and care guide</p>
          </div>
        </details>
      </div>
    </div>
  );
}
