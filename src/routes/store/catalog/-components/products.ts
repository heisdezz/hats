import { ssr_pb } from "#/client/pb";
import type {
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
  TagsResponse,
} from "pocketbase-types";

export interface PRODUCT_RESULT
  extends ProductsResponse<{
    category?: CategoryResponse<{ parent?: SectionResponse }>;
    tags?: TagsResponse[];
  }> {}

export interface ProductFilterOptions {
  section?: string;
  category?: string;
  tag?: string;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

export async function get_products(options: ProductFilterOptions = {}) {
  const pb = ssr_pb();
  const page = options.page || 1;
  const perPage = options.perPage || 12;

  const filters: string[] = ["published = true"];

  if (options.section) {
    filters.push(
      pb.filter(
        "category.parent.name = {:section} || category.parent.id = {:section} || category.parent ~ {:section}",
        { section: options.section }
      )
    );
  }

  if (options.category) {
    filters.push(
      pb.filter(
        "category.id = {:category} || category.name = {:category} || category ~ {:category}",
        { category: options.category }
      )
    );
  }

  if (options.tag) {
    filters.push(
      pb.filter(
        "tags.id = {:tag} || tags.name ~ {:tag} || tags ~ {:tag}",
        { tag: options.tag }
      )
    );
  }

  if (options.search) {
    filters.push(
      pb.filter("title ~ {:search} || description ~ {:search}", {
        search: options.search,
      })
    );
  }

  const sort = options.sort || "-created";

  return await pb.collection("products").getList<PRODUCT_RESULT>(page, perPage, {
    expand: "category.parent,tags",
    filter: filters.join(" && "),
    sort,
  });
}

export async function get_categories() {
  const pb = ssr_pb();
  return await pb.collection("category").getFullList<CategoryResponse<{ parent?: SectionResponse }>>({
    expand: "parent",
    sort: "name",
  });
}

export async function get_sections() {
  const pb = ssr_pb();
  return await pb.collection("section").getFullList<SectionResponse>({
    sort: "name",
  });
}

export async function get_tags() {
  const pb = ssr_pb();
  return await pb.collection("tags").getFullList<TagsResponse>({
    sort: "name",
  });
}

export const get_hats = async () => {
  return await get_products({ section: "hats" });
};

export const get_jewelry = async () => {
  return await get_products({ section: "jewelry" });
};
