import { pb } from "#/client/pb";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader";
import Pagination from "#/components/Pagination";
import UserRequestCard from "../-components/UserRequestCard";
import type { CustomRequestsResponse } from "#/../pocketbase-types";
import { Sparkles, LogIn, Plus } from "lucide-react";

export const Route = createFileRoute("/profile/requests/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { page?: number } => ({
    page: Number(search.page) || 1,
  }),
  component: UserRequestsPage,
});

function UserRequestsPage() {
  const { page } = Route.useSearch();
  const isAuthenticated = pb.authStore.isValid;
  const userId = pb.authStore.record?.id;

  const query = useQuery({
    queryKey: ["user-custom-requests", page, userId],
    queryFn: () =>
      pb.collection("custom_requests").getList<CustomRequestsResponse>(page || 1, 10, {
        sort: "-created",
        filter: pb.filter("user = {:uid}", { uid: userId }),
      }),
    enabled: !!userId && isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="page-wrap py-12 flex flex-col items-center justify-center text-center">
        <div className="card bg-base-100 border border-base-200 shadow-xs max-w-md p-8 flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="size-8" />
          </div>
          <h2 className="text-xl font-bold">My Custom Requests</h2>
          <p className="text-sm text-base-content/60">
            Please log in to track your custom bespoke requests and view artisan consultation responses.
          </p>
          <Link
            to="/login"
            search={{ redirect: "/profile/requests" }}
            className="btn btn-primary rounded-xl gap-2 mt-2"
          >
            <LogIn className="size-4" /> Log In to View Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Custom Requests</h1>
          <p className="text-xs text-base-content/50 mt-0.5">
            Track your bespoke consultation requests and artisan responses
          </p>
        </div>

        <Link
          to="/store/custom-request"
          className="btn btn-primary btn-sm rounded-xl gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="size-4" />
          New Custom Request
        </Link>
      </div>

      <PageLoader query={query}>
        {(data) =>
          data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-base-content/40 bg-base-100 rounded-2xl border border-base-200 text-center p-6">
              <Sparkles className="size-12 opacity-30 text-primary" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-base-content/70">
                  No custom requests yet
                </p>
                <p className="text-xs text-base-content/50 max-w-xs mx-auto">
                  Have a specific hat, fascinator, or jewelry design in mind for an upcoming occasion?
                </p>
              </div>
              <Link
                to="/store/custom-request"
                className="btn btn-primary btn-sm rounded-xl gap-1.5 text-xs mt-2"
              >
                <Plus className="size-3.5" />
                Submit Your First Request
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.items.map((req) => (
                <UserRequestCard key={req.id} request={req} />
              ))}

              {data.totalPages > 1 && (
                <Pagination page={page || 1} totalPages={data.totalPages} />
              )}
            </div>
          )
        }
      </PageLoader>
    </div>
  );
}
