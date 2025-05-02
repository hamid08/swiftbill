export abstract class ValueObject {
  private id?: number; // Optional ID for value objects

  public getId(): number | undefined {
      return this.id;
  }

  public setId(value: number): void {
      this.id = value;
  }

  public equals(other: ValueObject): boolean {
      if (this === other) {
          return true;
      }

      if (other === null || other === undefined || !(other instanceof ValueObject)) {
          return false;
      }

      const thisProps = Object.getOwnPropertyNames(this);
      const otherProps = Object.getOwnPropertyNames(other);

      if (thisProps.length !== otherProps.length) {
          return false;
      }

      for (let i = 0; i < thisProps.length; i++) {
          const propName = thisProps[i];
          if (this[propName] !== other[propName]) {
              return false;
          }
      }

      return true;
  }

  public toString(): string {
      return JSON.stringify(this);
  }

  public toObject(): object {
      return { ...this };
  }
}