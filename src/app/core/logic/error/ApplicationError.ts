/**
 * Base class for all errors thrown by application code
 *
 * For taxonomy purposes, application code should always throw a class derived
 * from this, when necessary.
 */
export abstract class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
