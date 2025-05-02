import { SetMetadata } from '@nestjs/common';
import { DECORATOR_CONSTANT } from '../constants';
import { Permission } from '../guards';

export const AuthorizedPermissions = (permissions: Permission[]) =>
  SetMetadata(DECORATOR_CONSTANT.KEYS.AUTHORIZED_PERMISSION_KEY, permissions);
