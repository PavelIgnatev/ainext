export function avgMsgCount(arrays: number[], includeLenOne = true) {
  const result = arrays.reduce(
    (acc, array) => {
      if (array > 2 || includeLenOne) {
        acc.totalMsgCount += array;
        acc.totalArraysCount++;
      }
      return acc;
    },
    { totalMsgCount: 0, totalArraysCount: 0 }
  );

  if (result.totalArraysCount === 0) {
    return 0;
  }

  return result.totalMsgCount / result.totalArraysCount;
}
