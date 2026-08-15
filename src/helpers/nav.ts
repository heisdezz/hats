import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import type { CategoryResponse, SectionResponse } from "pocketbase-types";

export type NavLink = {
  name: string;
  path: string;
};

export function useNavSections() {
  const query = useQuery({
    queryKey: ["sections"],
    queryFn: () =>
      pb.collection("section").getFullList<SectionResponse>({ sort: "name" }),
    staleTime: 5 * 60 * 1000,
  });

  const baseLinks: NavLink[] = [
    { name: "Home", path: "/store" },
    { name: "Catalog", path: "/store/catalog" },
  ];

  if (query.data && query.data.length > 0) {
    const dynamicLinks: NavLink[] = query.data.map((sec) => ({
      name: sec.name
        ? sec.name.charAt(0).toUpperCase() + sec.name.slice(1)
        : "Untitled",
      path: `/store/catalog/${sec.name?.toLowerCase()}`,
    }));
    return { navLinks: [...baseLinks, ...dynamicLinks], sections: query.data };
  }

  return {
    navLinks: [
      ...baseLinks,
      { name: "Hats", path: "/store/catalog/hats" },
      { name: "Jewelry", path: "/store/catalog/jewelry" },
    ],
    sections: [],
  };
}

export type CategoryGroup = {
  sectionId: string;
  sectionName: string;
  items: { id: string; name: string }[];
};

export function useNavCategories() {
  const query = useQuery({
    queryKey: ["categories-with-parent"],
    queryFn: () =>
      pb.collection("category").getFullList<
        CategoryResponse<{ parent?: SectionResponse }>
      >({ expand: "parent", sort: "name" }),
    staleTime: 5 * 60 * 1000,
  });

  if (!query.data || query.data.length === 0) {
    return [];
  }

  const groupsMap = new Map<string, CategoryGroup>();

  for (const cat of query.data) {
    const parentSection = (cat.expand as any)?.parent as SectionResponse | undefined;
    const sectionName = parentSection?.name
      ? parentSection.name.charAt(0).toUpperCase() + parentSection.name.slice(1)
      : "General";
    const sectionId = parentSection?.id || "general";

    if (!groupsMap.has(sectionId)) {
      groupsMap.set(sectionId, {
        sectionId,
        sectionName,
        items: [],
      });
    }

    if (cat.name) {
      groupsMap.get(sectionId)!.items.push({ id: cat.id, name: cat.name });
    }
  }

  return Array.from(groupsMap.values());
}
