# ![Unbound — Logo](https://github.com/user-attachments/assets/abba5844-51ea-4859-a984-1008a3b7d02c) Unbound

[![Unbound — Site](https://img.shields.io/badge/Site-Unbound-3929BA)](https://unbound.rlzy.me) [![Unbound — Docs](https://img.shields.io/badge/Docs-Unbound-1CB058)](https://docs.unbound.rlzy.me) [![Unbound — Client](https://img.shields.io/npm/v/unbound-auth?label=unbound-auth)](https://www.npmjs.com/package/unbound-auth) ![Unbound — Status: Alpha](https://img.shields.io/badge/Status-Alpha-red)

Unbound is a simple and stateless auth broker. It help developers to add lightweight sign-in without requiring more setup for auth or rolling your own auth.

📖 [**Read the documentation**](https://docs.unbound.rlzy.me)

> [!WARNING]
> Unbound is still in alpha. Expect APIs and behaviour may change significant on later time. Use on production apps is still discouraged.

## What exactly?

Unbound is just another auth broker, **but** focused more on:
- **Simple.** Why bother do setup if you can just plug an auth and it just work? ([look example here](#install-example))
- **Stateless.** User and auth data are saved **locally** and **encrypted**, in their own browser. Server dont store any of this, only process when user requested, which means: ⬇️
- **Privacy focused.** On top of that, since we scramble user id on each apps, even with the same user, apps cant just easily recognize you on other apps. (Less user tracking!)

## Lemme try it

Install the official typescript client:

```sh
npm add unbound-auth
# pnpm add unbound-auth
# bun add unbound-auth
```

Or, if youre the native type person, you can put this instead:

```html
<script src="https://unpkg.com/unbound-auth@latest/dist/unbound.min.js"></script>
```

<a name="install-example"></a>
Make a new unbound client:

```ts
import { createUnboundClient } from "unbound-auth";

export const auth = createUnboundClient({
  redirect_uri: "/auth/callback",
  scopes: ["openid", "profile", "email"],
});

// If you use <script> instead, you can skip this step
// or if you still need configuration:
// auth = Unbound.create({
//   redirect_uri: "/auth/callback",
//   scopes: ["openid", "profile", "email"],
// });
```

Start a sign-in, using buttons or any action:

```ts
export async function signIn() {
  await auth.startSignIn();
  // Or: Unbound.startSignIn();
}
```

Then, finish it.

```ts
// For <script> user, this is automatically handled by default, unless you change redirect behaviour, skip this.

export async function completeSignIn() {
  const { data: session, error } = await auth.finishSignIn();

  if (error) throw error;

  history.replaceState(null, "", "/dashboard");
  console.log(session.user);
}
```

📖 For more details, see the [quickstart](https://docs.unbound.rlzy.me/docs/quickstart).

## Run locally

You can run Unbound locally using node, although we recommend using Wrangler due to our current project base.

### Requirements

- [Node.js](https://nodejs.org/) 20.x or newer and [pnpm](https://pnpm.io/) 10.14 or newer.
- OAuth credentials for at least one supported provider: Google, GitHub, or Discord

Clone the repository and install deps:

```sh
git clone https://github.com/then77/unbound.git
cd unbound
pnpm install
```

### Build web assets (required)

Next step, we need to build the web assets, so you'll have a nice ui shown later when running instead of blank/broken page. Do this at least once:

```sh
pnpm build:web
```

### Setting up

Next, we need to setup the required environment variables to make it actually working.

First, if youre using Nodejs, go to folder `apps/server`, find `.env.example`, then copy it to `.env`. For wrangler, its should be available already in `wrangler.jsonc`.

Then, start the server first:

- Wrangler: Deploy first, or run `wrangler dev` locally.
- Nodejs: `pnpm dev:server` then open `http://localhost:8080`

<details>
<summary>You should see UI something like this:</summary>

![Image — showing — Unbound — in — setup — phase](https://github.com/user-attachments/assets/2727e032-9d66-4d7d-8083-c37934408497)

</details>

Follow the instruction on that setup page. For wrangler, you might need to adjust the provided env into the wrangler config.

### Optional setup: KV

You can additionally setup Cloudflare KV and connect it to Unbound. This is used for temporarily caching used auth callback token, and to prevent replay attack.

Refer to [Cloudflare docs](https://developers.cloudflare.com/kv/get-started/) for how to set them up, then configure it on the env / wrangler config file.

## Repository

- `apps/server` - Contains the core Unbound server.
- `apps/web` - Contains the web interface and assets for Unbound.
- `apps/docs` - Contains the documentation site for Unbound.
- `packages/client-ts` - Contains source for [`unbound-auth`](https://www.npmjs.com/package/unbound-auth) TypeScript client.

## Credits

- [`hono`](https://hono.dev) - The stack framework powering Unbound core, and ui render for Unbound web interface.
- [`@hapi/iron`](https://github.com/hapijs/iron) - Core library for handling user data encryption.
- [`changeset`](https://changesets.dev/) - Very helpful package versioning and publish tool for [`unbound-auth`](https://www.npmjs.com/package/unbound-auth)

— Side note: This project is made with help from AI, especially with assisting making docs content.