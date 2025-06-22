export const getGreeting = (language: string, userName: string): string => {
  switch (language) {
    case 'UKRAINIAN':
      return `Вiтаю, ${userName}.`;
    case 'ENGLISH':
      return `Hello, ${userName}.`;
    default:
      return `Здравствуйте, ${userName}.`;
  }
};
