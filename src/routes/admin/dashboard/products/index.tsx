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
import { Search, Plus, X, ArrowUpDown } from "lucide-react";
import type { ProductsResponse } from "#/../pocketbase-types";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  search: z.string().optional(),
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
  const published = searchParams.published;
  const sort = searchParams.sort || "-created";

  const query = useQuery({
    queryKey: ["products-admin-list", page, search, published, sort],
    queryFn: () => {
      const filters: string[] = [];

      if (search) {
        filters.push(
          pb.filter("title ~ {:search} || description ~ {:search}", { search })
        );
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
    initialData: page === 1 && !search && !published && sort === "-created" ? loaderData : undefined,
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

  return (
    <main className="dash-wrap pb-12 space-y-6">
      <RouteHeader title="Products Catalog" subtitle="Manage product listings, pricing, and availability">
        <Link
          to="/admin/dashboard/products/new"
          className="btn btn-primary rounded-xl gap-2"
        >
          <Plus className="size-4" /> Add Product
        </Link>
      </RouteHeader>

      <ProductStats />

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-base-100 p-4 rounded-2xl border border-base-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search product title..."
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

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="join">
            <button
              onClick={() => updateFilters({ published: undefined })}
              className={`join-item btn btn-xs ${!published ? "btn-active" : "btn-ghost"}`}
            >
              All
            </button>
            <button
              onClick={() => updateFilters({ published: "true" })}
              className={`join-item btn btn-xs ${published === "true" ? "btn-active" : "btn-ghost"}`}
            >
              Published
            </button>
            <button
              onClick={() => updateFilters({ published: "false" })}
              className={`join-item btn btn-xs ${published === "false" ? "btn-active" : "btn-ghost"}`}
            >
              Drafts
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="size-3 text-base-content/40" />
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="select select-xs select-bordered rounded-xl text-xs"
            >
              <option value="-created">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <PageLoader query={query}>
        {({ items, totalPages }) => (
          <div className="space-y-6">
            {items.length === 0 ? (
              <div className="p-12 text-center bg-base-100 rounded-2xl border border-base-200 text-base-content/40">
                <p className="text-sm font-semibold">No products found matching criteria.</p>
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
