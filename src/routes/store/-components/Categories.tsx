import { IconTag, IconDiamond, IconChevronRight, IconSparkles, IconCategory } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import type { CategoryResponse, SectionResponse } from "pocketbase-types";

type ExpandedCategory = CategoryResponse<{ parent?: SectionResponse }>;

export default function Categories() {
  const sectionsQuery = useQuery({
    queryKey: ["store-sections"],
    queryFn: () =>
      pb.collection("section").getFullList<SectionResponse>({
        sort: "name",
      }),
    staleTime: 5 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ["store-categories-with-parent"],
    queryFn: () =>
      pb.collection("category").getFullList<ExpandedCategory>({
        expand: "parent",
        sort: "name",
      }),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = sectionsQuery.isLoading || categoriesQuery.isLoading;
  const sections = sectionsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="w-64 h-[520px] rounded-2xl border border-base-200 bg-base-100/80 backdrop-blur-md shadow-xs overflow-hidden flex flex-col">
      <div className="h-14 px-5 flex items-center justify-between font-bold text-xs uppercase tracking-wider bg-base-200/60 border-b border-base-200 shrink-0">
        <span className="flex items-center gap-1.5">
          <IconCategory size={15} className="text-primary" />
          Categories
        </span>
        <Link
          to="/store/catalog"
          className="text-[10px] text-primary font-extrabold uppercase hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="overflow-y-auto flex-1 py-3 px-2 space-y-4">
        {isLoading ? (
          <div className="space-y-4 p-2">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-24 rounded-md" />
                <div className="space-y-1.5">
                  <div className="skeleton h-7 w-full rounded-lg" />
                  <div className="skeleton h-7 w-full rounded-lg" />
                  <div className="skeleton h-7 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : sections.length > 0 ? (
          sections.map((sec) => {
            const secName = sec.name || "General";
            const isHats = secName.toLowerCase().includes("hat");
            const isJewelry = secName.toLowerCase().includes("jewel") || secName.toLowerCase().includes("jewl");
            const SecIcon = isHats ? IconTag : isJewelry ? IconDiamond : IconSparkles;

            const sectionCategories = categories.filter(
              (cat) => cat.parent === sec.id || cat.expand?.parent?.id === sec.id,
            );

            return (
              <div key={sec.id}>
                <div className="flex items-center justify-between px-3 py-1 mb-1">
                  <div className="flex items-center gap-2">
                    <SecIcon size={14} className="text-primary" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50">
                      {secName}
                    </span>
                  </div>
                  <Link
                    to="/store/catalog"
                    search={{ section: sec.id }}
                    className="text-[10px] text-primary/70 hover:text-primary font-semibold"
                  >
                    All
                  </Link>
                </div>

                <ul className="menu menu-sm w-full p-0 gap-0.5">
                  {/* All link for section */}
                  <li>
                    <Link
                      to="/store/catalog"
                      search={{ section: sec.id }}
                      className="rounded-lg justify-between text-xs py-2 text-base-content/80 hover:text-primary hover:bg-primary/5 transition-all group"
                    >
                      <span className="font-medium">All {secName}</span>
                      <div className="flex items-center gap-1">
                        <span className="badge badge-primary badge-xs text-[9px] font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                          All
                        </span>
                        <IconChevronRight
                          size={12}
                          className="text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </Link>
                  </li>

                  {/* Child categories for this section */}
                  {sectionCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to="/store/catalog"
                        search={{ section: sec.id, category: cat.id }}
                        className="rounded-lg justify-between text-xs py-2 text-base-content/80 hover:text-primary hover:bg-primary/5 transition-all group"
                      >
                        <span>{cat.name}</span>
                        <div className="flex items-center gap-1">
                          <IconChevronRight
                            size={12}
                            className="text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-base-content/40">
            No categories found
          </div>
        )}
      </div>
    </div>
  );
}
