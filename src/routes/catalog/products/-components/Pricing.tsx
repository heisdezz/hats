import {
  ChevronDown,
  Heart,
  Package,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import RenderDescription from "#/routes/-components/RenderDescription";
import type { PRODUCT_RESULT } from "../../-components/products";
import MainInfo from "./MainInfo";

type FormValues = { circumference: string };

export default function Pricing(props: { product: PRODUCT_RESULT }) {
  const product = props.product;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    console.log("Add to cart", { product: product.id, ...data });
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
            <label className="font-semibold text-sm">Head Circumference</label>
            <span className="text-xs text-base-content/50">cm</span>
          </div>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 56.5"
            className={`input input-bordered w-full focus:input-primary ${errors.circumference ? "input-error" : ""}`}
            {...register("circumference", {
              required: "Please enter your head circumference",
              min: { value: 40, message: "Minimum 40 cm" },
              max: { value: 70, message: "Maximum 70 cm" },
            })}
          />
          {errors.circumference ? (
            <p className="text-error text-xs">{errors.circumference.message}</p>
          ) : (
            <p className="text-xs text-base-content/40">
              Typical range: 54–62 cm
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn btn-primary btn-xl flex-1 gap-2">
            <ShoppingCart className="size-4" />
            Add to Cart
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-soft ring fade btn-xl btn-square text-base-content/60 hover:text-error hover:border-error"
          >
            <Heart className="size-5" />
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <details
          className="group bg-base-100 border border-base-200 rounded-2xl overflow-hidden"
          open
        >
          <summary className="flex justify-between items-center cursor-pointer px-4 py-3.5 font-semibold text-sm list-none hover:bg-base-200/50 transition-colors">
            Description & Fit
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
  const category = product.expand?.category?.name;
  const section = product.expand?.category?.expand?.parent?.name;
  const description = product.description ?? "";
  return (
    <>
      <div className="flex flex-col gap-4 ">
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

        <RenderDescription text={description}></RenderDescription>
      </div>
    </>
  );
};
