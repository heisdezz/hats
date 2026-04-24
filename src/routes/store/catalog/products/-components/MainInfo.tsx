import { pb } from "#/client/pb";
import Carousel from "#/components/Carousel";
import DOMPurify from "isomorphic-dompurify";

import type {
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
} from "pocketbase-types";

export default function MainInfo(props: {
  product: ProductsResponse<{
    category: CategoryResponse<{ parent: SectionResponse }>;
  }>;
}) {
  const { product } = props;

  const slides = (product.images ?? []).map((img) =>
    pb.files.getURL(product, img),
  );

  const category = product.expand?.category?.name;
  const section = product.expand?.category?.expand?.parent?.name;
  const description = product.description ?? "";
  const sanitizedDescription = DOMPurify.sanitize(description);
  return (
    <main className=" flex-1 flex flex-col gap-6 lg:gap-10">
      <div className="h-150 flex w-full ">
        <Carousel slides={slides} alt={product.title ?? "Product"} />
      </div>

      <div className="flex flex-col gap-4">
        {(section || category) && (
          <div className="flex items-center gap-2 text-sm text-base-content/50">
            {section && <span>{section}</span>}
            {section && category && <span>/</span>}
            {category && <span>{category}</span>}
          </div>
        )}

        <h1 className="text-2xl font-bold leading-snug">
          {product.title ?? "Untitled"}
        </h1>

        {product.price != null && (
          <p className="text-primary text-2xl font-bold">
            ₦{product.price.toLocaleString()}
          </p>
        )}

        <div
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          className="text-base-content/70 text-sm leading-relaxed"
        ></div>
      </div>
    </main>
  );
}
