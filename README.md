# My OpenVPN

My OpenVPN is a web portal for clients to manage their OpenVPN connections. More specifically, it gives users a dashboard where they can download OpenVPN profiles for servers they are allowed to connect to, register their devices and download, renew, or revoke their device certificates. 

The portal is built with a Next.js frontend and a Go backend API, which uses PostgreSQL for data storage.

## Authentication

The portal uses exclusively OpenID Connect (OIDC) for authentication (no local accounts). The backend issues 1h JWT access tokens for the frontend to use in API requests, no refresh tokens are used. The frontend automatically redirects to the IdP for seamless login and logout. 

## Configuration

The backend API uses Viper to read `my-openvpn` configuration files from the current working directory, then `/etc/my-openvpn`. YAML is used in the example below; Viper also recognizes its supported config file extensions. A missing config file is allowed. Settings may instead come from environment variables. Environment variables take precedence over file values, which take precedence over the defaults in this table. Environment names use the `MY_OPENVPN_` prefix, with `.` replaced by `_`; Viper does not insert underscores within field names. For example, use `MY_OPENVPN_OIDC_CLIENTID`, not `MY_OPENVPN_OIDC_CLIENT_ID`.

| Environment variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `MY_OPENVPN_SERVER_HOST` | No | `0.0.0.0` | HTTP server bind host. |
| `MY_OPENVPN_SERVER_PORT` | No | `8080` | Must be between `1` and `65535`. |
| `MY_OPENVPN_DATABASE_URL` | Conditional | — | Optional PostgreSQL connection URL. When set, it takes precedence over the separate database fields and must parse as a pgx PostgreSQL URL. |
| `MY_OPENVPN_DATABASE_HOST` | Conditional | — | Required when `MY_OPENVPN_DATABASE_URL` is empty. |
| `MY_OPENVPN_DATABASE_PORT` | No | `5432` | Used when `MY_OPENVPN_DATABASE_URL` is empty. |
| `MY_OPENVPN_DATABASE_USER` | Conditional | — | Required when `MY_OPENVPN_DATABASE_URL` is empty. |
| `MY_OPENVPN_DATABASE_PASSWORD` | Conditional | — | Required when `MY_OPENVPN_DATABASE_URL` is empty. |
| `MY_OPENVPN_DATABASE_NAME` | Conditional | — | Required when `MY_OPENVPN_DATABASE_URL` is empty. |
| `MY_OPENVPN_OIDC_CLIENTID` | Yes | — | OIDC client ID. |
| `MY_OPENVPN_OIDC_CLIENTSECRET` | Yes | — | OIDC client secret. |
| `MY_OPENVPN_OIDC_ISSUERURL` | Yes | — | Must be a valid URL. |
| `MY_OPENVPN_OIDC_SCOPES` | No | `openid,profile,email` | Comma-separated when set as an environment variable. The API appends `openid` if it is missing. |
| `MY_OPENVPN_OIDC_ROLESCLAIM` | Yes | — | Name of the ID-token claim containing roles. The claim must decode as a string array; the exact role `admin` sets `is_admin: true`. |
| `MY_OPENVPN_JWT_SECRETKEY` | Yes | — | Key used to sign application access tokens. |
| `MY_OPENVPN_JWT_TOKENLIFETIME` | No | `60m` | Go duration syntax, such as `30m` or `12h`. Invalid values cause a startup panic when the token service starts. |

The database may be configured with either `database.url` or the separate host, user, password, and name values. When `database.url` is non-empty, it is parsed as a PostgreSQL connection string and the separate fields are ignored. When it is empty, host, user, password, and name are required; port defaults to `5432`. Server port validation accepts only values from `1` through `65535`. OIDC client ID, client secret, issuer URL, role claim name, and JWT secret are required; the issuer must be a valid URL. The role claim is expected to contain a string array, and the exact role value `admin` grants admin status. Empty environment variables are treated as unset by Viper, so they do not clear a file value or default.

Example `my-openvpn.yaml`:

```yaml
server:
  host: 0.0.0.0
  port: 8080

database:
  url: "postgres://root:password@localhost:5432/client_zone_db?sslmode=disable"

oidc:
  clientid: "your-oidc-client-id"
  clientsecret: "your-oidc-client-secret"
  issuerurl: "https://identity.example.com/"
  scopes: [openid, profile, email]
  rolesclaim: "roles"

jwt:
  secretkey: "replace-with-a-long-random-secret"
  tokenlifetime: 60m
```

The local OIDC client should allow `http://localhost:3000/auth/login` as a redirect URI. The default OpenID scopes are `openid`, `profile`, and `email`; if you override them, the API ensures `openid` remains in the list.

## Screenshots

![Dashboard](docs/assets/dashboard.png)

### AI Disclosure

The only part of this project that was vibed with AI is the UI. I can't do UI for shit, so the interface, all the Tailwind and CSS stuff is straight up Codexed up. The rest of the project is pure human spaghetti.