import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean as OriginalIsBoolean } from 'class-validator';

export function IsBoolean() {
  return applyDecorators(ToBoolean(), OriginalIsBoolean());
}

function ToBoolean() {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    },
  );
  const toClass = (target: any, key: string | symbol) => {
    return Transform(
      ({ obj }) => {
        // Expose로 인해서 target의 키값은 snake_case로 변환되어있을 수 있음
        return valueToBoolean(
          obj[
            String(key)
              .replace(/(([A-Z]|[0-9]{1,4}))/g, '_$1')
              .toLowerCase()
          ],
        );
      },
      {
        toClassOnly: true,
      },
    )(target, key);
  };
  return function (target: any, key: string | symbol) {
    toPlain(target, key);
    toClass(target, key);
  };
}

function valueToBoolean(value: any) {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (['true', '1'].includes(value.toLowerCase())) {
    return true;
  }
  if (['false', '0'].includes(value.toLowerCase())) {
    return false;
  }
  return value;
}
