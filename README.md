# ![Unbound Logo](https://github.com/user-attachments/assets/abba5844-51ea-4859-a984-1008a3b7d02c) Unbound

[![Site](https://img.shields.io/badge/Site-Unbound-3929BA)](https://unbound.rlzy.me) [![Docs](https://img.shields.io/badge/Docs-Unbound-1CB058)](https://docs.unbound.rlzy.me) [![Client](https://img.shields.io/npm/v/unbound-auth?label=unbound-auth)](https://www.npmjs.com/package/unbound-auth) ![Status: Alpha](https://img.shields.io/badge/Status-Alpha-red)

Unbound is a stateless authentication broker. It lets developers add sign-in without managing user passwords or creating another user-account system, while users can sign in with a provider they already use.

User profile data is kept in an encrypted cookie on the user's device and only passes through Unbound while completing authentication. Each app also receives a different app-scoped user ID.

📖 [**Read the documentation**](https://docs.unbound.rlzy.me)

> [!WARNING]
> Unbound is still in alpha. APIs and behavior may change, and production use requires your own security and privacy review.

## Try it

Install the official TypeScript client:

```sh
pnpm add unbound-auth
```

Or load the global browser bundle if your app does not use a package build step:

```html
<script src="https://unpkg.com/unbound-auth@latest/dist/unbound.min.js"></script>
```

The bundle exposes a pre-created global `Unbound` client. More details for this available on the [quickstart](https://docs.unbound.rlzy.me/docs/quickstart).

The example below uses the npm package. Create one client shared by your sign-in page and callback page:

```ts
// auth.ts
import { createUnboundClient } from "unbound-auth";

export const auth = createUnboundClient({
  redirect_uri: "/auth/callback",
  scopes: ["openid", "profile", "email"],
});
```

Start sign-in from a button or other user action:

```ts
// sign-in.ts
import { auth } from "./auth";

export async function signIn() {
  const { data, error } = await auth.startSignIn();

  if (error) throw error;
  window.location.assign(data.url);
}
```

Then finish it when `/auth/callback` loads:

```ts
// auth-callback.ts
import { auth } from "./auth";

export async function completeSignIn() {
  const { data: session, error } = await auth.finishSignIn();

  if (error) throw error;

  history.replaceState(null, "", "/dashboard");
  console.log(session.user);
}
```

Starting and finishing sign-in are separate steps with a browser redirect between them. See the [quickstart](https://docs.unbound.rlzy.me/docs/quickstart) for browser-bundle usage, callback handling, and production security guidance.

## Run Unbound locally

### Requirements

- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) 10.14 or newer
- OAuth credentials for at least one supported provider: Google, GitHub, or Discord

Clone the repository and install dependencies:

```sh
git clone https://github.com/then77/unbound.git
cd unbound
pnpm install
```

### Recommended: Wrangler

The easiest way to run the complete server locally is with Cloudflare Wrangler. Open `apps/server/wrangler.jsonc` and:

1. Add `SESSION_SECRET_KEY`, `JWK_PUBLIC_KEY`, and `JWK_PRIVATE_KEY` under `vars`.
2. Add both the client ID and client secret for at least one provider.
3. Create a KV namespace with `pnpm --dir apps/server exec wrangler kv namespace create KV`.
4. Replace the example namespace ID under `kv_namespaces`, keeping the binding name exactly `KV`.

> [!NOTE]
> If you do not have the signing values yet, you can start/deploy Unbound with empty key values and a setup page will shown when you open. Simply follow the instructions provided to complete the setup.

Build the interface and start the local Worker:

```sh
pnpm --filter @unbound/web build
pnpm --dir apps/server exec wrangler dev
```

Wrangler prints the local address when it starts. Configure your provider's OAuth application with the callback URL shown by Unbound's setup instructions.

> [!IMPORTANT]
> Please replace the example KV namespace ID in `kv_namespaces` with one owned by your Cloudflare account, and please do not commit real provider secrets, session keys, or private JWKs. For production, store sensitive values with `wrangler secret put` instead of committing them under `vars`.

### Alternative: Node.js or Bun

The Node.js/Bun server reads the same configuration names from `apps/server/.env` instead of `wrangler.jsonc`:

```properties
SESSION_SECRET_KEY="..."
JWK_PUBLIC_KEY="..."
JWK_PRIVATE_KEY="..."

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Then run the server and its styles together:

```sh
pnpm dev
```

The Node.js server runs at [http://localhost:8080](http://localhost:8080) by default. This path does not provide the Cloudflare `KV` binding, so Wrangler is preferred when testing the complete Cloudflare setup.

## Deploy to Cloudflare Workers

After configuring `apps/server/wrangler.jsonc` and production secrets, then build and deploy:

```sh
pnpm --filter @unbound/web build
pnpm --dir apps/server exec wrangler deploy
```

## Repository

- `apps/server` — authentication server for Node.js, Bun, and Cloudflare Workers
- `apps/web` — server-rendered Unbound interface and styles
- `apps/docs` — documentation site
- `packages/client-ts` — the [`unbound-auth`](https://www.npmjs.com/package/unbound-auth) TypeScript client

Contributions and issue reports are welcome through the [GitHub repository](https://github.com/then77/unbound).

Side note: This project is made with help from AI, especially with assisting making docs content.
