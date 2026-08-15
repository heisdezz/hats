import { createFileRoute } from "@tanstack/react-router";
import { get_categories, get_products, get_sections, get_tags } from "./-components/products";
import CatalogList from "./-components/Cataloglist";
import { z } from "zod";

const searchSchema = z.object({
  query: z.string().optional(),
  search: z.string().optional(),
  section: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().catch(1).optional(),
});

export const Route = createFileRoute("/store/catalog/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { query, search, section, category, tag, sort, page } }) => ({
    query,
    search,
    section,
    category,
    tag,
    sort,
    page,
  }),
  loader: async ({ deps }) => {
    const searchTerm = deps.search || deps.query;
    const [products, categories, sections, tags] = await Promise.all([
      get_products({
        section: deps.section,
        category: deps.category,
        tag: deps.tag,
        search: searchTerm,
        sort: deps.sort,
        page: deps.page || 1,
      }),
      get_categories(),
      get_sections(),
      get_tags(),
    ]);

    return {
      products,
      categories,
      sections,
      tags,
    };
  },
});

function RouteComponent() {
  const { products, categories, sections, tags } = Route.useLoaderData();
  const searchParams = Route.useSearch();

  return (
    <div className="page-wrap py-6">
      <CatalogList
        initialProducts={products}
        categories={categories}
        sections={sections}
        tags={tags}
        searchParams={searchParams}
      />
    </div>
  );
}

