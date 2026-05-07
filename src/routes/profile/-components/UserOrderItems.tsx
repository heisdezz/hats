import { pb } from "#/client/pb";
import type { OrderItemsResponse, ProductsResponse } from "#/../pocketbase-types";

type ItemWithProduct = OrderItemsResponse<{ originalProduct: ProductsResponse }>;

export default function UserOrderItems({ item }: { item: ItemWithProduct }) {
  const product = (item.expand as any)?.originalProduct as
    | ProductsResponse
    | undefined;

  const previewUrl = product?.preview
    ? pb.files.getURL(product, product.preview)
    : product?.images?.[0]
      ? pb.files.getURL(product, product.images[0])
      : null;

  const subtotal = (item.price ?? 0) * (item.amount ?? 1);

  return (
    <div className="rounded-2xl overflow-hidden border border-base-200">
      {/* Image banner */}
      <div className="relative h-40 bg-base-200">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={product?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/20 to-transparent" />

        {(product?.mainColor || product?.secondaryColor) && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {product?.mainColor && (
              <span
                className="size-5 rounded-full border-2 border-white/70 shadow"
                style={{ backgroundColor: product.mainColor }}
              />
            )}
            {product?.secondaryColor && (
              <span
                className="size-5 rounded-full border-2 border-white/70 shadow"
                style={{ backgroundColor: product.secondaryColor }}
              />
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-base-100 px-4 pb-4 -mt-1 flex flex-col gap-3">
        <div>
          <p className="text-xs text-base-content/40 uppercase tracking-widest font-semibold mb-0.5">
            Item
          </p>
          <p className="font-semibold leading-tight">
            {product?.title ?? (
              <span className="text-base-content/30 italic">Unknown product</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Unit price", value: `₦${(item.price ?? 0).toLocaleString()}` },
            { label: "Qty", value: `×${item.amount ?? 1}` },
            { label: "Total", value: `₦${subtotal.toLocaleString()}`, accent: true },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className={`rounded-xl p-3 ${accent ? "bg-primary/10" : "bg-base-200"}`}
            >
              <p className="text-xs text-base-content/40">{label}</p>
              <p className={`font-bold text-sm mt-0.5 ${accent ? "text-primary" : ""}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
