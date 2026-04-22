import type { TypedPocketBase } from "pocketbase-types";
import PocketBase from "pocketbase";

export const pb = new PocketBase("http://127.0.0.1:8090") as TypedPocketBase;

export const ssr_pb = () => {
  const pb = new PocketBase("http://127.0.0.1:8090") as TypedPocketBase;
  return pb;
};
