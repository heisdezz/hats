import { pb } from "#/client/pb";
import type { ProductsResponse } from "#/../pocketbase-types";

export default function ProductDetails({
  product,
}: {
  product: ProductsResponse;
}) {
  const imageUrl = product.preview
    ? pb.files.getURL(product, product.preview)
    : product.images?.length
      ? pb.files.getURL(product, product.images[0])
      : null;

  return (
    <div className="card bg-base-200 shadow-none">
      <div className="card-body p-4 gap-3">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          Product
        </p>
        <div className="flex gap-4 items-start">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="size-20 rounded-xl object-cover shrink-0 bg-base-300"
            />
          ) : (
            <div className="size-20 rounded-xl bg-base-300 shrink-0 flex items-center justify-center text-base-content/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}

          <div className="flex flex-col gap-1.5 min-w-0">
            <p className="font-semibold leading-tight truncate">
              {product.title ?? "Unnamed product"}
            </p>
            <p className="text-sm font-medium text-primary">
              ₦{(product.price ?? 0).toLocaleString()}
            </p>

            {(product.mainColor || product.secondaryColor) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {product.mainColor && (
                  <span
                    className="size-4 rounded-full border border-base-300 inline-block"
                    style={{ backgroundColor: product.mainColor }}
                    title={`Main: ${product.mainColor}`}
                  />
                )}
                {product.secondaryColor && (
                  <span
                    className="size-4 rounded-full border border-base-300 inline-block"
                    style={{ backgroundColor: product.secondaryColor }}
                    title={`Secondary: ${product.secondaryColor}`}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
