
export interface AuthStatus {
    authenticated: boolean;
    verified: boolean;
    unexisting: boolean;
}

export interface Authenticator {
    authenticate(registering?: boolean): Promise<void>;
    isAuthenticated(): Promise<AuthStatus>;
    logout(): Promise<void>;
    getUserId(): string | null;
}
