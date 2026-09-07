import type { TypedPocketBase } from "pocketbase-types";
import PocketBase from "pocketbase";

const local_url = "http://127.0.0.1:8090";
export const getPbUrl = () => {
  const url =
    import.meta.env?.VITE_PB_URL ||
    import.meta.env?.VITE_POCKETBASE_URL ||
    (typeof process !== "undefined" && process.env
      ? process.env.VITE_PB_URL ||
        process.env.VITE_POCKETBASE_URL ||
        process.env.PB_URL
      : undefined) ||
    local_url;

  return url.replace(/\/+$/, "");
};

export const pb = new PocketBase(getPbUrl()) as TypedPocketBase;

export const ssr_pb = () => {
  const pb = new PocketBase(getPbUrl()) as TypedPocketBase;
  return pb;
};
