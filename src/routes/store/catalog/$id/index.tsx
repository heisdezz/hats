import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  get_by_name,
  get_categories,
  get_sections,
  get_tags,
  type PRODUCT_RESULT,
} from "../-components/products";
import GridContainer from "#/components/GridContainer";
import ProductCard from "#/components/ProductCard";
import NoItemsFound from "#/components/NoItemsFound";
import CatalogFilterSidebar, { type FilterState } from "../-components/CatalogFilterSidebar";
import Pagination from "#/components/Pagination";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Search, X, SlidersHorizontal, Filter } from "lucide-react";
import { z } from "zod";
import { normalizeTagItem } from "#/routes/admin/dashboard/products/-components/TagsInput";

const searchSchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  page: z.number().catch(1).optional(),
});

export const Route = createFileRoute("/store/catalog/$id/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { category, tag, search, sort, page } }) => ({
    category,
    tag,
    search,
    sort,
    page,
  }),
  loader: async ({ params, deps }) => {
    const [products, categories, sections, tags] = await Promise.all([
      get_by_name(params.id, {
        category: deps.category,
        tag: deps.tag,
        search: deps.search,
        sort: deps.sort,
        page: deps.page || 1,
      }),
      get_categories(),
      get_sections(),
      get_tags(),
    ]);

    const currentSection = sections.find(
      (s) =>
        s.name?.toLowerCase() === params.id.toLowerCase() ||
        s.id === params.id ||
        (params.id.toLowerCase().startsWith("jewel") && s.name?.toLowerCase().includes("jewel")),
    );

    return {
      initialProducts: products,
      categories,
      sections,
      tags,
      sectionName: params.id,
      currentSection,
    };
  },
});

