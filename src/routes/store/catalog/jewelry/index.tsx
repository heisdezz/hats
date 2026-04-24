import { createFileRoute } from "@tanstack/react-router";

interface SEARCH {
  category?: string;
  page?: number;
}
export const Route = createFileRoute("/store/catalog/jewelry/")({
  component: RouteComponent,
  validateSearch: (search: SEARCH) => {
    return search;
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  return (
    <div className="page-wrap">
      {JSON.stringify(search?.category)} Hello "/catalog/jewelery"!
    </div>
  );
}
