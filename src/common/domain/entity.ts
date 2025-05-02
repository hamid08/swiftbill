export abstract class Entity<T extends number | string = number> {
  public id: T;
  public concurrencySafeVersion: number = 1;

  public setId(value: T): void {
    this.id = value;
  }

  public getId(): T {
    return this.id;
  }

  public equals(entity: Entity<T>): boolean {
    if (this === entity) {
      return true;
    }
    if (entity instanceof Entity && this.id === entity.id) {
      return true;
    }
    return false;
  }
}