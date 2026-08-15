import type { CategoryResponse, SectionResponse, TagsResponse } from "pocketbase-types";
import { get_products, type PRODUCT_RESULT } from "./products";
import { useQuery } from "@tanstack/react-query";
import type { ListResult } from "pocketbase";
import GridContainer from "#/components/GridContainer";
import ProductCard from "#/components/ProductCard";
import Pagination from "#/components/Pagination";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown, Filter } from "lucide-react";

interface CatalogListProps {
  initialProducts: ListResult<PRODUCT_RESULT>;
  categories?: CategoryResponse<{ parent?: SectionResponse }>[];
  sections?: SectionResponse[];
  tags?: TagsResponse[];
  searchParams: {
    query?: string;
    search?: string;
    section?: string;
    category?: string;
    tag?: string;
    sort?: string;
    page?: number;
  };
}

export default function CatalogList({
  initialProducts,
  categories = [],
  sections = [],
  tags = [],
  searchParams,
}: CatalogListProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(
    searchParams.search || searchParams.query || ""
  );

  useEffect(() => {
    setSearchInput(searchParams.search || searchParams.query || "");
  }, [searchParams.search, searchParams.query]);

  const query = useQuery({
    queryKey: [
      "products",
      searchParams.section,
      searchParams.category,
      searchParams.tag,
      searchParams.search || searchParams.query,
      searchParams.sort,
      searchParams.page,
    ],
    queryFn: () =>
      get_products({
        section: searchParams.section,
        category: searchParams.category,
        tag: searchParams.tag,
        search: searchParams.search || searchParams.query,
        sort: searchParams.sort,
        page: searchParams.page || 1,
      }),
    initialData: initialProducts,
    staleTime: 10_000,
  });

  const updateFilters = (newParams: Partial<typeof searchParams>) => {
    const updated = {
      ...searchParams,
      ...newParams,
      page: newParams.page ?? 1, // reset page on filter change
    };

    // Remove empty parameters
    Object.keys(updated).forEach((key) => {
      const k = key as keyof typeof updated;
      if (!updated[k]) delete updated[k];
    });

    navigate({
      to: "/store/catalog",
      search: updated as any,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined, query: undefined });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    navigate({
      to: "/store/catalog",
      search: {},
    });
  };

  const activeFilterCount =
    (searchParams.section ? 1 : 0) +
    (searchParams.category ? 1 : 0) +
    (searchParams.tag ? 1 : 0) +
    (searchParams.search || searchParams.query ? 1 : 0) +
    (searchParams.sort ? 1 : 0);

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const currentPage = searchParams.page || 1;

  // Filter categories by section if a section is selected
  const filteredCategories = searchParams.section
    ? categories.filter(
        (c) =>
          c.parent === searchParams.section ||
          (c.expand?.parent && c.expand.parent.name === searchParams.section) ||
          (c.expand?.parent && c.expand.parent.id === searchParams.section)
      )
    : categories;

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-base-100 p-5 rounded-2xl border border-base-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Discover our luxury hand-crafted hats and artisanal fine jewelry.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 flex-1 max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 pr-8 text-sm rounded-xl focus:outline-none focus:border-primary"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: undefined, query: undefined });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-sm btn-primary rounded-xl px-4">
            Search
          </button>
        </form>
      </div>

      {/* Main Content: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-5 bg-base-100 p-5 rounded-2xl border border-base-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-base-200 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>Filters</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Section Filter */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-base-content/50">
              Department
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateFilters({ section: undefined, category: undefined })}
                className={`btn btn-xs rounded-lg ${
                  !searchParams.section
                    ? "btn-primary"
                    : "btn-ghost border border-base-200"
                }`}
              >
                All
              </button>
              {sections.map((sec) => {
                const isActive =
                  searchParams.section === sec.name || searchParams.section === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() =>
                      updateFilters({
                        section: isActive ? undefined : sec.name,
                        category: undefined,
                      })
                    }
                    className={`btn btn-xs rounded-lg capitalize ${
                      isActive ? "btn-primary" : "btn-ghost border border-base-200"
                    }`}
                  >
                    {sec.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Filter */}
          {filteredCategories.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-base-content/50">
                Categories
              </label>
              <ul className="menu menu-xs bg-base-200/40 rounded-xl p-1 gap-1 max-h-48 overflow-y-auto">
                <li key="all-cat">
                  <button
                    onClick={() => updateFilters({ category: undefined })}
                    className={!searchParams.category ? "active font-bold" : ""}
                  >
                    All Categories
                  </button>
                </li>
                {filteredCategories.map((cat) => {
                  const isActive =
                    searchParams.category === cat.id || searchParams.category === cat.name;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() =>
                          updateFilters({ category: isActive ? undefined : cat.id })
                        }
                        className={isActive ? "active font-bold" : ""}
                      >
                        {cat.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-base-content/50">
                Tags & Collections
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
                {tags.map((t) => {
                  const isActive =
                    searchParams.tag === t.id || searchParams.tag === t.name;
                  return (
                    <button
                      key={t.id}
                      onClick={() =>
                        updateFilters({ tag: isActive ? undefined : t.id })
                      }
                      className={`badge badge-sm cursor-pointer transition-all ${
                        isActive
                          ? "badge-primary font-bold shadow-xs"
                          : "badge-outline opacity-70 hover:opacity-100"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort Selector */}
          <div className="space-y-2 border-t border-base-200 pt-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-base-content/50 flex items-center gap-1">
              <ArrowUpDown className="size-3 text-primary" />
              Sort By
            </label>
            <select
              value={searchParams.sort || "-created"}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="select select-sm select-bordered w-full rounded-xl text-xs"
            >
              <option value="-created">Newest Arrivals</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-4">
          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-base-100 p-3 rounded-xl border border-base-200 text-xs">
              <span className="text-base-content/50 font-bold flex items-center gap-1">
                <Filter className="size-3" /> Active Filters:
              </span>
              {searchParams.section && (
                <span className="badge badge-sm badge-neutral gap-1">
                  Section: {searchParams.section}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => updateFilters({ section: undefined })}
                  />
                </span>
              )}
              {searchParams.category && (
                <span className="badge badge-sm badge-neutral gap-1">
                  Category: {searchParams.category}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => updateFilters({ category: undefined })}
                  />
                </span>
              )}
              {searchParams.tag && (
                <span className="badge badge-sm badge-neutral gap-1">
                  Tag: {searchParams.tag}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => updateFilters({ tag: undefined })}
                  />
                </span>
              )}
              {(searchParams.search || searchParams.query) && (
                <span className="badge badge-sm badge-neutral gap-1">
                  Search: "{searchParams.search || searchParams.query}"
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() =>
                      updateFilters({ search: undefined, query: undefined })
                    }
                  />
                </span>
              )}
            </div>
          )}

          {/* Results Grid */}
          {query.isLoading ? (
            <div className="py-20 text-center text-base-content/40">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-xs mt-2">Loading catalog products...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-base-100 rounded-2xl border border-base-200 text-center gap-3">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Search className="size-6" />
              </div>
              <h3 className="text-lg font-bold">No products found</h3>
              <p className="text-xs text-base-content/60 max-w-sm">
                We couldn't find any products matching your current filters. Try resetting your search or adjusting your selected categories.
              </p>
              <button
                onClick={clearAllFilters}
                className="btn btn-sm btn-primary rounded-xl mt-2"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <GridContainer>
                {items.map((item) => (
                  <ProductCard product={item as any} key={item.id} />
                ))}
              </GridContainer>

              {totalPages > 1 && (
                <div className="pt-6">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => updateFilters({ page })}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

