/**
 * Custom error classes for FuelEU Maritime domain
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BankingError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'BankingError';
  }
}

export class PoolingError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'PoolingError';
  }
}

export class ComplianceError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ComplianceError';
  }
}
