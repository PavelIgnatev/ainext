/**
 * Возвращает текущую дату и время в формате строки для российской локали
 * @returns Строка с текущей датой и временем в формате "день месяц год, часы:минуты"
 */
export const llmDateNow = (): string => {
  return new Date().toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
