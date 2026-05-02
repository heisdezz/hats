import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Store } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/products": "Products",
  "/admin/dashboard/orders": "Orders",
  "/admin/dashboard/users": "Users",
  "/admin/dashboard/category": "Categories",
};

function getPageTitle(pathname: string) {
  const match = Object.keys(routeLabels)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));
  return match ? routeLabels[match] : "Dashboard";
}

export default function AdminHeader() {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 bg-base-100 border-b border-base-200 flex items-center px-4 gap-4 sticky top-0 z-10">
      <label
        htmlFor="my-drawer-3"
        className="btn btn-ghost btn-sm btn-square lg:hidden"
      >
        <Menu size={20} />
      </label>

      <h1 className="font-semibold text-base">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/store"
          className="btn btn-ghost btn-sm gap-1.5 text-base-content/60"
        >
          <Store size={15} />
          <span className="hidden sm:inline">View store</span>
        </Link>
      </div>
    </header>
  );
}
