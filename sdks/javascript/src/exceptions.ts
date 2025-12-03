/**
 * Guardian API Exceptions
 */

export class GuardianAPIException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianAPIException';
    Object.setPrototypeOf(this, GuardianAPIException.prototype);
  }
}

export class GuardianAPIError extends GuardianAPIException {
  public statusCode?: number;
  public response?: any;

  constructor(message: string, statusCode?: number, response?: any) {
    super(message);
    this.name = 'GuardianAPIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, GuardianAPIError.prototype);
  }
}

