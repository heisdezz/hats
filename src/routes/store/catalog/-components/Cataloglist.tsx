import type {
  CategoryResponse,
  SectionResponse,
  TagsResponse,
} from "pocketbase-types";
import { get_products, type PRODUCT_RESULT } from "./products";
import { useQuery } from "@tanstack/react-query";
import type { ListResult } from "pocketbase";
import GridContainer from "#/components/GridContainer";
import ProductCard from "#/components/ProductCard";
import Pagination from "#/components/Pagination";
import NoItemsFound from "#/components/NoItemsFound";
import CatalogFilterSidebar, { type FilterState } from "./CatalogFilterSidebar";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
import { normalizeTagItem } from "#/routes/admin/dashboard/products/-components/TagsInput";

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
    searchParams.search || searchParams.query || "",
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const updateFilters = (newParams: Partial<FilterState>) => {
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
    (searchParams.sort && searchParams.sort !== "-created" ? 1 : 0);

  const items = query.data?.items ?? [];
  const totalPages = query.data?.totalPages ?? 1;
  const totalItems = query.data?.totalItems ?? items.length;
  const currentPage = searchParams.page || 1;

  // Normalized clean tags list for active filter labels
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

  // Resolved human-readable labels for active filter chips
  const activeSectionName = useMemo(() => {
    if (!searchParams.section) return null;
    const sec = sections.find(
      (s) => s.id === searchParams.section || s.name === searchParams.section,
    );
    return sec ? (sec.display_name || sec.name) : searchParams.section;
  }, [searchParams.section, sections]);

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
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-base-100 p-6 rounded-2xl border border-base-200 shadow-xs">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Catalog
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Explore bespoke couture hats, ceremonial fascinators, and
            handcrafted fine jewelry.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search products by title or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input input-sm input-bordered w-full pl-10 pr-9 text-xs rounded-xl focus:border-primary"
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

      {/* Main Content: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Reusable Filter Sidebar */}
        <CatalogFilterSidebar
          className="lg:col-span-1"
          sections={sections}
          categories={categories}
          tags={tags}
          filters={searchParams}
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
              {activeSectionName && (
                <span className="badge badge-sm badge-neutral gap-1.5 font-medium py-2.5">
                  Department: {activeSectionName}
                  <X
                    className="size-3 cursor-pointer hover:text-error transition-colors"
                    onClick={() => updateFilters({ section: undefined })}
                  />
                </span>
              )}
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
              {(searchParams.search || searchParams.query) && (
                <span className="badge badge-sm badge-neutral gap-1.5 font-medium py-2.5">
                  Search: "{searchParams.search || searchParams.query}"
                  <X
                    className="size-3 cursor-pointer hover:text-error transition-colors"
                    onClick={() => {
                      setSearchInput("");
                      updateFilters({ search: undefined, query: undefined });
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
              Showing {items.length} of {totalItems} piece{totalItems !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Product Items or Empty State */}
          {items.length === 0 ? (
            <NoItemsFound
              title="No Matching Pieces Found"
              description="Try selecting different collection filters, clearing active tags, or using broader search terms."
              onReset={activeFilterCount > 0 ? clearAllFilters : undefined}
              resetText="Reset All Filters"
              actionText="View All Products"
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
