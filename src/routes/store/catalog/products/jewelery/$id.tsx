import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/store/catalog/products/jewelery/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/products/jewelery/$id"!</div>;
}
