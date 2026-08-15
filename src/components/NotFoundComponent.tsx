import { Link } from "@tanstack/react-router";
import { Compass, Home, ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFoundComponent() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 py-12">
      <div className="card bg-base-100 border border-base-200 shadow-md max-w-md w-full text-center p-8 space-y-6">
        <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Compass className="size-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="badge badge-primary badge-lg font-black font-mono">404</span>
          <h1 className="text-2xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-xs text-base-content/60 max-w-xs mx-auto leading-relaxed">
            The page or product you are looking for might have been moved, deleted, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link to="/store" className="btn btn-primary rounded-xl gap-2 w-full">
            <Home className="size-4" /> Return to Store Home
          </Link>
          <Link to="/store/catalog" className="btn btn-ghost border border-base-200 rounded-xl gap-2 w-full text-xs">
            <ShoppingBag className="size-4" /> Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
