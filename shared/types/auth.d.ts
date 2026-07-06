declare module "#auth-utils" {
  interface User {
    id: number;
    username: string;
    name: string | null;
    admin: boolean;
  }

  interface UserSession {}

  interface SecureSessionData {}
}

export {};
