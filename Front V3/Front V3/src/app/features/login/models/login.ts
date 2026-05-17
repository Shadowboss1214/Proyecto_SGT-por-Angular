/** Contract between the login form and AuthService.login(). */
export interface LoginRequest {
  /** OAuth2 username credential. */
  username: string;
  /** Plaintext password; transmitted only over HTTPS to the OAuth2 endpoint. */
  password: string;
}

/** Shape of the OAuth2 Password Grant response from the Laminas backend. */
export interface TokenResponse {
  /** JWT bearer token to include in every subsequent API request. */
  access_token: string;
  /** Always "Bearer" for this grant type. */
  token_type: string;
  /** Employee role ("ADMIN" or "DRIVER") — extended field added by the backend, not standard OAuth2. */
  role: string;
  /** Token lifetime in seconds from issuance; use with `iat` or current time to compute expiry. */
  expires_in: number;
  /** Optional refresh token; present only when the OAuth2 server is configured to issue one. */
  refresh_token?: string;
}
