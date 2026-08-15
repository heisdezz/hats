import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PackageSearch, ArrowLeft, RefreshCw } from "lucide-react";

interface NoItemsFoundProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  actionHref?: string;
  onReset?: () => void;
  resetText?: string;
  className?: string;
}

export default function NoItemsFound({
  title = "No Products Found",
  description = "We couldn't find any items in this collection right now. Check back soon or explore our full catalog.",
  icon,
  actionText = "Explore All Collections",
  actionHref = "/store/catalog",
  onReset,
  resetText = "Reset Filters",
  className = "",
}: NoItemsFoundProps) {
  return (
    <div
      className={`w-full min-h-[360px] py-12 px-6 flex flex-col items-center justify-center text-center rounded-3xl bg-base-100/70 backdrop-blur-md border border-base-200 shadow-xs ${className}`}
    >
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-xs">
        {icon || <PackageSearch className="size-8 stroke-[1.5]" />}
      </div>

      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-base-content/90 mb-1.5">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-base-content/60 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-outline btn-sm rounded-xl gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="size-3.5" />
            {resetText}
          </button>
        )}

        {actionHref && (
          <Link
            to={actionHref}
            className="btn btn-primary btn-sm rounded-xl gap-1.5 text-xs font-semibold shadow-xs"
          >
            <ArrowLeft className="size-3.5" />
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
}
