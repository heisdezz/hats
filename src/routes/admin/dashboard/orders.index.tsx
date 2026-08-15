import { pb, ssr_pb } from "#/client/pb";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader";
import Pagination from "#/components/Pagination";
import GridContainer from "#/components/GridContainer";
import OrderCard from "./-components/orders/OrderCard";
import type { UserOrdersResponse } from "#/../pocketbase-types";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  page: z.number().catch(1).optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute("/admin/dashboard/orders/")({
  validateSearch: searchSchema,
  component: RouteComponent,
  loader: () =>
    ssr_pb().collection("user_orders").getList(1, 20, {
      sort: "-created",
      expand: "preview,orderItems,user",
    }),
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const nav = useNavigate();

  const [searchInput, setSearchInput] = useState(searchParams.search || "");
  const page = searchParams.page || 1;
  const status = searchParams.status;
  const search = searchParams.search;

  const query = useQuery({
    queryKey: ["admin-orders", page, status, search],
    queryFn: () => {
      const filters: string[] = [];

      if (status) {
        filters.push(pb.filter("status = {:status}", { status }));
      }

      if (search) {
        filters.push(pb.filter("ref ~ {:search} || id ~ {:search}", { search }));
      }

      return pb.collection("user_orders").getList<UserOrdersResponse>(page, 20, {
        sort: "-created",
        expand: "preview,orderItems,user",
        filter: filters.length ? filters.join(" && ") : undefined,
      });
    },
    initialData: page === 1 && !status && !search ? loaderData : undefined,
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
      to: "/admin/dashboard/orders",
      search: updated as any,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const statuses = ["pending", "processing", "in-transit", "delivered"];

  return (
    <section className="page-wrap flex flex-col gap-6 py-4">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders Management</h1>
          {query.data && (
            <p className="text-sm text-base-content/50 mt-0.5">
              {query.data.totalItems} total order{query.data.totalItems !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by order reference or ID..."
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

      <div className="flex items-center justify-start overflow-x-auto pb-1">
        <div className="join">
          <button
            onClick={() => updateFilters({ status: undefined })}
            className={`join-item btn btn-sm ${!status ? "btn-active" : "btn-ghost"}`}
          >
            All Orders
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => updateFilters({ status: s })}
              className={`join-item btn btn-sm capitalize ${status === s ? "btn-active" : "btn-ghost"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <PageLoader query={query}>
        {(data) =>
          data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200 text-sm">
              <p className="font-semibold">No orders found.</p>
              <p className="text-xs">Try adjusting your status filter or search reference.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <GridContainer>
                {data.items.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </GridContainer>
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
