import { notification } from 'antd';

export function validateField(
  value: string | undefined | null,
  fieldName: string,
  pattern: RegExp,
  errorMessage: string
): boolean {
  if (!value) return true;
  if (pattern.test(value)) {
    notification.error({
      message: `Ошибка в поле "${fieldName}"`,
      description: errorMessage,
    });
    return false;
  }
  return true;
}
