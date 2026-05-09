import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import AdminHeader from "./-components/AdminHeader";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Layers,
  Store,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
});

const nav_groups: {
  label?: string;
  routes: { name: string; path: string; icon: LucideIcon }[];
}[] = [
  {
    routes: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Store",
    routes: [
      { name: "Products", path: "/admin/dashboard/products", icon: Package },
      { name: "Orders", path: "/admin/dashboard/orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Catalogue",
    routes: [
      { name: "Categories", path: "/admin/dashboard/category", icon: Tag },
      { name: "Sections", path: "/admin/dashboard/sections", icon: Layers },
    ],
  },
  {
    label: "People",
    routes: [
      { name: "Users", path: "/admin/dashboard/users", icon: Users },
    ],
  },
];

function RouteComponent() {
  const { pathname } = useLocation();

  function isActive(path: string) {
    return path === "/admin/dashboard"
      ? pathname === "/admin/dashboard" || pathname === "/admin/dashboard/"
      : pathname.startsWith(path);
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <AdminHeader />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        />

        <div className="flex flex-col bg-base-200 min-h-full w-72">
          {/* Logo */}
          <Link
            to="/store"
            className="px-5 h-16 border-b border-base-300 flex items-center gap-2 text-xl font-semibold font-logo shrink-0 hover:bg-base-300 transition-colors"
          >
            Destinys Concept
          </Link>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-5 py-4">
            {nav_groups.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-1">
                {group.label && (
                  <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest px-3 mb-1">
                    {group.label}
                  </p>
                )}
                <ul className="menu menu-sm p-0 gap-0.5">
                  {group.routes.map(({ name, path, icon: Icon }) => (
                    <li key={path}>
                      <Link
                        to={path}
                        className={
                          isActive(path)
                            ? "active font-semibold"
                            : "font-medium"
                        }
                      >
                        <Icon size={16} />
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer actions */}
          <div className="border-t border-base-300 p-3 flex flex-col gap-1">
            <Link
              to="/store"
              className="btn btn-ghost btn-sm justify-start gap-2 font-medium"
            >
              <Store size={15} />
              View store
            </Link>
            <Link
              to="/logout"
              preload={false}
              className="btn btn-ghost btn-sm justify-start gap-2 font-medium text-error hover:bg-error/10"
            >
              <LogOut size={15} />
              Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
