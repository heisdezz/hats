import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/store/cart/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="page-wrap">Hello "/store/cart/"!</div>;
}
