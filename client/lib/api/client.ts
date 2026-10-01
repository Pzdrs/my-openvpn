/**
 * OpenVPN Client Zone API
 * 1.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
    headers: {},
    baseUrl: "/api/v1"
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    server1: "/api/v1"
};
export type DtoOAuthAuthorizeRequest = {
    redirect_uri: string;
};
export type DtoOAuthAuthorizeResponse = {
    url: string;
};
export type DtoOAuthCallbackRequest = {
    state?: string;
    url: string;
};
export type DtoOAuthCallbackResponse = object;
/**
 * Initiate OAuth2 authorization flow
 */
export function startOAuth(dtoOAuthAuthorizeRequest: DtoOAuthAuthorizeRequest, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: DtoOAuthAuthorizeResponse;
    }>("/oauth/authorize", oazapfts.json({
        ...opts,
        method: "POST",
        body: dtoOAuthAuthorizeRequest
    })));
}
/**
 * Handle backchannel logout
 */
export function handleBackchannelLogout(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchText("/oauth/backchannel-logout", {
        ...opts,
        method: "POST"
    }));
}
/**
 * Handle OAuth2 callback
 */
export function finishOAuth(dtoOAuthCallbackRequest: DtoOAuthCallbackRequest, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 204;
        data: DtoOAuthCallbackResponse;
    }>("/oauth/callback", oazapfts.json({
        ...opts,
        method: "POST",
        body: dtoOAuthCallbackRequest
    })));
}
