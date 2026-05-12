import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (
    data: string | undefined,
    context: ExecutionContext,
  ) => {
    const request = context
      .switchToHttp()
      .getRequest();

    const user = request.user;

    if (!user) {
      return null;
    }

    const normalizedUser = {
      ...user,
      id:
        user.id ||
        user.userId ||
        user.sub,
    };

    return data
      ? normalizedUser[data]
      : normalizedUser;
  },
);