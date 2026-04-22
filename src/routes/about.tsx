import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return <div></div>;
}
