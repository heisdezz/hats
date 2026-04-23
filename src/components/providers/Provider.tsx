import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Provider(props: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      {props.children}
    </QueryClientProvider>
  );
}
