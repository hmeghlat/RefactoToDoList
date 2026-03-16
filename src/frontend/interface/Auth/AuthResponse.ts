export interface AuthResponse {
    token: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}