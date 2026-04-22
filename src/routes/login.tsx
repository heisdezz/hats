import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: index });
function index() {
  return <div></div>;
}
