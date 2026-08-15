import { Footer } from "#/components/footer.tsx";
import { Header } from "#/components/header.tsx";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { IconTag, IconDiamond, IconUser, IconPackage, IconX } from "@tabler/icons-react";
import { pb } from "#/client/pb";

export const Route = createFileRoute("/store")({
  component: RouteComponent,
});

const navLinks = [
  { name: "Home", path: "/store" },
  { name: "Catalog", path: "/store/catalog" },
  { name: "Hats", path: "/store/catalog/hats" },
  { name: "Jewelry", path: "/store/catalog/jewelry" },
] as { name: string; path: string }[];

const categories = [
  {
    label: "Hats & Millinery",
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
    label: "Jewelry & Accessories",
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

function RouteComponent() {
  const isAuth = pb.authStore.isValid;

  return (
    <div className="drawer">
      <input id="store-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen bg-base-100 text-base-content antialiased">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>

      <div className="drawer-side z-50">
        <label
          htmlFor="store-drawer"
          aria-label="close sidebar"
          className="drawer-overlay bg-black/50 backdrop-blur-xs"
        ></label>
        <div className="bg-base-100 text-base-content min-h-full w-80 flex flex-col shadow-2xl border-r border-base-200">
          {/* Sidebar header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-base-200 shrink-0">
            <Link to="/store" className="text-2xl font-logo text-primary">
              Destinys Concept
            </Link>
            <label
              htmlFor="store-drawer"
              className="btn btn-ghost btn-circle btn-sm text-base-content/60"
            >
              <IconX size={18} />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Nav links */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 block mb-2 px-2">
                Navigation
              </span>
              <ul className="menu menu-md w-full p-0 gap-1">
                {navLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="rounded-lg font-medium text-sm hover:bg-base-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            {categories.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 px-2 mb-2">
                  <group.icon size={14} className="text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
                    {group.label}
                  </span>
                </div>
                <ul className="menu menu-sm w-full p-0 gap-0.5">
                  {group.items.map((name) => (
                    <li key={name}>
                      <Link
                        to="/store/catalog"
                        className="rounded-md text-xs text-base-content/80 hover:text-primary hover:bg-base-200"
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="p-6 border-t border-base-200 flex flex-col gap-2 bg-base-200/50">
            {isAuth ? (
              <>
                <Link
                  to="/profile"
                  className="btn btn-outline btn-sm btn-block justify-start gap-2 text-xs font-semibold"
                >
                  <IconUser size={16} />
                  My Account Profile
                </Link>
                <Link
                  to="/profile/orders"
                  search={{ page: 1, reference: undefined }}
                  className="btn btn-primary btn-sm btn-block justify-start gap-2 text-xs font-semibold"
                >
                  <IconPackage size={16} />
                  My Orders & Receipts
                </Link>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" className="btn btn-outline btn-sm text-xs">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm text-xs">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
