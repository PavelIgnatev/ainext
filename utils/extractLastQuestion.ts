export const extractLastQuestion = (str: string) => {
  const matches = str.match(/[^.?!]*\?/g);
  if (!matches) return null;

  const lastQuestion = matches[matches.length - 1].trim();

  const lastQuestionMarkIndex = str.lastIndexOf('?');

  const restOfString = str.slice(lastQuestionMarkIndex + 1);
  if (restOfString.trim().length === 0) {
    return lastQuestion;
  } else {
    return null;
  }
};
