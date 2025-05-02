import { ObjectId } from 'mongodb';
import * as crypto from 'crypto';

export class GeneratorUtils {
  /**
   * Generates a new MongoDB ObjectId and returns it as a hex string
   * @returns Hexadecimal string representation of ObjectId
   */
  static generateObjectId(): string {
    return new ObjectId().toHexString();
  }
}