export class AccessTokenService {
  private static tokenKey: string = "accessToken";

  static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Optional: A method to validate the token if needed
  // This could involve decoding the token and checking its expiry, for example
  static isValidToken(): boolean {
    const token = AccessTokenService.getToken();
    if (!token) {
      return false;
    }
    // Add logic to validate the token
    // This could include decoding the JWT and checking the expiry date
    // Note: This will not verify the token's authenticity; that must be done server-side
    return true;
  }
}
