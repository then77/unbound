/**
 * OpenID Configuration Spec Type
 */

export type SubjectType = "public" | "pairwise";

export type ResponseType = "code" | "id_token" | "token";

export type GrantType =
    | "authorization_code"
    | "implicit"
    | "refresh_token"
    | "client_credentials";

export type CodeChallengeMethod = "S256" | "plain";

export type ClientAuthMethod =
    | "client_secret_basic"
    | "client_secret_post"
    | "client_secret_jwt"
    | "private_key_jwt"
    | "none";

export type PromptValue =
    | "none"
    | "login"
    | "consent"
    | "select_account";

export type SigningAlgorithm =
    | "RS256"
    | "RS384"
    | "RS512"
    | "PS256"
    | "PS384"
    | "PS512"
    | "ES256"
    | "ES384"
    | "ES512"
    | "EdDSA"
    | "HS256"
    | "HS384"
    | "HS512";

export interface OpenIDConfiguration {
    issuer: string;

    authorization_endpoint: string;

    jwks_uri: string;

    response_types_supported: ResponseType[];

    subject_types_supported: SubjectType[];

    id_token_signing_alg_values_supported: SigningAlgorithm[];

    token_endpoint?: string;

    userinfo_endpoint?: string;

    registration_endpoint?: string;

    scopes_supported?: string[];

    claims_supported?: string[];

    prompt_values_supported?: PromptValue[];

    grant_types_supported?: GrantType[];

    token_endpoint_auth_methods_supported?: ClientAuthMethod[];

    token_endpoint_auth_signing_alg_values_supported?: SigningAlgorithm[];

    code_challenge_methods_supported?: CodeChallengeMethod[];

    userinfo_signing_alg_values_supported?: SigningAlgorithm[];

    userinfo_encryption_alg_values_supported?: string[];

    userinfo_encryption_enc_values_supported?: string[];

    id_token_encryption_alg_values_supported?: string[];

    id_token_encryption_enc_values_supported?: string[];

    request_object_signing_alg_values_supported?: SigningAlgorithm[];

    request_object_encryption_alg_values_supported?: string[];

    request_object_encryption_enc_values_supported?: string[];

    request_parameter_supported?: boolean;

    request_uri_parameter_supported?: boolean;

    require_request_uri_registration?: boolean;

    check_session_iframe?: string;

    end_session_endpoint?: string;

    frontchannel_logout_supported?: boolean;

    frontchannel_logout_session_supported?: boolean;

    backchannel_logout_supported?: boolean;

    backchannel_logout_session_supported?: boolean;

    revocation_endpoint?: string;

    revocation_endpoint_auth_methods_supported?: ClientAuthMethod[];

    revocation_endpoint_auth_signing_alg_values_supported?: SigningAlgorithm[];

    introspection_endpoint?: string;

    introspection_endpoint_auth_methods_supported?: ClientAuthMethod[];

    introspection_endpoint_auth_signing_alg_values_supported?: SigningAlgorithm[];

    device_authorization_endpoint?: string;

    pushed_authorization_request_endpoint?: string;

    require_pushed_authorization_requests?: boolean;

    service_documentation?: string;

    op_policy_uri?: string;

    op_tos_uri?: string;

    claims_parameter_supported?: boolean;

    authorization_response_iss_parameter_supported?: boolean;

    tls_client_certificate_bound_access_tokens?: boolean;

    [key: string]: unknown;
}
