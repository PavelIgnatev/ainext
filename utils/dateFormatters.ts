/**
 * Утилиты для форматирования дат
 */

/**
 * Форматирует timestamp в читаемый формат даты и времени
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);

  return `${date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })}, ${date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`;
}

/**
 * Форматирует timestamp в короткий формат времени
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Форматирует timestamp в короткий формат даты
 */
export function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
