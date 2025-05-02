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

  /**
   * Generates a unique terminal number based on manufacturer and device type
   * @param manufacturerCode - 2-4 character manufacturer code (e.g., 'NK')
   * @param deviceType - Device type (e.g., 'GPS', 'GLONASS')
   * @param serialLength - Length of serial number (default: 10)
   * @returns Formatted terminal number string
   */
  static generateTerminalNumber(
    deviceType: 'GPS'|'MB' = 'GPS',
    serialLength: number = 10
  ): string {
    this.validateInputs(deviceType, serialLength);

    const countryCode = 'IR'; // Fixed country code for Iran
    const serialNumber = this.generateSecureSerial(serialLength);
    const checksum = this.generateChecksum(serialNumber);

    return `${countryCode}-${deviceType}-${serialNumber}-${checksum}`;
  }

  /**
   * Generates a cryptographically secure random serial number
   * @param length - Length of the serial number
   * @returns Random serial number string
   */
  private static generateSecureSerial(length: number): string {
    const bytes = crypto.randomBytes(Math.ceil(length / 2));
    return bytes.toString('hex').slice(0, length);
  }

  /**
   * Generates a checksum for validation
   * @param input - Input string to generate checksum for
   * @returns 4-character checksum in uppercase
   */
  private static generateChecksum(input: string): string {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash.slice(0, 4).toUpperCase();
  }

  /**
   * Validates input parameters for terminal number generation
   * @throws Error if validation fails
   */
  private static validateInputs(
    deviceType: string,
    serialLength: number
  ): void {

    if (!deviceType) {
      throw new Error('Device type is required');
    }

    if (serialLength < 8 || serialLength > 20) {
      throw new Error('Serial length must be between 8 and 20');
    }
  }

  /**
   * Generates a random alphanumeric string (alternative method)
   * @param length - Length of the string to generate
   * @returns Random alphanumeric string
   */
  static generateRandomString(length: number = 12): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }

  /**
   * Validates a terminal number format
   * @param terminalNumber - Terminal number to validate
   * @returns True if format is valid
   */
  static isValidTerminalNumber(terminalNumber: string): boolean {
    const pattern = /^IR-[A-Z0-9]{2,4}-[A-Z]+-\d{8,20}-[A-F0-9]{4}$/;
    return pattern.test(terminalNumber);
  }
}