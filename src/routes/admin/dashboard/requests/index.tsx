import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb, ssr_pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import Pagination from "#/components/Pagination";
import AdminRequestCard from "../-components/requests/AdminRequestCard";
import type { CustomRequestsResponse, UsersResponse } from "#/../pocketbase-types";
import { Search, X, Sparkles, Inbox } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  status: z.enum(["pending", "responded"]).optional(),
  search: z.string().optional(),
});

type RequestWithUser = CustomRequestsResponse<{
  user?: UsersResponse;
}>;

export const Route = createFileRoute("/admin/dashboard/requests/")({
  validateSearch: searchSchema,
  component: AdminRequestsPage,
  loader: () =>
    ssr_pb()
      .collection("custom_requests")
      .getList<RequestWithUser>(1, 20, {
        sort: "-created",
        expand: "user",
      })
      .catch(() => ({ items: [], totalItems: 0, totalPages: 0, page: 1, perPage: 20 })),
});

function AdminRequestsPage() {
  const loaderData = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const nav = useNavigate();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState(searchParams.search || "");
  const page = searchParams.page || 1;
  const status = searchParams.status;
  const search = searchParams.search;

  const query = useQuery({
    queryKey: ["admin-custom-requests", page, status, search],
    queryFn: () => {
      const filters: string[] = [];

      if (status === "pending") {
        filters.push('admin_response = "" || admin_response = null');
      } else if (status === "responded") {
        filters.push('admin_response != "" && admin_response != null');
      }

      if (search) {
        filters.push(pb.filter("request_body ~ {:search} || id ~ {:search}", { search }));
      }

      return pb.collection("custom_requests").getList<RequestWithUser>(page, 20, {
        sort: "-created",
        expand: "user",
        filter: filters.length ? filters.join(" && ") : undefined,
      });
    },
    initialData: page === 1 && !status && !search && loaderData.items.length > 0 ? loaderData : undefined,
  });

  const updateFilters = (newParams: Partial<typeof searchParams>) => {
    const updated = {
      ...searchParams,
      ...newParams,
      page: newParams.page ?? 1,
    };

    Object.keys(updated).forEach((key) => {
      const k = key as keyof typeof updated;
      if (!updated[k]) delete updated[k];
    });

    nav({
      to: "/admin/dashboard/requests",
      search: updated as any,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  return (
    <section className="page-wrap flex flex-col gap-6 py-4">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <h1 className="text-2xl font-bold">Custom Requests</h1>
          </div>
          {query.data && (
            <p className="text-sm text-base-content/50 mt-0.5">
              {query.data.totalItems} total bespoke consultation{query.data.totalItems !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by details, name, or ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 pr-8 rounded-xl text-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ search: undefined });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-sm btn-primary rounded-xl px-3 text-xs">
            Search
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-start overflow-x-auto pb-1">
        <div className="join">
          <button
            onClick={() => updateFilters({ status: undefined })}
            className={`join-item btn btn-sm ${!status ? "btn-active" : "btn-ghost"}`}
          >
            All Requests
          </button>
          <button
            onClick={() => updateFilters({ status: "pending" })}
            className={`join-item btn btn-sm ${status === "pending" ? "btn-active" : "btn-ghost"}`}
          >
            Pending Response
          </button>
          <button
            onClick={() => updateFilters({ status: "responded" })}
            className={`join-item btn btn-sm ${status === "responded" ? "btn-active" : "btn-ghost"}`}
          >
            Responded
          </button>
        </div>
      </div>

      {/* Content */}
      <PageLoader query={query}>
        {(data) =>
          data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200 text-sm text-center">
              <Inbox className="size-12 opacity-40" />
              <p className="font-semibold">No custom requests found.</p>
              <p className="text-xs">Try adjusting your status filter or search query.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.items.map((req) => (
                <AdminRequestCard
                  key={req.id}
                  request={req}
                  onUpdated={() => qc.invalidateQueries({ queryKey: ["admin-custom-requests"] })}
                />
              ))}

              {data.totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  onPageChange={(p) => updateFilters({ page: p })}
                />
              )}
            </div>
          )
        }
      </PageLoader>
    </section>
  );
}
