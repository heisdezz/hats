import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/custom-request")({
  beforeLoad: () => {
    throw redirect({
      to: "/store/custom-request",
    });
  },
  component: () => null,
});
