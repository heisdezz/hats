import { type ErrorComponentProps, Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Home, ShoppingBag, ChevronDown, Bug } from "lucide-react";
import { useState } from "react";
import { extract_message } from "#/helpers/api";

export default function GlobalErrorComponent({ error, reset }: ErrorComponentProps) {
  const [showDetails, setShowDetails] = useState(false);

  const errorMessage = extract_message(error) || error?.message || "An unexpected application error occurred.";
  const stackTrace = error?.stack;

  const handleReset = () => {
    if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 py-12">
      <div className="card bg-base-100 border border-base-200 shadow-md max-w-xl w-full overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-error/10 border-b border-error/20 p-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-error/20 text-error flex items-center justify-center shrink-0">
            <AlertTriangle className="size-7" />
          </div>
          <div>
            <span className="badge badge-error badge-sm font-semibold uppercase tracking-wider mb-1">
              Application Error
            </span>
            <h1 className="text-xl font-bold text-base-content leading-snug">
              Something went wrong
            </h1>
            <p className="text-xs text-base-content/60 mt-0.5">
              We encountered an issue processing your request.
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body p-6 space-y-6">
          {/* Main Error Message Box */}
          <div className="p-4 rounded-xl bg-base-200/60 border border-base-200 space-y-1">
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
              Error Summary
            </p>
            <p className="text-sm font-medium text-error/90 font-mono break-words leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReset}
              className="btn btn-primary rounded-xl flex-1 gap-2 text-sm"
            >
              <RefreshCw className="size-4" /> Try Again
            </button>
            <Link
              to="/store"
              className="btn btn-ghost border border-base-200 rounded-xl gap-2 text-sm"
            >
              <Home className="size-4" /> Store Home
            </Link>
            <Link
              to="/store/catalog"
              className="btn btn-ghost border border-base-200 rounded-xl gap-2 text-sm"
            >
              <ShoppingBag className="size-4" /> Catalog
            </Link>
          </div>

          {/* Expandable Technical Details */}
          {stackTrace && (
            <div className="border-t border-base-200 pt-4">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full text-xs font-bold text-base-content/50 hover:text-base-content transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Bug className="size-3.5" /> Technical Debug Logs
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
                />
              </button>

              {showDetails && (
                <div className="mt-3 p-3 rounded-xl bg-neutral text-neutral-content font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                  <pre>{stackTrace}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
