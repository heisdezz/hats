import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/jewelry/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/catalog/hats/jewelery"!</div>;
}
