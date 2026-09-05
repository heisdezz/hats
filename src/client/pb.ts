import type { TypedPocketBase } from "pocketbase-types";
import PocketBase from "pocketbase";

const PB_URL =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? window.location.origin
    : "http://127.0.0.1:8090";

export const pb = new PocketBase(PB_URL) as TypedPocketBase;

export const ssr_pb = () => {
  const pb = new PocketBase("http://127.0.0.1:8090") as TypedPocketBase;
  return pb;
};
