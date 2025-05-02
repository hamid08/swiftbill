import { TrackingModel } from '../tracking-model';

export class DeviceBrandingNameDomainUtils {
  private static readonly UNKNOWN_VALUE = '?';
  private static readonly SEPARATOR = '-';

  /**
   * Gets formatted device branding name from TrackingModel
   * @param trackingModel The tracking model instance
   * @returns Formatted "model-brand" name string
   */
  static getBrandingName(trackingModel: TrackingModel): string {
    const modelName = this.getModelIdentifier(trackingModel);
    const brandName = this.getBrandIdentifier(trackingModel);
    return this.formatBrandingName(modelName, brandName);
  }

  /**
   * Gets formatted device branding name from individual properties
   * @returns Formatted "model-brand" name string
   */
  static getBrandingNameFromProperties(
    modelCaption: string,
    modelName: string,
    brandCaption: string,
    brandName: string
  ): string {
    const modelPart = this.getFirstValidValue([modelCaption, modelName]);
    const brandPart = this.getFirstValidValue([brandCaption, brandName]);
    return this.formatBrandingName(modelPart, brandPart);
  }

  private static getModelIdentifier(trackingModel: TrackingModel): string {
    return this.getFirstValidValue([
      this.safeGet(() => trackingModel.getCaption()),
      this.safeGet(() => trackingModel.getName())
    ]);
  }

  private static getBrandIdentifier(trackingModel: TrackingModel): string {
    return this.getFirstValidValue([
      this.safeGet(() => trackingModel.getBrand()?.getCaption()),
      this.safeGet(() => trackingModel.getBrand()?.getName())
    ]);
  }

  private static formatBrandingName(part1: string, part2: string): string {
    return [part1, part2].join(this.SEPARATOR);
  }

  private static getFirstValidValue(values: (string | undefined)[]): string {
    return values.find(value => !!value)?.trim() || this.UNKNOWN_VALUE;
  }

  private static safeGet<T>(fn: () => T): T | undefined {
    try {
      return fn();
    } catch {
      return undefined;
    }
  }
}