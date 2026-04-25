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
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
});

const dash_routes: { name: string; path: string; icon: LucideIcon }[] = [
  { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/admin/dashboard/products", icon: Package },
  { name: "Orders", path: "/admin/dashboard/orders", icon: ShoppingCart },
];

function RouteComponent() {
  const { pathname } = useLocation();

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <AdminHeader />
        <Outlet />
        <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden">
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        <div className="px-6 h-20 border-b border-base-300 bg-base-200 w-full flex items-center text-2xl font-semibold font-logo shrink-0">
          Destinys Concept
        </div>
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <ul className="menu bg-base-200 min-h-full w-80 p-4 gap-1">
          {dash_routes.map(({ name, path, icon: Icon }) => {
            const active =
              path === "/admin/dashboard"
                ? pathname === "/admin/dashboard" ||
                  pathname === "/admin/dashboard/"
                : pathname.startsWith(path);
            return (
              <li key={path}>
                <Link to={path} className={active ? "active font-medium" : ""}>
                  <Icon size={18} />
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
