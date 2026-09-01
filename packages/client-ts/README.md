# unbound-auth

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/then77/unbound/release-client.yml?color=%231cb058)](https://github.com/then77/unbound/actions)
![Status: Alpha](https://img.shields.io/badge/Status-Alpha-red)

JavaScript auth client for [**Unbound**](https://unbound.rlzy.me).

Unbound is a stateless authentication broker. It lets developers add auth without extra signup or complicated setup, and lets users sign in with the provider they choose. User data is stored fully on the user's device, and only passes through the server for processing, never stored on server.

This client package helps simplify adding Unbound to your app. Works in the browser, as an SPA, or on the server.

📖 [**Read the docs here**](https://docs.unbound.rlzy.me)

> [!WARNING]
> This project is still in alpha. While the functionality should work, there might be some bugs or DX that doesn't quite feel right yet.

## Installation
```sh
# npm/pnpm/bun/yarn
npm install unbound-auth
```

If using this script directly in the browser, add this to your site:
```html
<script src="https://unpkg.com/unbound-auth@latest/dist/unbound.min.js"></script>
```

## Getting Started
```ts
import { createUnboundClient } from "unbound-auth";

const auth = createUnboundClient();
auth.startSignIn();

await auth.finishSignIn();
const user = auth.user;
```