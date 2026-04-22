import { createFileRoute } from "@tanstack/react-router";
import { get_hats } from "../-components/products";
import GridContainer from "#/components/GridContainer";
import ProductCard from "#/components/ProductCard";

export const Route = createFileRoute("/catalog/hats/")({
  component: RouteComponent,
  loader: get_hats,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  return (
    <div className="page-wrap">
      <GridContainer>
        {data.items.map((hat) => (
          //@ts-ignore
          <ProductCard key={hat.id} product={hat} />
        ))}
      </GridContainer>
    </div>
  );
}