function RouteComponent() {
  const {
    initialProducts,
    categories,
    sections,
    tags,
    sectionName,
    currentSection,
  } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const params = Route.useParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(searchParams.search || "");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setSearchInput(searchParams.search || "");
  }, [searchParams.search]);

  const query = useQuery({
    queryKey: [
      "section-products",
      params.id,
      searchParams.category,
      searchParams.tag,
      searchParams.search,
      searchParams.sort,
      searchParams.page,
    ],
    queryFn: () =>
      get_by_name(params.id, {
        category: searchParams.category,
        tag: searchParams.tag,
        search: searchParams.search,
        sort: searchParams.sort,
        page: searchParams.page || 1,
      }),
    initialData: initialProducts,
    staleTime: 10_000,
  });

  const updateFilters = (newParams: Partial<FilterState>) => {
    const updated = {
      ...searchParams,
      ...newParams,
      page: newParams.page ?? 1,
    };

    Object.keys(updated).forEach((key) => {
      const k = key as keyof typeof updated;
      if (!updated[k]) delete updated[k];
    });

    navigate({
      to: "/store/catalog/$id",
      params: { id: params.id },
      search: updated as any,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    navigate({
      to: "/store/catalog/$id",
      params: { id: params.id },
      search: {},
    });
  };

  const activeFilterCount =
    (searchParams.category ? 1 : 0) +
    (searchParams.tag ? 1 : 0) +
    (searchParams.search ? 1 : 0) +
    (searchParams.sort && searchParams.sort !== "-created" ? 1 : 0);

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const totalItems = query.data?.totalItems ?? items.length;
  const currentPage = searchParams.page || 1;

  const title =
    currentSection?.display_name ||
    sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
  const description =
    currentSection?.description ||
    `Browse our handcrafted ${sectionName} collection designed for weddings, events, and everyday elegance.`;

  // Normalized clean tags
  const cleanTagsList = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    tags.forEach((t) => {
      const normalized = normalizeTagItem(t.name || t);
      normalized.forEach((n) => {
        if (n.tagName && !map.has(n.tagName.toLowerCase())) {
          map.set(n.tagName.toLowerCase(), {
            id: t.id || n.tagId || n.tagName,
            name: n.tagName,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [tags]);

  const activeCategoryName = useMemo(() => {
    if (!searchParams.category) return null;
    const cat = categories.find(
      (c) => c.id === searchParams.category || c.name === searchParams.category,
    );
    return cat ? cat.name : searchParams.category;
  }, [searchParams.category, categories]);

  const activeTagName = useMemo(() => {
    if (!searchParams.tag) return null;
    const found = cleanTagsList.find(
      (t) =>
        t.id === searchParams.tag ||
        t.name.toLowerCase() === searchParams.tag.toLowerCase(),
    );
    return found ? found.name : searchParams.tag;
  }, [searchParams.tag, cleanTagsList]);

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
          <span className="text-base-content font-semibold capitalize">
            {title}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content capitalize">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-2 max-w-md w-full md:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
              <input
                type="text"
                placeholder={`Search in ${title}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input input-sm input-bordered w-full pl-10 pr-9 text-xs rounded-xl focus:border-primary"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateFilters({ search: undefined });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="btn btn-sm btn-ghost border border-base-200 rounded-xl lg:hidden gap-1.5"
            >
              <SlidersHorizontal className="size-3.5 text-primary" />
              <span className="text-xs">Filters</span>
              {activeFilterCount > 0 && (
                <span className="badge badge-primary badge-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Reusable Filter Sidebar configured for this section */}
        <CatalogFilterSidebar
          className="lg:col-span-1"
          sections={sections}
          categories={categories}
          tags={tags}
          filters={{ ...searchParams, section: currentSection?.name || sectionName }}
          currentSectionId={currentSection?.id || sectionName}
          onFilterChange={updateFilters}
          onClearFilters={clearAllFilters}
          mobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-5">
          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-base-100 p-3.5 rounded-xl border border-base-200 text-xs">
              <span className="text-base-content/50 font-bold flex items-center gap-1">
                <Filter className="size-3 text-primary" /> Active Filters:
              </span>
              {activeCategoryName && (
                <span className="badge badge-sm badge-neutral gap-1.5 font-medium py-2.5">
                  Category: {activeCategoryName}
                  <X
                    className="size-3 cursor-pointer hover:text-error transition-colors"
                    onClick={() => updateFilters({ category: undefined })}
                  />
                </span>
              )}
              {activeTagName && (
                <span className="badge badge-sm badge-neutral gap-1.5 font-medium py-2.5">
                  Tag: {activeTagName}
                  <X
                    className="size-3 cursor-pointer hover:text-error transition-colors"
                    onClick={() => updateFilters({ tag: undefined })}
                  />
                </span>
              )}
              {searchParams.search && (
                <span className="badge badge-sm badge-neutral gap-1.5 font-medium py-2.5">
                  Search: "{searchParams.search}"
                  <X
                    className="size-3 cursor-pointer hover:text-error transition-colors"
                    onClick={() => {
                      setSearchInput("");
                      updateFilters({ search: undefined });
                    }}
                  />
                </span>
              )}
              {searchParams.sort && searchParams.sort !== "-created" && (
                <span className="badge badge-sm badge-neutral gap-1.5 font-medium py-2.5">
                  Sort: {searchParams.sort}
                  <X
                    className="size-3 cursor-pointer hover:text-error transition-colors"
                    onClick={() => updateFilters({ sort: undefined })}
                  />
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="btn btn-ghost btn-xs text-primary font-bold ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-base-content/50 px-1">
            <span>
              Showing {items.length} of {totalItems} {title.toLowerCase()} piece{totalItems !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Product Items or Empty State */}
          {items.length === 0 ? (
            <NoItemsFound
              title={`No ${title} Pieces Found`}
              description={`We couldn't find any products in ${title} matching your current filters. Try changing or resetting your filters.`}
              onReset={activeFilterCount > 0 ? clearAllFilters : undefined}
              resetText="Reset Filters"
              actionText="Browse All Products"
              actionHref="/store/catalog"
            />
          ) : (
            <div className="space-y-8">
              <GridContainer>
                {items.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </GridContainer>

              {totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => updateFilters({ page: p })}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
