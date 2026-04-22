import { IconTag, IconDiamond } from "@tabler/icons-react";

const groups = [
  {
    label: "Hats",
    icon: IconTag,
    items: [
      { name: "All Hats", id: "1" },
      { name: "Millinery Hats", id: "2" },
      // { name: "Fedoras", id: "3" },
      // { name: "Straw Hats", id: "4" },
      // { name: "Bucket Hats", id: "5" },
      // { name: "Boater Hats", id: "6" },
      { name: "Fascinators", id: "7" },
      { name: "Church Hats", id: "8" },
      { name: "Berets", id: "9" },
    ],
  },
  {
    label: "Jewelry",
    icon: IconDiamond,
    items: [
      { name: "All Jewelry", id: "10" },
      { name: "Necklaces", id: "11" },
      { name: "Earrings", id: "12" },
      { name: "Bracelets", id: "13" },
      { name: "Rings", id: "14" },
      { name: "Anklets", id: "15" },
      { name: "Brooches", id: "16" },
      { name: "Coral Beads", id: "17" },
    ],
  },
];

export default function Categories() {
  return (
    <div className="ring fade w-2xs h-[520px] rounded-xl overflow-hidden flex flex-col">
      <h2 className="h-14 px-4 flex items-center gap-2 font-bold text-sm uppercase tracking-widest bg-base-200 shrink-0">
        Categories
      </h2>

      <div className="overflow-y-auto flex-1 py-2">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 px-4 py-2 mt-1">
              <group.icon size={13} className="text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                {group.label}
              </span>
            </div>
            <ul className="menu menu-sm w-full px-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <a className="rounded-lg justify-between group">
                    <span>{item.name}</span>
                    {item.name.startsWith("All") && (
                      <span className="badge badge-primary badge-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        View all
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
