declare module "#auth-utils" {
  interface User {
    id: number;
    username: string;
    name: string | null;
    // 兼容加字段之前签发的旧会话 cookie，可能没有该字段
    avatar?: string | null;
    admin: boolean;
  }

  interface UserSession {}

  interface SecureSessionData {}
}

export {};
