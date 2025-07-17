interface Validator {
  (message: string, stage?: number): { isValid: boolean; error?: string };
  validatorName?: string;
}

function validateEmptyResponse(message: string) {
  if (!message || !message.trim()) {
    return {
      isValid: false,
      error:
        'Empty response\nREASON: Response is empty or contains only whitespace\nREQUIREMENT: Response must contain meaningful text\nEXAMPLES OF INVALID INPUT: "", "   ", "\n", "\t"\nHOW TO FIX: Provide a non-empty response',
    };
  }
  return { isValid: true };
}

function validateCharacters(message: string) {
  const forbiddenPatterns = ['<', '>', '[', ']', '{', '}', 'section', 'sign'];

  const foundPatterns = forbiddenPatterns.filter((pattern) =>
    message.includes(pattern)
  );
  if (foundPatterns.length > 0) {
    return {
      isValid: false,
      error:
        `Restricted characters found: ${foundPatterns.join(', ')}\n\n` +
        'REASON: These special characters are not allowed in regular text\n' +
        'REQUIREMENT: Use only letters, numbers, basic punctuation marks and parentheses\n' +
        'EXAMPLES OF INVALID INPUT:\n' +
        '- "Hello <world>" (contains < >)\n' +
        '- "[important]" (contains square brackets)\n' +
        '- "{key: value}" (contains curly braces)\n' +
        'HOW TO FIX: Remove or replace these characters with appropriate alternatives',
    };
  }

  const allowedCharsRegex =
    /[^a-zA-Zа-яА-ЯёЁґҐєЄіІїЇ0-9.,!?"'«»\-–—−‒⸗﹣－⁻₋:;$€₽%()|\/\\\s@_\+&=]/g;
  const invalidChars = [...new Set(message.match(allowedCharsRegex) || [])];

  if (invalidChars.length > 0) {
    return {
      isValid: false,
      error:
        `Invalid characters detected: ${invalidChars.join(', ')}\n\n` +
        'ALLOWED CHARACTERS:\n' +
        '- Letters (Latin, Cyrillic): a-z, A-Z, а-я, А-Я, ёЁ, ґҐ, єЄ, іІ, їЇ\n' +
        '- Numbers: 0-9\n' +
        '- Basic punctuation: .,!?"\'«»-–—−‒⸗﹣－⁻₋:;/|\\\n' +
        '- Common symbols: $€₽%@_+&=\n' +
        '- Parentheses: ()\n' +
        '- Whitespace characters\n\n' +
        'REGEX PATTERN: /[^a-zA-Zа-яА-ЯёЁґҐєЄіІїЇ0-9.,!?"\'«»\\-–—−‒⸗﹣－⁻₋:;$€₽%()|\/\\\\s@_\\+&=]/g\n\n' +
        'HOW TO FIX: Replace these characters with allowed alternatives',
    };
  }
  return { isValid: true };
}

function validateQuestionMarkers(message: string) {
  const startMarkers = [
    'вопрос',
    'question',
    'ответ',
    'answer',
    'важно',
    'important',
    'внимание',
    'attention',
    'пример',
    'example',
    'заметка',
    'note',
    'итак',
    'so',
    'далее',
    'next',
    'замечание',
  ];

  const middleMarkers = [
    'для вас',
    'for you',
    'к вам',
    'to you',
    'на заметку',
    'to note',
    'обратите внимание',
    'pay attention',
    'один',
    'one',
    'быстрый',
    'quick',
    'короткий',
    'short',
    'простой',
    'simple',
    'важный',
    'important',
    'личный',
    'personal',
  ];

  const verbMarkers = [
    'спрошу',
    'спрашиваю',
    'asking',
    'хочу спросить',
    'want to ask',
    'могу спросить',
    'can i ask',
    'хотел спросить',
    'wanted to ask',
    'позвольте спросить',
    'let me ask',
    'поясню',
    'explain',
    'уточню',
    'clarify',
    'добавлю',
    'add',
    'отмечу',
    'note',
    'замечу',
    'remark',
    'отвечу',
  ];

  // Проверяем простые маркеры
  for (const start of [...startMarkers, ...verbMarkers]) {
    const marker = `${start}:`;
    if (message.includes(marker)) {
      const index = message.indexOf(marker);

      return {
        isValid: false,
        error:
          `Formal marker "${marker}" found at position ${index}\n` +
          'REASON: This type of formal marker breaks natural conversation flow\n' +
          'REQUIREMENT: Write in a natural, conversational style\n' +
          'HOW TO FIX: Remove the marker and rephrase the message in a more natural way',
      };
    }
  }

  // Проверяем составные маркеры
  const checkCombinedMarkers = (first: string[], second: string[]) => {
    for (const start of first) {
      for (const middle of second) {
        const combined = `${start} ${middle}:`;
        if (message.includes(combined)) {
          const index = message.indexOf(combined);

          return {
            isValid: false,
            error:
              `Formal phrase "${combined}" found at position ${index}\n` +
              'REASON: This formal introduction breaks natural conversation flow\n' +
              'REQUIREMENT: Write in a natural, conversational style\n' +
              'HOW TO FIX: Remove the formal phrase and express the same meaning naturally',
          };
        }
      }
    }
    return null;
  };

  const startMiddleError = checkCombinedMarkers(startMarkers, middleMarkers);
  if (startMiddleError) return startMiddleError;

  const verbMiddleError = checkCombinedMarkers(verbMarkers, middleMarkers);
  if (verbMiddleError) return verbMiddleError;

  const fixedPhrases = [
    'к вашему сведению:',
    'for your information:',
    'fyi:',
    'имейте в виду:',
    'keep in mind:',
    'запомните:',
    'remember:',
    'учтите:',
    'consider:',
    'между прочим:',
    'by the way:',
    'кстати:',
    'btw:',
    'nb:',
    'n.b.:',
    'nota bene:',
    'p.s.:',
    'ps:',
    'post scriptum:',
  ];

  for (const phrase of fixedPhrases) {
    if (message.includes(phrase)) {
      const index = message.indexOf(phrase);

      return {
        isValid: false,
        error:
          `Formal phrase "${phrase}" found at position ${index}\n` +
          'REASON: This type of formal marker breaks natural conversation flow\n' +
          'REQUIREMENT: Write in a natural, conversational style\n' +
          'HOW TO FIX: Remove the formal phrase and express the same meaning naturally',
      };
    }
  }

  return { isValid: true };
}

function validateHtmlTags(message: string) {
  const htmlTagRegex = /<\/?[a-z][\s\S]*?>/gi;
  const matches = message.match(htmlTagRegex);

  if (matches) {
    const uniqueTags = [...new Set(matches)];

    return {
      isValid: false,
      error:
        `HTML/XML tags found: ${uniqueTags.join(', ')}\n\n` +
        'REASON: Response must not contain any HTML-like markup\n' +
        'REQUIREMENT: Use only plain text\n' +
        'REGEX PATTERN: /<\\/?[a-z][\\s\\S]*?>/gi\n\n' +
        'EXAMPLES OF INVALID INPUT:\n' +
        '- "<b>bold text</b>"\n' +
        '- "<p>paragraph</p>"\n' +
        '- "<div>content</div>"\n' +
        '- "<br/>"\n' +
        'HOW TO FIX: Remove all HTML/XML tags and express formatting through natural language',
    };
  }

  return { isValid: true };
}

function validateIdeographicOrArabic(message: string) {
  const ideographicAndArabicRegex =
    /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

  const matches = message.match(ideographicAndArabicRegex);
  if (matches) {
    const uniqueChars = [...new Set(matches)];

    return {
      isValid: false,
      error:
        `Non-Latin/Cyrillic characters found: ${uniqueChars.join(', ')}\n\n` +
        'REASON: These characters are from unsupported writing systems\n' +
        'REQUIREMENT: Use only Latin or Cyrillic alphabets\n' +
        'UNICODE RANGES BLOCKED:\n' +
        '- Chinese: \\u4E00-\\u9FFF\n' +
        '- Japanese Hiragana: \\u3040-\\u309F\n' +
        '- Japanese Katakana: \\u30A0-\\u30FF\n' +
        '- Korean Hangul: \\uAC00-\\uD7AF\n' +
        '- Arabic: \\u0600-\\u06FF\n\n' +
        'EXAMPLES OF INVALID INPUT:\n' +
        '- "你好" (Chinese)\n' +
        '- "こんにちは" (Japanese)\n' +
        '- "안녕하세요" (Korean)\n' +
        '- "مرحبا" (Arabic)\n' +
        'HOW TO FIX: Replace these characters with appropriate Latin or Cyrillic text',
    };
  }
  return { isValid: true };
}

function validateApologies(message: string) {
  const apologyPatterns = [
    'извини',
    'извините',
    'простите',
    'sorry',
    'apologize',
    'apologies',
    'excuse',
    'pardon',
    'виноват',
    'сожале',
  ];

  for (const pattern of apologyPatterns) {
    if (message.includes(pattern)) {
      return {
        isValid: false,
        error:
          `Apology phrase found: "${pattern}"\n\n` +
          'REASON: Apologies and excuses break professional communication style\n' +
          'REQUIREMENT: Express thoughts directly without apologetic phrases\n' +
          'EXAMPLES OF INVALID INPUT:\n' +
          '- "Извините за ошибку"\n' +
          '- "Sorry about that"\n' +
          '- "Прошу прощения"\n' +
          '- "I apologize for"\n' +
          'HOW TO FIX: Remove apologies and state information directly',
      };
    }
  }

  if (/\bпрости/.test(message)) {
    return {
      isValid: false,
      error:
        `Apology phrase found: "прости"\n\n` +
        'REASON: Apologies and excuses break professional communication style\n' +
        'REQUIREMENT: Express thoughts directly without apologetic phrases\n' +
        'EXAMPLES OF INVALID INPUT:\n' +
        '- "Извините за ошибку"\n' +
        '- "Sorry about that"\n' +
        '- "Прошу прощения"\n' +
        '- "I apologize for"\n' +
        'HOW TO FIX: Remove apologies and state information directly',
    };
  }

  return { isValid: true };
}

function validateGreetings(message: string) {
  const greetings = [
    'приветствую всех участников',
    'приветствую всех вас',
    'приветствую всех',
    'приветствую, коллеги',
    'приветствую, друзья',
    'рад приветствовать',
    'рад всех видеть',
    'рад видеть всех',
    'доброе время суток',
    'рад вас видеть',
    'рад видеть',
    'рада видеть',
    'привет-привет',
    'доброго времени суток',
    'доброго времени',
    'добрейшего дня',
    'приветствую',
    'приветики',
    'доброе утро',
    'добрый вечер',
    'добрый день',
    'доброго утра',
    'доброго вечера',
    'доброго дня',
    'с добрым утречком',
    'с добрым утром',
    'с добрым днем',
    'с добрым вечером',
    'добрый полдень',
    'приветик',
    'здравствуйте',
    'здравствуй',
    'привет',
    'доброго',
  ];

  const followUpWords = [
    'уважаемые коллеги',
    'дорогие друзья',
    'господа и дамы',
    'уважаемые партнеры',
    'коллеги мои',
    'друзья мои',
    'всех вас',
    'моих коллег',
    'наших гостей',
    'дорогие',
    'уважаемые',
    'господа',
    'товарищи',
    'коллеги',
    'друзья',
    'друг',
    'тебя',
    'вас',
    'вам',
    'тебе',
    'наши',
    'дня',
    'вечера',
    'утра',
    'времени',
    'суток',
    'благодарю',
  ];

  // Проверяем составные фразы (приветствие + обращение)
  for (const greeting of greetings) {
    for (const followUp of followUpWords) {
      const combinedPhrase = `${greeting} ${followUp}`;
      if (message.includes(combinedPhrase)) {
        return {
          isValid: false,
          error:
            `Greeting phrase found: "${combinedPhrase}"\n\n` +
            'REASON: Greetings break natural conversation flow and are not allowed\n' +
            'REQUIREMENT: Start communication directly without greeting phrases\n' +
            'EXAMPLES OF INVALID INPUT:\n' +
            '- "Приветствую всех участников, уважаемые коллеги"\n' +
            '- "Доброе утро, дорогие друзья"\n' +
            '- "Здравствуйте, товарищи"\n' +
            'HOW TO FIX: Remove greeting phrases and start directly with the main message',
        };
      }
    }
  }

  // Проверяем отдельные приветствия
  for (const greeting of greetings) {
    if (message.includes(greeting)) {
      return {
        isValid: false,
        error:
          `Greeting phrase found: "${greeting}"\n\n` +
          'REASON: Greetings break natural conversation flow and are not allowed\n' +
          'REQUIREMENT: Start communication directly without greeting phrases\n' +
          'EXAMPLES OF INVALID INPUT:\n' +
          '- "Привет! Как дела?"\n' +
          '- "Приветствую всех участников"\n' +
          '- "Доброе утро"\n' +
          '- "Здравствуйте, хочу сказать..."\n' +
          'HOW TO FIX: Remove greeting phrases and start directly with the main message',
      };
    }
  }

  return { isValid: true };
}

function validateLength(message: string, stage?: number) {
  if (typeof stage !== 'number') {
    return { isValid: true };
  }

  if (stage === 1 || stage === 2) {
    const length = message.length;
    const MIN_LENGTH = 130;
    const MAX_LENGTH = 450;

    if (length < MIN_LENGTH) {
      return {
        isValid: false,
        error:
          'Message too short: minimum 200 characters\n\n' +
          'REASON: Message does not meet minimum length requirement\n' +
          'REQUIREMENT: Message must be at least 200 characters long\n' +
          'HOW TO FIX: Expand the message with more meaningful content while maintaining natural flow',
      };
    }

    if (length > MAX_LENGTH) {
      return {
        isValid: false,
        error:
          `Message too long: maximum 450 characters\n\n` +
          'REASON: Message exceeds maximum length limit\n' +
          'REQUIREMENT: Message must not exceed 450 characters\n' +
          'HOW TO FIX: Make the message more concise while preserving key information',
      };
    }
  }

  return { isValid: true };
}

export const DEFAULT_VALIDATION_RULES: Validator[] = [
  validateEmptyResponse,
  validateLength,
  validateCharacters,
  validateHtmlTags,
  validateIdeographicOrArabic,
  validateGreetings,
  validateQuestionMarkers,
  validateApologies,
];

export function llmDefaultValidation(message: string, stage?: number) {
  for (const validation of DEFAULT_VALIDATION_RULES) {
    const result = validation(message.toLowerCase(), stage);
    if (!result.isValid) {
      throw new Error(result.error);
    }
  }
}

export function getValidationRules(): string {
  return `[CONTENT_REQUIREMENTS]
    - Message must not be empty
    - Message must contain meaningful text
    - First message must be 200-450 characters long
    - Messages shorter than 200 characters will be rejected (first message only)
    - Messages longer than 450 characters will be rejected (first message only)
  [/CONTENT_REQUIREMENTS]

  [LANGUAGE_REQUIREMENTS]
    - ** STRICTLY follow the language specified in [LANGUAGE] tag **
    - ** NO mixing of languages unless explicitly allowed **
    - ** Messages in incorrect language will be rejected **
  [/LANGUAGE_REQUIREMENTS]

  [ALLOWED_CHARACTERS]
    - Letters: Latin (a-z, A-Z), Cyrillic (а-я, А-Я, ёЁ, ґҐ, єЄ, іІ, їЇ)
    - Numbers: 0-9
    - Basic punctuation: . , ! ? " ' « » - – — − ‒ ⸗ ﹣ － ⁻ ₋ : ; / | \
    - Currency and special: $ € ₽ % @ _ + & =
    - Parentheses: ( )
    - Regular spaces
  [/ALLOWED_CHARACTERS]

  [FORBIDDEN_CHARACTERS]
    ** CRITICAL: ANY MESSAGE CONTAINING THESE CHARACTERS WILL BE REJECTED **
    ** ABSOLUTELY FORBIDDEN: < > [ ] { } **
    ** THESE CHARACTERS ARE NEVER ALLOWED: < > [ ] { } **
    ** AUTOMATIC REJECTION IF FOUND: < > [ ] { } **
  [/FORBIDDEN_CHARACTERS]

  [CONVERSATION_STYLE]
    - Write in natural, conversational style
    - No formal markers or introductions
    - No service phrases or postscripts
    - No apologies or excuses
    - No greeting phrases whatsoever
    
    FORBIDDEN MARKERS:
    - Question/answer markers (вопрос:, question:, ответ:, answer:)
    - Attention markers (важно:, important:, внимание:, attention:)
    - Note markers (заметка:, note:, пример:, example:)
    - Service phrases (fyi:, nb:, p.s.:, btw:)
    - Formal introductions (для вас:, for you:, к вам:, to you:)
    - Apology phrases (извините, sorry, apologize, прошу прощения)
    - Greeting phrases (привет, hello, добрый день, good morning, здравствуйте, hi, hey, как дела, how are you)
  [/CONVERSATION_STYLE]

  [TEXT_FORMAT]
    - Use only plain text
    - No HTML or XML markup
    - No special formatting
    - Express formatting through natural language
  [/TEXT_FORMAT]

  [WRITING_SYSTEM]
    - Use only Latin or Cyrillic alphabets
    - No ideographic characters (Chinese, Japanese)
    - No Arabic script
    - No other non-Latin/non-Cyrillic writing systems
  [/WRITING_SYSTEM]`;
}
