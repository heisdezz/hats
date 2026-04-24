import type { PropsWithChildren } from "react";

export default function Skeleton(props: PropsWithChildren) {
  return <div className="page-wrap  flex gap-2">{props.children}</div>;
}
