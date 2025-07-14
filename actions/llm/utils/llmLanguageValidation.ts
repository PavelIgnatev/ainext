function trimmer(str: string): string {
  return str.replace(/[^а-яёіїєґa-z]/gi, '').trim();
}

export function llmLanguageValidation(
  message: string,
  allContextData: string,
  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN'
): { isValid: boolean; error?: string } {
  const contextString =
    allContextData.toLowerCase().replace(/[^а-яёіїєґa-z]/gi, '') + ' link';
  const words = message.replace(/[.,!?;:'`"@()«»…—\-/\n]/g, ' ').split(/\s+/);
  const russianUkrainianRegex = /^[а-яёіїєґ]+$/i;
  const englishRegex = /^[a-z]+$/i;

  const cleanWord = (word: string) => trimmer(word.trim());

  const isRealProperNoun = (
    word: string,
    index: number,
    originalMessage: string
  ) => {
    if (word[0] !== word[0].toUpperCase()) return false;
    if (index === 0) return false;

    const beforeWordPattern = new RegExp(
      `[.!?:;"'«]\\s*${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i'
    );
    if (beforeWordPattern.test(originalMessage)) {
      return false;
    }

    return true;
  };

  for (let i = 0; i < words.length; i++) {
    let word = cleanWord(words[i]);

    if (word.length === 0) continue;
    if (word === 'mainlink') continue;

    const isProperNoun = isRealProperNoun(word, i, message);

    if (language === 'RUSSIAN' || language === 'UKRAINIAN') {
      if (!russianUkrainianRegex.test(word) && !isProperNoun) {
        if (!contextString.includes(word.toLowerCase())) {
          return {
            isValid: false,
            error:
              `Non-Cyrillic word found: "${word.toLowerCase()}"\n\n` +
              'REASON: English/foreign words not allowed in Russian/Ukrainian text\n' +
              'REQUIREMENT: Use only Cyrillic alphabet words or context-specific terms\n' +
              'HOW TO FIX: Replace with Cyrillic equivalent or remove if not essential',
          };
        }
      }
    } else if (language === 'ENGLISH') {
      if (!englishRegex.test(word) && !isProperNoun) {
        if (!contextString.includes(word.toLowerCase())) {
          return {
            isValid: false,
            error:
              `Non-Latin word found: "${word.toLowerCase()}"\n\n` +
              'REASON: Russian/Ukrainian/foreign words not allowed in English text\n' +
              'REQUIREMENT: Use only Latin alphabet words or context-specific terms\n' +
              'HOW TO FIX: Replace with English equivalent or remove if not essential',
          };
        }
      }
    }
  }

  return { isValid: true };
}
