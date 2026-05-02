import type { PropsWithChildren } from "react";

export default function GridContainer(
  props: PropsWithChildren<{
    size?: "sm" | "md" | "lg";
  }>,
) {
  if (props.size === "lg")
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {props.children}
      </div>
    );
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {props.children}
    </div>
  );
}
