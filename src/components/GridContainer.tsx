import type { PropsWithChildren } from "react";

export default function GridContainer(props: PropsWithChildren) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {props.children}
    </div>
  );
}
