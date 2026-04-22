import type { PropsWithChildren } from "react";

export default function Aside(props: PropsWithChildren) {
  return (
    <aside className="flex-1 max-w-lg h-fit ring fade rounded-xl  bg-base-200/50  p-4">
      {props.children}
    </aside>
  );
}
