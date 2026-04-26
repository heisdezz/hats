import { pb } from "#/client/pb";
import type {
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
} from "pocketbase-types";
import { Pencil } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function AdminProductCard({
  product,
}: {
  product: ProductsResponse<{
    category: CategoryResponse<{ parent: Partial<SectionResponse> }>;
  }>;
}) {
  const imageUrl = product.preview
    ? pb.files.getURL(product, product.preview)
    : product.images?.length
      ? pb.files.getURL(product, product.images[0])
      : null;

  const category = product.expand?.category?.name;
  const section = product.expand?.category?.expand?.parent?.name;

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <figure className="aspect-square bg-base-200 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title ?? "Product"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-base-content/20 text-xs">
            No image
          </div>
        )}

        <Link
          to={`/admin/dashboard/products/edit/${product.id}`}
          className="btn  btn-circle absolute top-2 right-2 bg-base-100/80 backdrop-blur-sm border-0 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil size={13} />
        </Link>

        {section && (
          <span className="badge badge-neutral badge-sm absolute bottom-2 left-2 opacity-90">
            {section}
          </span>
        )}
      </figure>

      <div className="p-3 flex flex-col gap-0.5">
        {category && (
          <span className="text-xs text-base-content/40 font-medium uppercase tracking-wide">
            {category}
          </span>
        )}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
          {product.title ?? "Untitled"}
        </h3>
        {product.price != null && (
          <p className="text-primary font-bold text-sm mt-1">
            ₦{product.price.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
