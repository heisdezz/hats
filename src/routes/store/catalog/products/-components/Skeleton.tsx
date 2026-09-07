import type { PropsWithChildren } from "react";

export default function Skeleton(props: PropsWithChildren) {
  return (
    <div
      className="page-wrap  flex gap-2 [&>*:nth-child(2)]:hidden

      [&>*:nth-child(2)]:lg:block"
    >
      {props.children}
    </div>
  );
}
