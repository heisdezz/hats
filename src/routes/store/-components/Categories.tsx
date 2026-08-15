import { IconTag, IconDiamond, IconChevronRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const groups = [
  {
    label: "Hats & Millinery",
    icon: IconTag,
    items: [
      { name: "All Hats", path: "/store/catalog/hats", badge: "All" },
      { name: "Millinery Hats", path: "/store/catalog/hats", badge: "Custom" },
      { name: "Fascinators", path: "/store/catalog/hats", badge: "Popular" },
      { name: "Church Hats", path: "/store/catalog/hats", badge: "Elegant" },
      { name: "Berets", path: "/store/catalog/hats", badge: "Classic" },
    ],
  },
  {
    label: "Fine Jewelry",
    icon: IconDiamond,
    items: [
      { name: "All Jewelry", path: "/store/catalog/jewelry", badge: "All" },
      { name: "Necklaces", path: "/store/catalog/jewelry", badge: "New" },
      { name: "Earrings", path: "/store/catalog/jewelry", badge: "Trending" },
      { name: "Bracelets", path: "/store/catalog/jewelry", badge: null },
      { name: "Coral Beads", path: "/store/catalog/jewelry", badge: "Luxury" },
    ],
  },
];

export default function Categories() {
  return (
    <div className="w-64 h-[520px] rounded-2xl border border-base-200 bg-base-100/80 backdrop-blur-md shadow-xs overflow-hidden flex flex-col">
      <div className="h-14 px-5 flex items-center justify-between font-bold text-xs uppercase tracking-wider bg-base-200/60 border-b border-base-200 shrink-0">
        <span>Categories</span>
        <span className="text-[10px] text-primary font-extrabold uppercase">Explore</span>
      </div>

      <div className="overflow-y-auto flex-1 py-3 px-2 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 px-3 py-1 mb-1">
              <group.icon size={14} className="text-primary" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50">
                {group.label}
              </span>
            </div>
            <ul className="menu menu-sm w-full p-0 gap-0.5">
              {group.items.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="rounded-lg justify-between text-xs py-2 text-base-content/80 hover:text-primary hover:bg-primary/5 transition-all group"
                  >
                    <span>{item.name}</span>
                    <div className="flex items-center gap-1">
                      {item.badge && (
                        <span className="badge badge-primary badge-xs text-[9px] font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                          {item.badge}
                        </span>
                      )}
                      <IconChevronRight size={12} className="text-base-content/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
