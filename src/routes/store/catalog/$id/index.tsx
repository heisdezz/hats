import { createFileRoute, Link } from "@tanstack/react-router";
import { get_by_name, get_sections } from "../-components/products";
import GridContainer from "#/components/GridContainer.tsx";
import ProductCard from "#/components/ProductCard.tsx";
import NoItemsFound from "#/components/NoItemsFound";
import { Sparkles, ArrowLeft } from "lucide-react";
import Pagination from "#/components/Pagination";

interface SEARCH {
  category?: string;
  page?: number;
}

export const Route = createFileRoute("/store/catalog/$id/")({
  component: RouteComponent,
  validateSearch: (search: SEARCH) => {
    return search;
  },
  loaderDeps: ({ search: { category, page } }) => ({ category, page }),
  loader: async ({ params, deps }) => {
    const [products, sections] = await Promise.all([
      get_by_name(params.id, {
        category: deps.category,
        page: deps.page || 1,
      }),
      get_sections(),
    ]);

    const currentSection = sections.find(
      (s) =>
        s.name?.toLowerCase() === params.id.toLowerCase() ||
        s.id === params.id ||
        (params.id.toLowerCase().startsWith("jewel") && s.name?.toLowerCase().includes("jewel")),
    );

    return {
      products,
      sectionName: params.id,
      currentSection,
    };
  },
});

function RouteComponent() {
  const { products, sectionName, currentSection } = Route.useLoaderData();
  const search = Route.useSearch();

  const title = currentSection?.display_name || (sectionName.charAt(0).toUpperCase() + sectionName.slice(1));
  const description =
    currentSection?.description ||
    `Browse our handcrafted ${sectionName} collection designed for special occasions and everyday elegance.`;

  return (
    <div className="page-wrap py-6 space-y-6">
      {/* Breadcrumb & Section Header */}
      <div className="flex flex-col gap-2 border-b border-base-200 pb-5">
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <Link to="/store" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/store/catalog" className="hover:text-primary transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-base-content font-semibold capitalize">{title}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-neutral text-xs font-semibold">
              {products.totalItems} product{products.totalItems !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Product List or Empty State */}
      {products.items.length === 0 ? (
        <NoItemsFound
          title={`No ${title} Products Found`}
          description={`We currently don't have any items listed under ${title}. Explore our full catalog or check back soon!`}
          actionText="Browse All Collections"
          actionHref="/store/catalog"
        />
      ) : (
        <div className="space-y-8">
          <GridContainer>
            {products.items.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </GridContainer>

          {products.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={products.page}
                totalPages={products.totalPages}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
