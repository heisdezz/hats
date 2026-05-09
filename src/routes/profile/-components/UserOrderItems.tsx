import { pb } from "#/client/pb";
import type {
  OrderItemsResponse,
  ProductsResponse,
} from "#/../pocketbase-types";

type ItemWithProduct = OrderItemsResponse<{
  originalProduct: ProductsResponse;
}>;

function getProductUrl(product: ProductsResponse | undefined) {
  if (!product) return null;
  const file = product.preview || product.images?.[0];
  return file ? pb.files.getURL(product, file) : null;
}

export default function UserOrderItems({
  items,
}: {
  items: ItemWithProduct[];
}) {
  if (!items.length) return null;

  const first = items[0];
  const firstProduct = (first.expand as any)?.originalProduct as
    | ProductsResponse
    | undefined;
  const previewUrl = getProductUrl(firstProduct);

  return (
    <div className="rounded-2xl overflow-hidden border border-base-200">
      {/* First item image banner */}
      <div className="relative h-40 bg-base-200">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={firstProduct?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/20 to-transparent" />
        {(firstProduct?.mainColor || firstProduct?.secondaryColor) && (
          <div className="absolute top-3 right-3 flex gap-1.5">
            {firstProduct.mainColor && (
              <span
                className="size-5 rounded-full border-2 border-white/70 shadow"
                style={{ backgroundColor: firstProduct.mainColor }}
              />
            )}
            {firstProduct.secondaryColor && (
              <span
                className="size-5 rounded-full border-2 border-white/70 shadow"
                style={{ backgroundColor: firstProduct.secondaryColor }}
              />
            )}
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="badge badge-neutral badge-sm">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-base-100 px-4 pb-4 -mt-1 flex flex-col gap-3">
        <p className="text-xs text-base-content/40 uppercase tracking-widest font-semibold">
          Items
        </p>

        <div className="flex flex-col divide-y divide-base-200">
          {items.map((item, i) => {
            const product = (item.expand as any)?.originalProduct as
              | ProductsResponse
              | undefined;
            const imgUrl = getProductUrl(product);
            return (
              <div
                key={item.id ?? i}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={product?.title}
                    className="size-11 rounded-xl object-cover shrink-0 bg-base-200"
                  />
                ) : (
                  <div className="size-11 rounded-xl bg-base-200 shrink-0 flex items-center justify-center text-base-content/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {product?.title ?? (
                      <span className="italic text-base-content/30">
                        Unknown
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {product?.mainColor && (
                      <span
                        className="size-3 rounded-full border border-base-content/20"
                        style={{ backgroundColor: product.mainColor }}
                      />
                    )}
                    {product?.secondaryColor && (
                      <span
                        className="size-3 rounded-full border border-base-content/20"
                        style={{ backgroundColor: product.secondaryColor }}
                      />
                    )}
                    <span className="text-xs text-base-content/40">
                      ×{item.amount ?? 1} · ₦{Math.round((item.price ?? 0) / (item.amount || 1)).toLocaleString()} each
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0 text-primary">
                  ₦{(item.price ?? 0).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
