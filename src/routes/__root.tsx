import {
  HeadContent,
  Scripts,
  ScrollRestoration,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import "../styles.css";
import { Header } from "#/components/header";
import { Footer } from "#/components/footer";
import { Toaster } from "sonner";
import Provider from "#/components/providers/Provider";
import appCss from "../styles.css?url";

import GlobalErrorComponent from "#/components/GlobalErrorComponent";
import NotFoundComponent from "#/components/NotFoundComponent";

export const Route = createRootRoute({
  errorComponent: GlobalErrorComponent,
  notFoundComponent: NotFoundComponent,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="autumn">
      <head>
        <HeadContent />
      </head>
      <body>
        <Provider>{children}</Provider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
