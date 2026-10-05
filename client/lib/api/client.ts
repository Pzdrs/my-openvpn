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
    url: string;
};
export type DtoOAuthCallbackResponse = object;
export type DtoProfile = {
    data: string;
    hash: string;
    updated_at: string;
};
export type DtoServer = {
    description?: string;
    id: number;
    name: string;
    profile?: DtoProfile;
};
export type DtoUser = {
    email: string;
    id: string;
    name: string;
    picture: string;
};
/**
 * Initiate logout
 */
export function logout(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/auth/logout", {
        ...opts,
        method: "POST"
    });
}
/**
 * Initiate OAuth2 authorization flow
 */
export function startOAuth(dtoOAuthAuthorizeRequest: DtoOAuthAuthorizeRequest, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: DtoOAuthAuthorizeResponse;
    }>("/oauth/authorize", oazapfts.json({
        ...opts,
        method: "POST",
        body: dtoOAuthAuthorizeRequest
    }));
}
/**
 * Handle OAuth2 callback
 */
export function finishOAuth(dtoOAuthCallbackRequest: DtoOAuthCallbackRequest, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 204;
        data: DtoOAuthCallbackResponse;
    }>("/oauth/callback", oazapfts.json({
        ...opts,
        method: "POST",
        body: dtoOAuthCallbackRequest
    }));
}
/**
 * Get servers that the user has access to
 */
export function getUserServers(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: DtoServer[];
    }>("/servers", {
        ...opts
    });
}
/**
 * Download server profile
 */
export function downloadServerProfile(serverId: number, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchBlob<{
        status: 200;
        data: Blob;
    }>(`/servers/${encodeURIComponent(serverId)}/profile`, {
        ...opts
    });
}
/**
 * Get authenticated user info
 */
export function getMe(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: DtoUser;
    }>("/users/me", {
        ...opts
    });
}
