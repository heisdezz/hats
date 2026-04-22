import { createFileRoute } from "@tanstack/react-router";
import { get_products } from "./-components/products";
import CatalogList from "./-components/Cataloglist";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().optional(),
});

export const Route = createFileRoute("/catalog/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: async () => await get_products(),
});

function RouteComponent() {
  const products = Route.useLoaderData();
  return (
    <div className="page-wrap">
      {/*Hello "/catalog/"!, {JSON.stringify(products)}*/}
      <CatalogList initialProducts={products}></CatalogList>
    </div>
  );
}
