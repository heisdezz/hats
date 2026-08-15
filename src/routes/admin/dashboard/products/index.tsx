import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb, ssr_pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import AdminProductCard from "../-components/AdminProductCard";
import GridContainer from "#/components/GridContainer";
import ProductStats from "../-components/ProductsStats";
import RouteHeader from "../../-components/RouteHeader";
import Pagination from "#/components/Pagination";
import { useState } from "react";
import { Search, Plus, X, ArrowUpDown, Filter, Sparkles } from "lucide-react";
import type { CategoryResponse, ProductsResponse } from "pocketbase-types";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  published: z.string().optional(),
  sort: z.string().optional(),
});

export const Route = createFileRoute("/admin/dashboard/products/")({
  validateSearch: searchSchema,
  component: RouteComponent,
  loader: () =>
    ssr_pb().collection("products").getList(1, 12, {
      sort: "-created",
      expand: "category.parent",
    }),
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(searchParams.search || "");

  const page = searchParams.page || 1;
  const search = searchParams.search;
  const category = searchParams.category;
  const published = searchParams.published;
  const sort = searchParams.sort || "-created";

  const categoriesQuery = useQuery({
    queryKey: ["categories-list"],
    queryFn: () => pb.collection("category").getFullList<CategoryResponse>({
      sort: "name",
      expand: "parent",
    }),
  });

  const query = useQuery({
    queryKey: ["products-admin-list", page, search, category, published, sort],
    queryFn: () => {
      const filters: string[] = [];

      if (search) {
        filters.push(
          pb.filter("title ~ {:search} || description ~ {:search}", { search })
        );
      }

      if (category) {
        filters.push(pb.filter("category = {:category}", { category }));
      }

      if (published === "true") {
        filters.push("published = true");
      } else if (published === "false") {
        filters.push("published = false");
      }

      return pb.collection("products").getList<ProductsResponse>(page, 12, {
        sort,
        expand: "category.parent",
        filter: filters.length ? filters.join(" && ") : undefined,
      });
    },
    initialData:
      page === 1 && !search && !category && !published && sort === "-created"
        ? loaderData
        : undefined,
  });

  const updateFilters = (newParams: Partial<typeof searchParams>) => {
    const updated = {
      ...searchParams,
      ...newParams,
      page: newParams.page ?? 1,
    };

    Object.keys(updated).forEach((key) => {
      const k = key as keyof typeof updated;
      if (updated[k] === undefined || updated[k] === "") delete updated[k];
    });

    navigate({
      to: "/admin/dashboard/products",
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
      to: "/admin/dashboard/products",
      search: { page: 1 } as any,
    });
  };

  const hasActiveFilters = Boolean(search || category || published || (sort && sort !== "-created"));

  return (
    <main className="dash-wrap pb-12 space-y-6">
      <RouteHeader
        title="Products Catalog"
        subtitle="Manage product listings, pricing, colors, and catalog visibility"
      >
        <Link
          to="/admin/dashboard/products/new"
          className="btn btn-primary rounded-xl gap-2 shadow-sm"
        >
          <Plus className="size-4" /> Add Product
        </Link>
      </RouteHeader>

      <ProductStats />

      {/* Filter & Search Toolbar */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 pr-8 rounded-xl text-xs"
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
            </div>
            <button type="submit" className="btn btn-sm btn-primary rounded-xl px-3 text-xs">
              Search
            </button>
          </form>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <select
              value={category || ""}
              onChange={(e) => updateFilters({ category: e.target.value || undefined })}
              className="select select-sm select-bordered rounded-xl text-xs"
            >
              <option value="">All Categories</option>
              {categoriesQuery.data?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.expand?.parent ? `(${cat.expand.parent.name})` : ""}
                </option>
              ))}
            </select>

            {/* Published Status Filter */}
            <div className="join">
              <button
                onClick={() => updateFilters({ published: undefined })}
                className={`join-item btn btn-sm text-xs ${!published ? "btn-active" : "btn-ghost"}`}
              >
                All
              </button>
              <button
                onClick={() => updateFilters({ published: "true" })}
                className={`join-item btn btn-sm text-xs ${
                  published === "true" ? "btn-active btn-success text-success-content" : "btn-ghost"
                }`}
              >
                Published
              </button>
              <button
                onClick={() => updateFilters({ published: "false" })}
                className={`join-item btn btn-sm text-xs ${
                  published === "false" ? "btn-active btn-neutral" : "btn-ghost"
                }`}
              >
                Drafts
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="size-3 text-base-content/40" />
              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="select select-sm select-bordered rounded-xl text-xs"
              >
                <option value="-created">Newest First</option>
                <option value="created">Oldest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn btn-sm btn-ghost text-xs text-error gap-1 px-2"
              >
                <X className="size-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <PageLoader query={query}>
        {({ items, totalPages, totalItems }) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-base-content/50 px-1">
              <span>
                Showing {items.length} of {totalItems} products
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-16 text-center bg-base-100 rounded-2xl border border-base-200 text-base-content/40 space-y-3">
                <Filter className="size-10 mx-auto opacity-30" />
                <p className="text-sm font-semibold text-base-content">
                  No products found matching criteria.
                </p>
                <p className="text-xs max-w-sm mx-auto">
                  Try adjusting your search terms, category filters, or publishing status.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="btn btn-xs btn-outline rounded-lg mt-2"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <GridContainer>
                  {items.map((product) => (
                    <AdminProductCard key={product.id} product={product as any} />
                  ))}
                </GridContainer>

                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateFilters({ page: p })}
                  />
                )}
              </>
            )}
          </div>
        )}
      </PageLoader>
    </main>
  );
}
