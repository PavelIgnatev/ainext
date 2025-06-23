import { z } from 'zod';
import type { GroupId } from '@/@types/GroupId';

const GroupIdSchema = z.object({
  groupId: z.string().min(1),
  name: z.string().min(1),
  target: z.number().min(0),
  currentCount: z.number().min(0),
  messagesCount: z.number().min(1),
  aiRole: z.string().min(1),
  companyDescription: z.string().min(1),
  goal: z.string().min(1),
  firstMessagePrompt: z.string().min(1),
  secondMessagePrompt: z.string().min(1),
  language: z.enum(['ENGLISH', 'RUSSIAN', 'UKRAINIAN']),
  leadDefinition: z.string().min(1),
  leadTargetAction: z.string().min(1),
  part: z.string().nullable(),
  flowHandling: z.string().nullable(),
  addedInformation: z.string().nullable(),
  addedQuestion: z.string().nullable(),
});

const VALIDATION_PATTERNS = {
  FORBIDDEN_BASIC_SYMBOLS: /[?!]/,
  FORBIDDEN_QUESTION_SYMBOLS: /[!.:]/,
  FORBIDDEN_GREETING_SYMBOLS: /[?:]/,
  FORBIDDEN_PART_ENDINGS: ['.', '?', ',', '!'],
  USERNAME_PATTERN: /^[a-zA-Z0-9_+]+$/,
} as const;

const FIELD_NAMES: Record<string, string> = {
  groupId: 'Идентификатор',
  name: 'Название',
  target: 'Целевое значение отправок',
  currentCount: 'Текущее значение отправок',
  messagesCount: 'Количество сообщений',
  aiRole: 'Роль AI менеджера',
  companyDescription: 'Описание компании',
  goal: 'Целевое действие',
  firstMessagePrompt: 'Первое приветствие',
  secondMessagePrompt: 'Первый вопрос',
  language: 'Язык',
  leadDefinition: 'Критерии лида',
  leadTargetAction: 'Целевое действие при статусе лид',
  part: 'Уникальная часть',
  flowHandling: 'Обработка сценариев',
  addedInformation: 'Дополнительная информация',
  addedQuestion: 'Дополнительный вопрос',
  dateUpdated: 'Дата обновления',
};

const VALIDATION_MESSAGES = {
  FORBIDDEN_BASIC_SYMBOLS: 'Поле содержит недопустимые символы: ? или !',
  FORBIDDEN_QUESTION_SYMBOLS: 'Поле содержит недопустимые символы: !, : или .',
  FORBIDDEN_GREETING_SYMBOLS: 'Поле содержит недопустимые символы: ? или :',
  FORBIDDEN_PART_ENDINGS:
    'Значение не должно заканчиваться на ".", "?", "," или "!"',
  MISSING_QUESTION_MARK: 'Добавьте знак "?" в следующих вопросах',
  PART_NOT_IN_GOAL: 'Значение не найдено внутри поля "Целевое действие"',
  INVALID_USERNAME:
    'Некорректные юзернеймы. Проверьте, что в юзернеймах содержатся только английские буквы, цифры или символ подчеркивания (_)',
  INVALID_LANGUAGE: 'Выберите корректный язык: ENGLISH, RUSSIAN или UKRAINIAN',
  INVALID_NUMERIC: 'Следующие поля должны быть положительными числами',
  TARGET_LESS_THAN_CURRENT:
    'Целевое значение не может быть меньше текущего значения отправок',
  REQUIRED_FIELD: 'Обязательное поле!',
} as const;

const EXCLUDED_GROUP_IDS = [
  '13529023516',
  '15141603549-prefix-ukraine-documents',
];

