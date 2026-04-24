import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/store/jewelry/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/catalog/hats/jewelery"!</div>;
}
