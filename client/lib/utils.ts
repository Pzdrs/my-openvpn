import { ok } from "@oazapfts/runtime";
import { finishOAuth, startOAuth } from "./api/client";

export { cn } from "cn";

export const oauth = {
  isCallback: (location: Location) => {
    const search = location.search;
    return search.includes("code=") || search.includes("error=");
  },
  authorize: async (location: Location) => {
    try {
      const redirectUri = location.href.split("?", 1)[0];
      const { url } = await ok(startOAuth({ redirect_uri: redirectUri }));
      window.location.href = url;
      return true;
    } catch (error) {
      return false;
    }
  },
  login: (location: Location) => {
    return finishOAuth({ url: location.href });
  },
};
