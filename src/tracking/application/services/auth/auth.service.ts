
export const AuthService = Symbol('AuthService').valueOf();
export interface AuthService {
    getAccessToken(): Promise<string>;
}
