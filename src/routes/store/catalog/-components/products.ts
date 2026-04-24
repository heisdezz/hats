import { ssr_pb } from "#/client/pb";
import type {
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
} from "pocketbase-types";

export async function get_products() {
  const pb = ssr_pb();
  return await pb.collection("products").getList(1, 10, {
    expand: "category.parent",
  });
}

export interface PRODUCT_RESULT extends ProductsResponse<{
  category: CategoryResponse<{ parent: SectionResponse }>;
}> {}

export const get_hats = async () => {
  const pb = ssr_pb();
  return await pb.collection("products").getList(1, 10, {
    expand: "category.parent",
    filter: "category.parent.name = 'hats'",
  });
};
export const get_jewelry = async () => {
  const pb = ssr_pb();
  return await pb.collection("products").getList(1, 10, {
    expand: "category.parent",
    filter: "category.parent.name = 'jewelry'",
  });
};
