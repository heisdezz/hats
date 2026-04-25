import { pb } from "#/client/pb";
import type {
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
} from "pocketbase-types";
import { Link } from "@tanstack/react-router";

export default function ProductCard({
  product,
}: {
  product: ProductsResponse<{
    category: CategoryResponse<{ parent: Partial<SectionResponse> }>;
  }>;
}) {
  const imageUrl = product.images?.length
    ? pb.files.getURL(product, product.images[0])
    : null;

  const category = product.expand?.category?.name;
  const section_name = product.expand?.category?.expand?.parent?.name;
  const id = product.id;

  const route = `/store/catalog/products/${section_name}/${id}`;
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <figure className="aspect-square bg-base-200 relative">
        {imageUrl ? (
          <img
            loading="lazy"
            src={imageUrl}
            alt={product.title ?? "Product"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-base-content/30 text-sm">
            No image
          </div>
        )}
        {section_name && (
          <span className="badge badge-neutral badge-sm absolute top-2 left-2 opacity-90">
            {section_name}
          </span>
        )}
      </figure>
      <div className="card-body p-3 gap-1">
        {category && (
          <span className="text-xs text-base-content/50 font-medium uppercase tracking-wide">
            {category}
          </span>
        )}
        <h3 className="card-title text-sm font-semibold line-clamp-2 leading-snug -mt-0.5">
          {product.title ?? "Untitled"}
        </h3>
        {product.price != null && (
          <p className="text-primary font-bold text-base mt-0.5">
            ₦{product.price.toLocaleString()}
          </p>
        )}
        <div className="card-actions mt-1.5">
          <Link to={route} className="btn btn-primary btn-sm w-full">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
