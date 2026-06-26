# unbound-auth

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/then77/unbound/release-client.yml?color=%231cb058)](https://github.com/then77/unbound/actions)
![Status: Alpha](https://img.shields.io/badge/Status-Alpha-red)

Javascript auth client for Unbound. [Read more](https://github.com/then77/unbound)

> [!NOTE]
> This project is still in alpha. More info coming soon.

```ts
import { createUnboundClient } from "unbound-auth";

const auth = createUnboundClient();
auth.startSignIn();

await auth.finishSignIn();
const user = auth.user;
```