const checkRandomString = (template: string, fieldName?: string): void => {
  if (!template) return;

  const fieldPrefix = fieldName ? `[${fieldName}] ` : '';

  let lastIndex = 0;
  const regex = /{([^{}]*)}/g;
  let match;
  let openBraces = 0;
  let totalCombinations = 1;

  for (let i = 0; i < template.length; i++) {
    if (template[i] === '{') {
      openBraces++;
    } else if (template[i] === '}') {
      openBraces--;
    }
    if (openBraces < 0) {
      throw new Error(
        `${fieldPrefix}Некорректная часть строки: отсутствуют открывающие '{' или закрывающие '}' скобки.`
      );
    }
  }

  if (openBraces !== 0) {
    throw new Error(
      `${fieldPrefix}Некорректная часть строки: отсутствуют открывающие '{' или закрывающие '}' скобки.`
    );
  }

  const regexBetweenBraces = /}(.*?)\{/g;
  let matchBetweenBraces;

  while ((matchBetweenBraces = regexBetweenBraces.exec(template)) !== null) {
    const braces = matchBetweenBraces[1].replace(/[.,?!;()]/g, ' ').trim();
    const wBraces = braces.replace(/ /g, '');

    if (wBraces.length > 10) {
      throw new Error(
        `${fieldPrefix}Часть строки "${braces}" длиной ${wBraces.length}, хотя максимальная свободная длина - 10.`
      );
    }
  }

  const optionsLengthArray: any = [];

  while ((match = regex.exec(template)) !== null) {
    const braces = template
      .substring(lastIndex, match.index)
      .replace(/[.,?!;()]/g, ' ')
      .trim();
    const wBraces = braces.replace(/ /g, '');

    if (wBraces.length > 10) {
      throw new Error(
        `${fieldPrefix}Часть строки "${braces}" длиной ${wBraces.length}, хотя максимальная свободная длина - 10.`
      );
    }

    lastIndex = regex.lastIndex;

    const content = match[1].trim();
    const options = content
      .split('|')
      .map((option) =>
        option
          .trim()
          .toLowerCase()
          .replace(/[-—]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      );

    const emptyOptions = options.filter((option) => option === '');
    if (emptyOptions.length > 0) {
      throw new Error(
        `${fieldPrefix}Часть строки {${content}} содержит пустые значения между |, что недопустимо.`
      );
    }

    if (!/^[a-zA-Zа-яА-ЯёЁґҐєЄіІїЇ0-9(),|'"\-\s%]+$/.test(content)) {
      throw new Error(
        `${fieldPrefix}Часть строки {${content}} содержит некорректные спец-символы. Разрешенные: (),'-"%`
      );
    }

    const optionCount: Record<string, number> = {};
    const tooLongOptions: string[] = [];
    options.forEach((option) => {
      optionCount[option] = (optionCount[option] || 0) + 1;
      if (option.length > 22) {
        tooLongOptions.push(option);
      }
    });

    if (tooLongOptions.length > 0) {
      throw new Error(
        `${fieldPrefix}Часть строки {${content}} содержит варианты, превышающие максимальную длину в 22 символа: ${tooLongOptions.join(
          ', '
        )}.`
      );
    }

    const duplicates = Object.keys(optionCount).filter(
      (option) => optionCount[option] > 1
    );
    if (duplicates.length > 0) {
      throw new Error(
        `${fieldPrefix}Часть строки {${content}} содержит повторяющиеся элементы: ${duplicates.join(
          ', '
        )}.`
      );
    }

    const firstWords: Record<string, string[]> = {};
    const lastWords: Record<string, string[]> = {};

    options.forEach((option) => {
      const words = option.split(/\s+/);
      const firstWord = words[0];
      const secondWord = words[1] || '';
      const lastWord = words[words.length - 1];

      const combinedFirstWord =
        firstWord.length < 5 && secondWord
          ? `${firstWord} ${secondWord}`
          : firstWord;

      firstWords[combinedFirstWord] = firstWords[combinedFirstWord] || [];
      firstWords[combinedFirstWord].push(option);

      lastWords[lastWord] = lastWords[lastWord] || [];
      lastWords[lastWord].push(option);
    });

    const checkDuplicates = (
      wordsMap: Record<string, string[]>,
      label: string
    ) => {
      const duplicates = Object.keys(wordsMap).filter(
        (word) => wordsMap[word].length > 1
      );
      return duplicates.length > 0
        ? `${label}:\n${duplicates
            .map((word) => `${word} (${wordsMap[word].join(', ')})`)
            .join('\n')}`
        : null;
    };

    const firstWordsDupes = checkDuplicates(
      firstWords,
      '\nДУБЛИ ПО ПЕРВОМУ ВХОЖДЕНИЮ'
    );
    const lastWordsDupes = checkDuplicates(
      lastWords,
      '\nДУБЛИ ПО ПОСЛЕДНЕМУ ВХОЖДЕНИЮ'
    );

    if (firstWordsDupes || lastWordsDupes) {
      throw new Error(
        `${fieldPrefix}Часть строки {${content}} содержит дублирующие элементы.\n${[
          firstWordsDupes,
          lastWordsDupes,
        ]
          .filter(Boolean)
          .join('\n')}`
      );
    }

    if (options.length < 3) {
      throw new Error(
        `${fieldPrefix}Часть строки {${content}} содержит недостаточное количество уникальных вариантов. Минимальное требование - 3.`
      );
    }

    totalCombinations *= options.length;
    optionsLengthArray.push([options]);
  }

  const remainingText = template.substring(lastIndex).trim();
  const braces = remainingText.replace(/[.,?!;()]/g, ' ').trim();
  const wBraces = braces.replace(/ /g, '');

  if (wBraces.length > 10) {
    throw new Error(
      `${fieldPrefix}Часть строки "${braces}" длиной ${wBraces.length}, хотя максимальная свободная длина - 10.`
    );
  }

  for (let i = 0; i < optionsLengthArray.length - 1; i++) {
    const currentCount = optionsLengthArray[i][0].length;
    const nextCount = optionsLengthArray[i + 1][0].length;

    if (currentCount * nextCount < 18) {
      throw new Error(
        `${fieldPrefix}Коэффициенты для элементов в скобках не соответствуют требованиям: {${optionsLengthArray[
          i
        ][0].join('|')}}  * {${optionsLengthArray[i + 1][0].join(
          '|'
        )}} = ${currentCount} * ${nextCount} = ${
          currentCount * nextCount
        }. Минимальное количество - 18.`
      );
    }
  }

  if (totalCombinations < 1000) {
    throw new Error(
      `${fieldPrefix}Количество уникальных генераций - ${totalCombinations}, минимальный порог - 1000.`
    );
  }
};

function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((err) => {
      const fieldName =
        FIELD_NAMES[err.path[0] as string] || err.path.join('.');

      switch (err.code) {
        case 'invalid_type':
          if (err.received === 'undefined') {
            return `${fieldName}: Обязательное поле`;
          }
          return `${fieldName}: Некорректный тип данных`;
        case 'too_small':
          if (err.type === 'string') {
            return `${fieldName}: Поле не может быть пустым`;
          }
          return `${fieldName}: Значение слишком маленькое`;
        case 'invalid_enum_value':
          return `${fieldName}: Недопустимое значение`;
        default:
          return `${fieldName}: ${err.message}`;
      }
    })
    .join(', ');
}

function validateField(
  value: string | undefined | null,
  fieldName: string,
  pattern: RegExp,
  errorMessage: string
): void {
  if (!value) return;
  if (pattern.test(value)) {
    throw new Error(`Ошибка в поле "${fieldName}": ${errorMessage}`);
  }
}

function validateGroupIdFields(data: GroupId): void {
  const {
    aiRole,
    goal,
    companyDescription,
    firstMessagePrompt,
    secondMessagePrompt,
    addedQuestion,
    leadDefinition,
    leadTargetAction,
  } = data;

  const fieldValidations = [
    {
      value: aiRole,
      name: 'Роль AI менеджера',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_BASIC_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_BASIC_SYMBOLS,
    },
    {
      value: goal,
      name: 'Целевое действие',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_BASIC_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_BASIC_SYMBOLS,
    },
    {
      value: companyDescription,
      name: 'Описание компании',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_BASIC_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_BASIC_SYMBOLS,
    },
    {
      value: leadDefinition,
      name: 'Критерии лида',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_BASIC_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_BASIC_SYMBOLS,
    },
    {
      value: leadTargetAction,
      name: 'Целевое действие при статусе лид',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_BASIC_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_BASIC_SYMBOLS,
    },
    {
      value: firstMessagePrompt,
      name: 'Первое приветствие',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_GREETING_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_GREETING_SYMBOLS,
    },
    {
      value: secondMessagePrompt,
      name: 'Первый вопрос',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_QUESTION_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_QUESTION_SYMBOLS,
    },
    {
      value: addedQuestion,
      name: 'Дополнительный вопрос',
      pattern: VALIDATION_PATTERNS.FORBIDDEN_QUESTION_SYMBOLS,
      message: VALIDATION_MESSAGES.FORBIDDEN_QUESTION_SYMBOLS,
    },
  ];

  for (const validation of fieldValidations) {
    validateField(
      validation.value,
      validation.name,
      validation.pattern,
      validation.message
    );
  }
}

function validateQuestionMarks(
  secondMessagePrompt: string,
  addedQuestion?: string | null
): void {
  const questions = [
    { value: secondMessagePrompt, name: 'Первый вопрос' },
    ...(addedQuestion
      ? [{ value: addedQuestion, name: 'Дополнительный вопрос' }]
      : []),
  ];

  const questionsWithoutMark = questions
    .filter(({ value }) => value && !value.includes('?'))
    .map(({ name }) => name);

  if (questionsWithoutMark.length > 0) {
    throw new Error(
      `Отсутствует знак "?": ${VALIDATION_MESSAGES.MISSING_QUESTION_MARK}: ${questionsWithoutMark.join(', ')}`
    );
  }
}

function validateUniquePart(part: string | null, goal: string): void {
  if (!part) return;

  if (!goal.toLowerCase().trim().includes(part.toLowerCase().trim())) {
    throw new Error(
      `Ошибка в поле "Уникальная часть": ${VALIDATION_MESSAGES.PART_NOT_IN_GOAL}`
    );
  }

  const lastChar = part.trim().slice(-1);
  if (VALIDATION_PATTERNS.FORBIDDEN_PART_ENDINGS.includes(lastChar as any)) {
    throw new Error(
      `Ошибка в поле "Уникальная часть": ${VALIDATION_MESSAGES.FORBIDDEN_PART_ENDINGS}`
    );
  }
}

function validateNumericFields(data: GroupId): void {
  const { target, currentCount, messagesCount } = data;

  const numericFields = {
    'Целевое значение отправок': target,
    'Текущее значение отправок': currentCount,
    'Количество сообщений': messagesCount,
  };

  const invalidNumericFields = Object.entries(numericFields)
    .filter(([_, value]) => isNaN(Number(value)) || Number(value) < 0)
    .map(([fieldName]) => fieldName);

  if (invalidNumericFields.length > 0) {
    throw new Error(
      `${VALIDATION_MESSAGES.INVALID_NUMERIC}: ${invalidNumericFields.join(', ')}`
    );
  }

  if (target < currentCount) {
    throw new Error(
      `Ошибка в поле "Целевое значение отправок": ${VALIDATION_MESSAGES.TARGET_LESS_THAN_CURRENT} (${currentCount})`
    );
  }
}

function validateRandomStrings(data: GroupId): void {
  if (EXCLUDED_GROUP_IDS.includes(data.groupId)) {
    return;
  }

  try {
    checkRandomString(data.secondMessagePrompt, 'Первый вопрос');

    if (data.addedQuestion) {
      checkRandomString(data.addedQuestion, 'Дополнительный вопрос');
    }
  } catch (error) {
    throw new Error(
      `Ошибка проверки случайных строк: ${error instanceof Error ? error.message : error}`
    );
  }
}

export function validateGroupId(data: GroupId): void {
  try {
    GroupIdSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`ОШИБКА ВАЛИДАЦИИ: ${formatZodError(error)}`);
    }
    throw error;
  }

  const { goal, part, secondMessagePrompt, addedQuestion, language } = data;

  if (!['ENGLISH', 'RUSSIAN', 'UKRAINIAN'].includes(language)) {
    throw new Error(
      `Ошибка в поле "Язык": ${VALIDATION_MESSAGES.INVALID_LANGUAGE}`
    );
  }

  validateUniquePart(part, goal);
  validateGroupIdFields(data);
  validateQuestionMarks(secondMessagePrompt, addedQuestion || null);
  validateNumericFields(data);
  validateRandomStrings(data);
}
