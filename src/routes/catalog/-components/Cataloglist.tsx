import type { ProductsResponse } from "pocketbase-types";
import { get_products } from "./products";
import { useQuery } from "@tanstack/react-query";
import type { ListResult } from "pocketbase";
import GridContainer from "#/components/GridContainer";
import ProductCard from "#/components/ProductCard";

export default function CatalogList(props: {
  initialProducts: ListResult<ProductsResponse>;
}) {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: get_products,
    initialData: props.initialProducts,
    staleTime: 30_000,
  });
  return (
    <div>
      <GridContainer>
        {query.data.items.map((item) => (
          //@ts-ignore
          <ProductCard product={item} key={item.id} />
        ))}
      </GridContainer>
    </div>
  );
}
