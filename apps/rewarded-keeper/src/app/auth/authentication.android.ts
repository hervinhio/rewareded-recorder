import { Authenticator, AuthStatus } from "./authenticator";

export class AndroidAuthenticator implements Authenticator{
    logout(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    authenticate(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    isAuthenticated(): Promise<AuthStatus> {
        throw new Error("Method not implemented.");
    }

    getUserId(): string | null {
        throw new Error("Method not implemented.");
    }
}