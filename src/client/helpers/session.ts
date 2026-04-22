import { parse } from "cookie";
import { isTokenExpired } from "pocketbase";
import { unstable_getContext } from "waku/server";
import { ssr_pb } from "../pb";

export const get_initial_user = () => {
  const pb = ssr_pb();
  try {
    const ctx = unstable_getContext();
    const cookieHeader = ctx.req.headers.get("cookie") ?? "";
    const cookies = parse(cookieHeader);
    const match = cookies["pb_auth"];
    if (!match) return null;
    const token = JSON.parse(decodeURIComponent(match))?.token;
    if (!token || isTokenExpired(token)) return null;
    pb.authStore.loadFromCookie(`pb_auth=${match}`);
    const model = pb.authStore.record;
    // console.log("note expired", model);
    if (!model?.id) return null;
    return {
      id: model.id as string,
      username: (model.username ?? model.name ?? "User") as string,
      email: (model.email ?? "") as string,
    };
  } catch {
    return null;
  }
};
