type UndefinedToNull<T> = {
  [K in keyof T]: Exclude<T[K], undefined> | null;
};

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
