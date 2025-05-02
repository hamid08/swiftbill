import { SetMetadata } from "@nestjs/common";
import { DECORATOR_CONSTANT } from "../constants";

export const Display = (name: string): PropertyDecorator =>
    SetMetadata(DECORATOR_CONSTANT.KEYS.DISPLAY_NAME_KEY, name);