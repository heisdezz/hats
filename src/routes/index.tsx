import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
//@ts-ignore
export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: () => redirect({ to: "/store" }),
});

function RouteComponent() {
  return <div>Hello "/"!</div>;
}
