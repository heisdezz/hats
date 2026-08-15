import { useMemo, useState } from "react";
import type { CategoryResponse, SectionResponse, TagsResponse } from "pocketbase-types";
import {
  SlidersHorizontal,
  Layers,
  Sparkles,
  Tag as TagIcon,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { normalizeTagItem } from "#/routes/admin/dashboard/products/-components/TagsInput";

export interface FilterState {
  section?: string;
  category?: string;
  tag?: string;
  search?: string;
  query?: string;
  sort?: string;
  page?: number;
}

interface CatalogFilterSidebarProps {
  sections?: SectionResponse[];
  categories?: CategoryResponse<{ parent?: SectionResponse }>[];
  tags?: TagsResponse[];
  filters: FilterState;
  onFilterChange: (newParams: Partial<FilterState>) => void;
  onClearFilters: () => void;
  currentSectionId?: string;
  hideSectionFilter?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export default function CatalogFilterSidebar({
  sections = [],
  categories = [],
  tags = [],
  filters,
  onFilterChange,
  onClearFilters,
  currentSectionId,
  hideSectionFilter = false,
  mobileOpen = false,
  onCloseMobile,
  className = "",
}: CatalogFilterSidebarProps) {
  const [tagFilterInput, setTagFilterInput] = useState("");

  const activeFilterCount =
    (filters.section && !currentSectionId ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.tag ? 1 : 0) +
    (filters.search || filters.query ? 1 : 0) +
    (filters.sort && filters.sort !== "-created" ? 1 : 0);

  // Normalized tags
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
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [tags]);

  const visibleTags = useMemo(() => {
    if (!tagFilterInput.trim()) return cleanTagsList;
    return cleanTagsList.filter((t) =>
      t.name.toLowerCase().includes(tagFilterInput.toLowerCase().trim()),
    );
  }, [cleanTagsList, tagFilterInput]);

  // Determine section to filter categories by
  const effectiveSection = currentSectionId || filters.section;
  const filteredCategories = useMemo(() => {
    if (!effectiveSection) return categories;
    const secNorm = effectiveSection.toLowerCase();
    return categories.filter((c) => {
      if (c.parent === effectiveSection) return true;
      const parentObj = (c.expand as any)?.parent;
      if (parentObj) {
        if (parentObj.id === effectiveSection) return true;
        if (parentObj.name?.toLowerCase() === secNorm) return true;
        if (secNorm.startsWith("jewel") && parentObj.name?.toLowerCase().includes("jewel")) return true;
      }
      return false;
    });
  }, [categories, effectiveSection]);

  return (
    <aside
      className={`space-y-6 bg-base-100 p-5 rounded-2xl border border-base-200 shadow-xs transition-all ${
        mobileOpen ? "block" : "hidden lg:block"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-200 pb-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <SlidersHorizontal className="size-4 text-primary" />
          <span>Filters</span>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Reset ({activeFilterCount})
            </button>
          )}
          {mobileOpen && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="btn btn-ghost btn-xs btn-circle lg:hidden"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sections / Departments Filter (optional) */}
      {!hideSectionFilter && sections.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
            <Layers className="size-3.5 text-primary" />
            <span>Department / Collection</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {sections.map((sec) => {
              const isActive =
                filters.section === sec.name ||
                filters.section === sec.id;
              return (
                <Link
                  key={sec.id}
                  to="/store/catalog/$id"
                  params={{ id: sec.name as string }}
                  className={`btn btn-xs rounded-lg capitalize transition-all ${
                    isActive
                      ? "btn-primary shadow-xs font-bold"
                      : "btn-ghost border border-base-200 hover:border-base-300"
                  }`}
                >
                  {sec.display_name || sec.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      {filteredCategories.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span>Categories</span>
          </label>
          <ul className="menu menu-xs bg-base-200/40 rounded-xl p-1.5 gap-1 max-h-52 overflow-y-auto">
            <li key="all-cat">
              <button
                onClick={() => onFilterChange({ category: undefined })}
                className={!filters.category ? "active font-bold" : ""}
              >
                All Categories
              </button>
            </li>
            {filteredCategories.map((cat) => {
              const isActive =
                filters.category === cat.id ||
                filters.category === cat.name;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() =>
                      onFilterChange({
                        category: isActive ? undefined : cat.id,
                      })
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
            {filters.tag && (
              <button
                onClick={() => onFilterChange({ tag: undefined })}
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
                filters.tag === t.id ||
                filters.tag?.toLowerCase() === t.name.toLowerCase();
              return (
                <button
                  key={t.id}
                  onClick={() =>
                    onFilterChange({ tag: isActive ? undefined : t.id })
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
          value={filters.sort || "-created"}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
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
  );
}
