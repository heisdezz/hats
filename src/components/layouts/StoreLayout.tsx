import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link, Outlet } from "@tanstack/react-router";
import { IconDiamond, IconTag } from "@tabler/icons-react";

const navLinks = [
  { name: "Home", path: "/store" },
  { name: "Catalog", path: "/store/catalog" },
  { name: "Hats", path: "/store/catalog/hats" },
  { name: "Jewelry", path: "/store/catalog/jewelry" },
] as { name: string; path: string }[];

const categories = [
  {
    label: "Hats",
    icon: IconTag,
    items: [
      "All Hats",
      "Millinery Hats",
      "Fascinators",
      "Church Hats",
      "Berets",
    ],
  },
  {
    label: "Jewelry",
    icon: IconDiamond,
    items: [
      "All Jewelry",
      "Necklaces",
      "Earrings",
      "Bracelets",
      "Rings",
      "Anklets",
    ],
  },
];

export default function StoreLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="drawer">
        <input id="store-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <Outlet />
          <Footer />
        </div>

        <div className="drawer-side z-50">
          {/*<label
          htmlFor="store-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        />*/}

          <label
            htmlFor="store-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="bg-red-100 min-h-full w-72 flex flex-col p-4 ">
            {/* Sidebar header */}
            <div className="h-16 px-5 flex items-center border-b border-base-200 shrink-0">
              <Link to="/store" className="text-xl font-logo">
                Destinys Concept
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              {/* Nav links */}
              <ul className="menu w-full p-0">
                <li className="menu-title text-xs">Navigation</li>
                {navLinks.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path}>{item.name}</Link>
                  </li>
                ))}
              </ul>

              {/* Categories */}
              {categories.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <group.icon size={13} className="text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                      {group.label}
                    </span>
                  </div>
                  <ul className="menu menu-sm w-full p-0">
                    {group.items.map((name) => (
                      <li key={name}>
                        <a>{name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Sidebar footer */}
            <div className="p-4 border-t border-base-200 flex flex-col gap-2">
              <Link
                to="/profile"
                className="btn btn-ghost btn-block justify-start"
              >
                Profile
              </Link>
              <Link
                to="/profile/orders"
                className="btn btn-ghost btn-block justify-start"
              >
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
