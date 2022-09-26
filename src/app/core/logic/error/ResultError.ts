/**
 * Base class for errors to be used with Result.fail()
 *
 * Errors derived from this are used to indicate that a request could not be
 * performed for some reason, but no critical error occurred. Because of that,
 * they are not meant to be thrown, but instead they should be returned
 * encapsulated by Result.fail() so that the caller decides what is best to do
 * with it. Also, the message used should be user friendly, for the cases where
 * the best course of action is to present the error to the user.
 */
export abstract class ResultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
