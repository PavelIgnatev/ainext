type UndefinedToNull<T> = {
  [K in keyof T]: Exclude<T[K], undefined> | null;
};

/**
 * Преобразует все undefined значения в объекте в null
 * @param obj - объект для обработки
 * @returns объект с null вместо undefined
 */
export function convertUndefinedToNull<T extends Record<string, any>>(
  obj: T
): UndefinedToNull<T> {
  const result = {} as UndefinedToNull<T>;
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    (result as any)[key] = value === undefined ? null : value;
  });
  return result;
}
