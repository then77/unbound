import { LegalSection } from "@unbound/web/components/legal-section";

export function TermsPage() {
    return (
        <div class="w-full flex flex-col gap-10 pb-16">
            <div class="flex flex-col gap-4">
                <h1 class="text-4xl font-bold tracking-tight text-balance">
                    Terms Of Service
                </h1>
                <p class="text-muted-foreground">
                    Effective date: <b>20 June, 2026</b>
                </p>
                <div class="w-full h-px bg-muted mt-4" />
            </div>

            <LegalSection title="1. Agreement">
                <p>
                    By using Unbound, signing in through Unbound, or connecting
                    your app to Unbound, you agree to these Terms.
                </p>
            </LegalSection>

            <LegalSection title="2. What Unbound is">
                <p>
                    Unbound is an authentication broker that keeps sign-in
                    lightweight. It helps developers add auth without extra
                    signup or complicated setup, while users sign in with the
                    provider they choose.
                </p>
                <p>
                    After the user approves an app, Unbound issues a short-lived
                    signed identity token for that app.
                </p>
                <ul>
                    <li>
                        Supported sign-in providers: Google, GitHub, Discord.
                    </li>
                    <li>
                        Tokens are cryptographically signed and short-lived.
                    </li>
                    <li>
                        User IDs are pairwise and app-scoped, so each app gets
                        its own Unbound ID for the same user.
                    </li>
                    <li>
                        Unbound can share profile or email info only when the
                        app requests it and the user approves it.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="3. What Unbound is not">
                <ul>
                    <li>Unbound is not a user database.</li>
                    <li>Unbound is not an account recovery service.</li>
                    <li>Unbound is not a moderation, or permission system.</li>
                    <li>
                        Unbound does not decide whether a user should be allowed
                        inside your app. Your app still owns that decision.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="4. Users and app developers">
                <ul>
                    <li>
                        Users choose a provider and can allow or deny each app
                        authorization request.
                    </li>
                    <li>
                        Apps should request only the scopes they actually need.
                    </li>
                    <li>
                        Developers must validate token signatures, issuer,
                        audience, expiration, and relevant claims before
                        trusting a token.
                    </li>
                    <li>
                        Apps using Unbound are separate services. Their content,
                        security, privacy, and data handling are their own
                        responsibility.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="5. Acceptable use">
                <ul>
                    <li>
                        You must use Unbound lawfully and only for legitimate
                        authentication workflows.
                    </li>
                    <li>
                        You may not abuse, scrape, overload, interfere with, or
                        attempt to bypass Unbound security controls.
                    </li>
                    <li>
                        You may not mislead users about your app, requested
                        data, or authorization flow.
                    </li>
                    <li>
                        You may not use Unbound for spam, phishing, malware,
                        credential harvesting, or other abusive behavior.
                    </li>
                    <li>
                        You may not use Unbound to violate any third-party
                        rights, including external platform policies.
                    </li>
                </ul>
            </LegalSection>

            <LegalSection title="6. Third-party services">
                <p>
                    Unbound depends on external identity providers. Those
                    services have their own terms, policies, APIs, outages, and
                    account rules. For provider policy links, see the{" "}
                    <a href="/privacy">Privacy Policy</a>.
                </p>
            </LegalSection>

            <LegalSection title="7. Data and privacy">
                <p>
                    Your use of Unbound is also governed by the{" "}
                    <a href="/privacy">Privacy Policy</a>, which explains what
                    Unbound processes, how it is used, local encrypted cookies,
                    temporary records, and your choices.
                </p>
            </LegalSection>

            <LegalSection title="8. Stateless operation and tokens">
                <p>
                    Unbound is designed around stateless identity derivation.
                    Pairwise IDs are derived per app origin, and identity tokens
                    are short-lived and signed.
                </p>
                <p>
                    Tokens are bearer credentials. If someone gets a valid
                    token, they may be able to use it until it expires, so keep
                    tokens, codes, cookies, client credentials, signing keys,
                    and secrets safe.
                </p>
            </LegalSection>

            <LegalSection title="9. Availability and changes">
                <p>
                    Unbound is provided as-is and as-available. Features,
                    providers, scopes, token formats, expiration periods,
                    endpoints, docs, or the whole service may change, pause, or
                    stop at any time.
                </p>
                <p>
                    These Terms may also change over time. Continuing to use
                    Unbound after the effective date means you accept the latest
                    version.
                </p>
            </LegalSection>

            <LegalSection title="10. Disclaimer">
                <p>
                    Unbound is provided without promises or warranties. We do
                    not guarantee that it will always be available, error-free,
                    secure, or fit for your specific use case.
                </p>
                <p>
                    We also do not guarantee that data from identity providers
                    is always accurate, fresh, complete, or enough for your
                    legal, security, or compliance needs.
                </p>
            </LegalSection>

            <LegalSection title="11. Liability">
                <p>
                    To the fullest extent allowed by law, Unbound and its
                    maintainers are not responsible for lost profits, lost data,
                    outages, security incidents, provider failures, app misuse,
                    or other damages related to using Unbound.
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
