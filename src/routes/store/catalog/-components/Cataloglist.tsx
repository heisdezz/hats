import type { CategoryResponse, SectionResponse, TagsResponse } from "pocketbase-types";
import { get_products, type PRODUCT_RESULT } from "./products";
import { useQuery } from "@tanstack/react-query";
import type { ListResult } from "pocketbase";
import GridContainer from "#/components/GridContainer";
import ProductCard from "#/components/ProductCard";
import Pagination from "#/components/Pagination";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Tag as TagIcon,
  Layers,
  Sparkles,
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
    searchParams.search || searchParams.query || ""
  );
  const [tagFilterInput, setTagFilterInput] = useState("");
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
    setTagFilterInput("");
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

  // Normalized clean tags list
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
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tags]);

  // Filtered tags based on search input in sidebar
  const visibleTags = useMemo(() => {
    if (!tagFilterInput.trim()) return cleanTagsList;
    return cleanTagsList.filter((t) =>
      t.name.toLowerCase().includes(tagFilterInput.toLowerCase().trim())
    );
  }, [cleanTagsList, tagFilterInput]);

  // Filter categories by section if a section is selected
  const filteredCategories = searchParams.section
    ? categories.filter(
        (c) =>
          c.parent === searchParams.section ||
          (c.expand?.parent && c.expand.parent.name === searchParams.section) ||
          (c.expand?.parent && c.expand.parent.id === searchParams.section)
      )
    : categories;

  // Resolved human-readable labels for active filter chips
  const activeSectionName = useMemo(() => {
    if (!searchParams.section) return null;
    const sec = sections.find(
      (s) => s.id === searchParams.section || s.name === searchParams.section
    );
    return sec ? sec.name : searchParams.section;
  }, [searchParams.section, sections]);

  const activeCategoryName = useMemo(() => {
    if (!searchParams.category) return null;
    const cat = categories.find(
      (c) => c.id === searchParams.category || c.name === searchParams.category
    );
    return cat ? cat.name : searchParams.category;
  }, [searchParams.category, categories]);

  const activeTagName = useMemo(() => {
    if (!searchParams.tag) return null;
    const found = cleanTagsList.find(
      (t) => t.id === searchParams.tag || t.name.toLowerCase() === searchParams.tag.toLowerCase()
    );
    return found ? found.name : searchParams.tag;
  }, [searchParams.tag, cleanTagsList]);

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-base-100 p-6 rounded-2xl border border-base-200 shadow-xs">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Catalog</h1>
          <p className="text-xs text-base-content/60 mt-1">
            Explore bespoke couture hats, ceremonial fascinators, and handcrafted fine jewelry.
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
              <span className="badge badge-primary badge-xs">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar */}
        <aside
          className={`lg:col-span-1 space-y-6 bg-base-100 p-5 rounded-2xl border border-base-200 shadow-xs transition-all ${
            mobileFilterOpen ? "block" : "hidden lg:block"
          }`}
        >
          {/* Header */}
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
                Reset All ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Department / Collections Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span>Department / Collection</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateFilters({ section: undefined, category: undefined })}
                className={`btn btn-xs rounded-lg transition-all ${
                  !searchParams.section
                    ? "btn-primary shadow-xs font-bold"
                    : "btn-ghost border border-base-200 hover:border-base-300"
                }`}
              >
                All Pieces
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
                    className={`btn btn-xs rounded-lg capitalize transition-all ${
                      isActive
                        ? "btn-primary shadow-xs font-bold"
                        : "btn-ghost border border-base-200 hover:border-base-300"
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
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>Categories</span>
              </label>
              <ul className="menu menu-xs bg-base-200/40 rounded-xl p-1.5 gap-1 max-h-48 overflow-y-auto">
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
                        <span>{cat.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Tags & Styles Filter */}
          {cleanTagsList.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                  <TagIcon className="size-3.5 text-primary" />
                  <span>Tags & Styles</span>
                </label>
                {searchParams.tag && (
                  <button
                    onClick={() => updateFilters({ tag: undefined })}
                    className="text-[11px] text-error hover:underline"
                  >
                    Clear Tag
                  </button>
                )}
              </div>

              {/* Tag search if many tags exist */}
              {cleanTagsList.length > 8 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Filter tags..."
                    value={tagFilterInput}
                    onChange={(e) => setTagFilterInput(e.target.value)}
                    className="input input-xs input-bordered w-full pl-7 pr-6 rounded-lg text-[11px]"
                  />
                  {tagFilterInput && (
                    <button
                      type="button"
                      onClick={() => setTagFilterInput("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                    >
                      <X className="size-2.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pt-1">
                {visibleTags.map((t) => {
                  const isActive =
                    searchParams.tag === t.id ||
                    searchParams.tag?.toLowerCase() === t.name.toLowerCase();
                  return (
                    <button
                      key={t.id}
                      onClick={() =>
                        updateFilters({ tag: isActive ? undefined : t.id })
                      }
                      className={`badge badge-sm cursor-pointer transition-all py-2.5 px-2 text-xs rounded-lg ${
                        isActive
                          ? "badge-primary font-bold shadow-xs scale-105"
                          : "badge-ghost hover:bg-base-200 border border-base-300/50"
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
          <div className="space-y-2 border-t border-base-200 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-primary" />
              <span>Sort Order</span>
            </label>
            <select
              value={searchParams.sort || "-created"}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="select select-sm select-bordered w-full rounded-xl text-xs"
            >
              <option value="-created">Newest Arrivals</option>
              <option value="created">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </aside>

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
                <span className="badge badge-sm badge-primary text-primary-content gap-1.5 font-medium py-2.5">
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
                    onClick={() =>
                      updateFilters({ search: undefined, query: undefined })
                    }
                  />
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-error font-semibold hover:underline ml-auto"
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
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-4 text-center bg-base-100 rounded-2xl border border-base-200">
              <div className="size-16 rounded-full bg-base-200 flex items-center justify-center text-base-content/30">
                <Search className="size-8" />
              </div>
              <p className="font-bold text-base text-base-content">
                No matching pieces found
              </p>
              <p className="text-xs text-base-content/50 max-w-sm">
                Try selecting different collection filters, clearing tags, or using broader search terms.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="btn btn-sm btn-primary rounded-xl mt-2"
                >
                  Reset All Filters
                </button>
              )}
            </div>
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
