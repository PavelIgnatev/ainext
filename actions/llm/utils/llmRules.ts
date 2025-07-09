type Language = 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';

function trimmer(str: string): string {
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

function containsIdeographicOrArabic(str: string): boolean {
  const ideographicAndArabicRegex =
    /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return ideographicAndArabicRegex.test(str);
}

function countSentences(paragraph: string): number {
  const sentenceEnders = ['.', '!', '?'];
  let sentenceCount = 0;

  for (let i = 0; i < paragraph.length; i++) {
    if (sentenceEnders.includes(paragraph[i])) {
      sentenceCount++;
    }
  }

  return sentenceCount;
}

function validateText(
  companyData: string,
  inputString: string,
  language: Language
): string | null {
  const companyDataLowerCase = companyData.toLowerCase();
  const words = inputString.replace(/[.,!?;:'`"@()«»…—\-/]/g, ' ').split(/\s+/);
  const russianUkrainianRegex = /^[а-яёіїєґ]+$/i;
  const englishRegex = /^[a-z]+$/i;

  const pattern =
    /((http|https):\/\/)?(www\.)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,2000}(\/[a-zA-Z0-9\&\;\:\.\,\?\=\-\_\+\%\'\~\#]*)*/g;
  const links = inputString.match(pattern);

  if (links) {
    for (const link of links) {
      if (!companyDataLowerCase.includes(trimmer(link.trim().toLowerCase()))) {
        return link.toLowerCase();
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

  return null;
}

export function checkSuspiciousCharacters(message: string): string | null {
  if (
    message.includes('[') ||
    message.includes(']') ||
    message.includes('{') ||
    message.includes('}') ||
    message.includes('<') ||
    message.includes('>') ||
    message.includes('section') ||
    message.includes('sign')
  ) {
    return 'The response should not contain suspicious characters [],{},<>, the word "section" or "sign"';
  }
  return null;
}

export function checkArabicCharacters(message: string): string | null {
  if (containsIdeographicOrArabic(message)) {
    return 'The answer must not contain Arabic characters or any hieroglyphics';
  }
  return null;
}

export function checkForbiddenLinks(
  message: string,
  disableLink: boolean
): string | null {
  if (!disableLink) return null;

  const pattern =
    /((http|https):\/\/)?(www\.)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,2000}(\/[a-zA-Z0-9\&\;\:\.\,\?\=\-\_\+\%\'\~\#]*)*/g;
  const hasTextLink = message.match(pattern);

  if (hasTextLink) {
    return 'The reply should not contain any references at this stage';
  }
  return null;
}

export function checkForbiddenWords(
  message: string,
  companyData: string,
  language: Language
): string | null {
  const forbiddenWord = validateText(companyData, message, language);
  if (forbiddenWord) {
    return `The word ${forbiddenWord} is not allowed in reply, its use is prohibited`;
  }
  return null;
}

export function checkMandatoryQuestion(
  message: string,
  mandatoryQuestion: boolean
): string | null {
  if (mandatoryQuestion && !message.includes('?')) {
    return 'The question in the reply is mandatory. Add a question at the end of the line.';
  }
  return null;
}

export function checkMinimalLength(
  message: string,
  mandatoryQuestion: boolean,
  minimalCharacterLength: number
): string | null {
  if (mandatoryQuestion && message.length < minimalCharacterLength) {
    return `Minimum reply length ${minimalCharacterLength} characters`;
  }
  return null;
}

export function checkMinimalSentences(
  message: string,
  minimalProposalLength: number
): string | null {
  if (minimalProposalLength > countSentences(message)) {
    return `The minimum number of sentences is ${minimalProposalLength}`;
  }
  return null;
}

export function checkRequiredPart(
  message: string,
  part: string | null
): string | null {
  if (part && !message.includes('mainlink')) {
    return `The response does not contain the unique "${part}" part, even though it should contain`;
  }
  return null;
}
