import { LegalSection } from "@unbound/web/components/legal-section";

export function PrivacyPage() {
    return (
        <div class="w-full flex flex-col gap-10 pb-16">
            <div class="flex flex-col gap-4">
                <h1 class="text-4xl font-bold tracking-tight text-balance">
                    Privacy Policy
                </h1>
                <p class="text-muted-foreground">
                    Effective date: <b>20 June, 2026</b>
                </p>
                <div class="w-full h-px bg-muted mt-4" />
            </div>

            <LegalSection title="1. Short version">
                <p>
                    Unbound is an authentication broker that keeps sign-in
                    lightweight. It helps developers add auth without extra
                    signup or complicated setup, while users sign in with the
                    provider they choose.
                </p>
                <p>
                    Unbound only processes data provided for the auth flow, and
                    only as needed to complete sign-in, issue short-lived
                    identity tokens, and send the user back to the app they
                    approved. In normal operation, Unbound does not store user
                    profile or account data on the server.
                </p>
            </LegalSection>

            <LegalSection title="2. Data Unbound may process">
                <p>
                    During an auth flow, Unbound may process provided data
                    required to complete that flow: <code>Provider ID</code>,{" "}
                    <code>Provider name</code>, <code>Display name</code>,{" "}
                    <code>Avatar (if available)</code>,{" "}
                    <code>Email address</code>,{" "}
                    <code>Email verification status</code>, <code>Scopes</code>,{" "}
                    <code>Redirect URI</code>,{" "}
                    <code>OAuth state, and token claims</code>.
                </p>
                <p>
                    Some temporary technical data may also be used to keep the
                    auth flow working, prevent replay, debug issues, and handle
                    security or legal needs.
                </p>
            </LegalSection>

            <LegalSection title="3. Local encrypted cookie">
                <p>
                    When Unbound needs to remember login state, user data is
                    saved locally on your device in an encrypted cookie. That
                    cookie helps Unbound continue the auth flow without storing
                    user profile or account data in a server-side session
                    database.
                </p>
                <p>
                    You can clear cookies in your browser. If you do, you may
                    need to sign in again before using Unbound.
                </p>
            </LegalSection>

            <LegalSection title="4. Tokens and app-scoped IDs">
                <p>
                    Unbound creates pairwise user IDs per app origin. This means
                    the same provider account gets a different Unbound ID for
                    different apps.
                </p>
                <p>
                    Identity tokens are signed and short-lived. Apps should only
                    trust them after checking the signature, issuer, audience,
                    expiration, and relevant claims.
                </p>
            </LegalSection>

            <LegalSection title="5. Third-party providers">
                <p>
                    Unbound depends on external identity providers. When you
                    sign in with a provider, that provider handles your account
                    under its own terms and policies.
                </p>
                <ul>
                    <li>
                        Google:{" "}
                        <a href="https://policies.google.com/terms">
                            Terms of service
                        </a>
                        ,{" "}
                        <a href="https://policies.google.com/privacy">
                            Privacy policy
                        </a>
                    </li>
                    <li>
                        GitHub:{" "}
                        <a href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service">
                            Terms of service
                        </a>
                        ,{" "}
                        <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
                            Privacy policy
                        </a>
                    </li>
                    <li>
                        Discord:{" "}
                        <a href="https://discord.com/terms">Terms of service</a>
                        ,{" "}
                        <a href="https://discord.com/privacy">Privacy policy</a>
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="6. Apps using Unbound">
                <p>
                    Apps that use Unbound are separate services. Before you
                    approve an app, check the app origin and the scopes shown on
                    the authorization screen.
                </p>
                <p>
                    After an app receives data from Unbound, that app is
                    responsible for its own storage, security, privacy policy,
                    and use of that data.
                </p>
            </LegalSection>

            <LegalSection title="7. Temporary records and logs">
                <p>
                    Unbound may use temporary records for OAuth flow state,
                    replay prevention, flash messages, security, debugging, and
                    legal needs.
                </p>
                <p>
                    Logs may include technical details like request timing,
                    errors, provider responses, or other information needed to
                    keep the service working and safe.
                </p>
            </LegalSection>

            <LegalSection title="8. What Unbound does not do">
                <ul>
                    <li>Unbound does not sell user data.</li>
                    <li>Unbound does not run ads or ad tracking.</li>
                    <li>
                        Unbound does not store user profile or account data on
                        the server in normal operation.
                    </li>
                    <li>
                        Unbound does not decide what an app does with data after
                        the app receives it.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="9. Security">
                <p>
                    Unbound uses encrypted cookies, short-lived codes/tokens,
                    signed identity tokens, and app-scoped identifiers to reduce
                    unnecessary data exposure. However, no system is perfect. It
                    is recommended to keep your browser, tokens, cookies, client
                    credentials, signing keys, and secrets safe.
                </p>
            </LegalSection>

            <LegalSection title="10. Your choices">
                <ul>
                    <li>You can choose whether to sign in through Unbound.</li>
                    <li>
                        You can approve or deny each app authorization request.
                    </li>
                    <li>You can clear Unbound cookies in your browser.</li>
                    <li>
                        You can manage your provider account through that
                        provider directly.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="11. Changes">
                <p>
                    This Privacy Policy may change over time as Unbound changes.
                    Continuing to use Unbound after the effective date means you
                    accept the latest version.
                </p>
            </LegalSection>

            <LegalSection title="12. Contact">
                <p>
                    Support/legal inquiries: refer to the contact info on the{" "}
                    <a href="https://github.com/then77/unbound">
                        Unbound GitHub repository
                    </a>
                    .
                </p>
            </LegalSection>
        </div>
    );
}
