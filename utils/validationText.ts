function trimmer(str: string) {
  if (
    str.endsWith('.') ||
    str.endsWith(',') ||
    str.endsWith('!') ||
    str.endsWith('?')
  ) {
    return str.slice(0, -1);
  }
  return str;
}

export const validateText = (
  companyData: string,
  inputString: string,
  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN' | 'ANY'
) => {
  if (language === 'ANY') {
    return false;
  }

  const companyDataLowerCase = companyData.toLowerCase();
  const words = inputString.replace(/[.,!?;:'`"@()«»…—\-/]/g, ' ').split(/\s+/);
  const russianUkrainianRegex = /^[а-яёіїєґ]+$/i;
  const englishRegex = /^[a-z]+$/i;

  const pattern =
    /((http|https):\/\/)?(www\.)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9\&\;\:\.\,\?\=\-\_\+\%\'\~\#]*)*/g;
  const links = inputString.match(pattern);

  if (links) {
    for (const link of links) {
      if (!companyDataLowerCase.includes(trimmer(link.trim().toLowerCase()))) {
        return link.toLocaleLowerCase();
      }
    }
  }

  const isProperNoun = (word: string) => word[0] === word[0].toUpperCase();
  const cleanWord = (word: string) => trimmer(word.trim());

  for (let word of words) {
    word = cleanWord(word);

    if (word.length === 0) continue;
    if (word === 'mainlink') continue;

    if (language === 'RUSSIAN' || language === 'UKRAINIAN') {
      if (!russianUkrainianRegex.test(word) && !isProperNoun(word)) {
        if (!companyDataLowerCase.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
      }
    } else if (language === 'ENGLISH') {
      if (!englishRegex.test(word) && !isProperNoun(word)) {
        if (!companyDataLowerCase.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
      }
    } else {
      return word.toLowerCase();
    }
  }

  return false;
};
