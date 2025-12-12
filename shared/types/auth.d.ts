declare module "#auth-utils" {
  interface User {
    username: string;
    name: string | null;
    admin: boolean;
  }

  interface UserSession {}

  interface SecureSessionData {}
}

export {};
