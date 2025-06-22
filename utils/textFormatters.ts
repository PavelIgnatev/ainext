/**
 * Утилиты для форматирования текста
 */

/**
 * Убирает лишние пробелы из строки
 */
export function reduceSpaces(string: string): string {
  return string.replace(/\s+/g, ' ').trim();
}

/**
 * Делает первую букву строки заглавной
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Форматирует текст сообщения: убирает лишние пробелы и делает первую букву заглавной
 */
export function formatMessageText(text: string): string {
  return capitalizeFirstLetter(reduceSpaces(text));
}
