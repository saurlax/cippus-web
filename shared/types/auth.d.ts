declare module "#auth-utils" {
  interface User {
    username: string;
    admin: boolean;
  }

  interface UserSession {}

  interface SecureSessionData {}
}

export {};
