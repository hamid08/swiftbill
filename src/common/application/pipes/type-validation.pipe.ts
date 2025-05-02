import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TypeTrackingDataValidationPipe implements PipeTransform {
  private readonly validTypes = ['device', 'vehicle'] as const;

  transform(value: any): 'device' | 'vehicle' {
    // Check if value exists
    if (value === undefined || value === null) {
      throw new BadRequestException('Type parameter is required');
    }

    // Convert to lowercase if it's a string
    const normalizedValue = typeof value === 'string' ? value.toLowerCase() : value;

    // Validate against allowed types
    if (!this.validTypes.includes(normalizedValue)) {
      throw new BadRequestException(
        `Invalid type '${value}'. Must be one of: ${this.validTypes.join(', ')}`
      );
    }

    return normalizedValue;
  }
}