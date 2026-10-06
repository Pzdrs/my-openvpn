# My OpenVPN

My OpenVPN is a web portal for clients to manage their OpenVPN connections. More specifically, it gives users a dashboard where they can download OpenVPN profiles for servers they are allowed to connect to, register their devices and download, renew, or revoke their device certificates. 

The portal is built with a Next.js frontend and a Go backend API, which uses PostgreSQL for data storage.

## Authentication

The portal uses exclusively OpenID Connect (OIDC) for authentication (no local accounts). The backend issues 1h JWT access tokens for the frontend to use in API requests, no refresh tokens are used. The frontend automatically redirects to the IdP for seamless login and logout. 