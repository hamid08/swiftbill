import { Reflector } from '@nestjs/core';
export class ReflectorUtils {

    static isFieldIgnored(
        reflector: Reflector,
        dto: any,
        propertyKey: string,
        metadataKey: string,
    ): boolean {
        return reflector.get<boolean>(metadataKey, dto.prototype[propertyKey]) === true;
    }
}
