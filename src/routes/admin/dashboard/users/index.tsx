import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb, ssr_pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import CustomTable, { type columnType } from "#/components/tables/CustomTable";
import type { Actions } from "#/components/tables/pop-up";
import type { ProfileResponse } from "pocketbase-types";
import Pagination from "#/components/Pagination";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute("/admin/dashboard/users/")({
  validateSearch: searchSchema,
  component: RouteComponent,
  loader: () => ssr_pb().collection("profile").getList(1, 20, { sort: "-created" }),
});

const columns: columnType<ProfileResponse>[] = [
  {
    key: "firstName",
    label: "Name",
    render: (_, item) => {
      const fullName =
        [item.firstName, item.lastName].filter(Boolean).join(" ") || null;
      const initials =
        [item.firstName?.[0], item.lastName?.[0]]
          .filter(Boolean)
          .join("")
          .toUpperCase() || "?";
      return (
        <div className="flex items-center gap-3">
          <div className="avatar avatar-placeholder shrink-0">
            <div className="bg-primary/10 text-primary rounded-full w-9 h-9 font-bold text-xs">
              <span>{initials}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight">
              {fullName ?? (
                <span className="text-base-content/30 italic">No name</span>
              )}
            </p>
            {item.username && (
              <p className="text-xs text-base-content/40">@{item.username}</p>
            )}
          </div>
        </div>
      );
    },
  },
  { key: "email", label: "Email" },
  {
    key: "phoneNumber",
    label: "Phone",
    render: (val) =>
      val ? (
        <span>{val}</span>
      ) : (
        <span className="text-base-content/30">—</span>
      ),
  },
  {
    key: "sex",
    label: "Sex",
    render: (val) => val || <span className="text-base-content/30">—</span>,
  },
  {
    key: "age",
    label: "Age",
    render: (val) =>
      val ? `${val} yrs` : <span className="text-base-content/30">—</span>,
  },
];

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const nav = useNavigate();

  const [searchInput, setSearchInput] = useState(searchParams.search || "");
  const page = searchParams.page || 1;
  const search = searchParams.search;

  const query = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => {
      const filter = search
        ? pb.filter("firstName ~ {:s} || lastName ~ {:s} || email ~ {:s} || username ~ {:s}", { s: search })
        : undefined;

      return pb.collection("profile").getList<ProfileResponse>(page, 20, {
        sort: "-created",
        filter,
      });
    },
    initialData: page === 1 && !search ? loaderData : undefined,
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
      to: "/admin/dashboard/users",
      search: updated as any,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const actions: Actions<ProfileResponse>[] = [
    {
      key: "view",
      label: "View profile",
      action: (item) => {
        nav({
          to: "/admin/dashboard/users/$userId",
          params: { userId: item.id as string },
        });
      },
    },
  ];

  return (
    <main className="dash-wrap p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          {query.data && (
            <p className="text-sm text-base-content/50 mt-0.5">
              {query.data.totalItems} registered profile{query.data.totalItems !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
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

      <PageLoader query={query}>
        {({ items, totalPages }) => (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="p-12 text-center bg-base-100 rounded-2xl border border-base-200 text-base-content/40 text-sm">
                No users found matching search criteria.
              </div>
            ) : (
              <>
                <CustomTable data={items} columns={columns} actions={actions} />
                {totalPages > 1 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(p) => updateFilters({ page: p })}
                  />
                )}
              </>
            )}
          </div>
        )}
      </PageLoader>
    </main>
  );
}
