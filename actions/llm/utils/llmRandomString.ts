/**
 * Генерирует случайную строку на основе шаблона с переменными в фигурных скобках
 * @param template - Шаблон строки с переменными в формате {option1|option2|option3}
 * @returns Строка с случайно выбранными значениями из переменных
 */
export const llmRandomString = (template: string): string => {
  const regex = /{(.*?)}/g;
  const cleanedTemplate = template.replace(/\n/g, '').replace(/\s{2,}/g, ' ');

  return cleanedTemplate
    .replace(regex, (match, group) => {
      const options = group.split('|');
      const randomIndex = Math.floor(Math.random() * options.length);
      return options[randomIndex];
    })
    .trim();
};
