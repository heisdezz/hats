import { createFileRoute } from "@tanstack/react-router";
import { get_jewelry } from "../-components/products";
import GridContainer from "#/components/GridContainer.tsx";
import ProductCard from "#/components/ProductCard.tsx";

interface SEARCH {
  category?: string;
  page?: number;
}
export const Route = createFileRoute("/store/catalog/jewelry/")({
  component: RouteComponent,
  validateSearch: (search: SEARCH) => {
    return search;
  },
  loader: get_jewelry,
});

function RouteComponent() {
  const search = Route.useSearch();
  const data = Route.useLoaderData();
  return (
    <div className="page-wrap">
      {/*{JSON.stringify(data)}*/}
      <GridContainer>
        {data.items.map((hat) => (
          //@ts-ignore
          <ProductCard key={hat.id} product={hat} />
        ))}
      </GridContainer>
    </div>
  );
}
