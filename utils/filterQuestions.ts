export const filterQuestions = (text: string) => {
  // Регулярное выражение для поиска вопросов
  const questionRegex = /[^.!?]*\?+/g;

  // Заменить все вопросы на пустую строку
  return text.replace(questionRegex, '').trim();
};
