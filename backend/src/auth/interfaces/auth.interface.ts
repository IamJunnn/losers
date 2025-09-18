export interface JwtPayload {
  username: string;
  sub: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    nickname: string;
  };
}
