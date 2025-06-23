import { z } from 'zod';
import type { Analysis } from '@/@types/Analysis';

const DialogMessageSchema = z.object({
  role: z.enum(['assistant', 'user']),
  content: z.string().min(1),
});

const AnalysisSchema = z.object({
  companyId: z.string(),
  aiRole: z.string().min(1),
  companyDescription: z.string().min(1),
  companyName: z.string().min(1),
  goal: z.string().min(1),
  language: z.enum(['ENGLISH', 'RUSSIAN', 'UKRAINIAN']),
  meName: z.string().min(1),
  messagesCount: z.number().min(1),
  meGender: z.string().min(1),
  userName: z.string().min(1),
  userGender: z.string().min(1),
  firstQuestion: z.string().min(1),
  leadDefinition: z.string().min(1),
  leadTargetAction: z.string().min(1),
  dialogs: z.array(z.array(DialogMessageSchema)),
  addedInformation: z.string().nullable(),
  addedQuestion: z.string().nullable(),
  flowHandling: z.string().nullable(),
  part: z.string().nullable(),
});

const VALIDATION_PATTERNS = {
  FORBIDDEN_BASIC_SYMBOLS: /[?!]/,
  FORBIDDEN_QUESTION_SYMBOLS: /[!.:]/,
  FORBIDDEN_GREETING_SYMBOLS: /[?:]/,
  FORBIDDEN_PART_ENDINGS: ['.', '?', ',', '!'],
  USERNAME_PATTERN: /^[a-zA-Z0-9_+]+$/,
} as const;

const FIELD_NAMES: Record<string, string> = {
  companyId: 'ID компании',
  aiRole: 'Роль AI менеджера',
  companyDescription: 'Описание компании',
  companyName: 'Название компании',
  goal: 'Целевое действие',
  language: 'Язык',
  meName: 'Имя инициатора',
  messagesCount: 'Количество сообщений',
  meGender: 'Пол инициатора',
  userName: 'Имя отвечающего',
  userGender: 'Пол отвечающего',
  firstQuestion: 'Первый вопрос',
  dialogs: 'Диалоги',
  addedInformation: 'Дополнительная информация',
  addedQuestion: 'Дополнительный вопрос',
  flowHandling: 'Обработка сценариев',
  part: 'Уникальная часть',
  leadDefinition: 'Критерии лида',
  leadTargetAction: 'Целевое действие при статусе лид',
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
  REQUIRED_FIELD: 'Обязательное поле!',
} as const;

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

function validateAnalysisFields(data: Analysis): void {
  const { aiRole, goal, companyDescription, firstQuestion, addedQuestion } =
    data;

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
      value: firstQuestion,
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
  firstQuestion: string,
  addedQuestion?: string | null
): void {
  const questions = [
    { value: firstQuestion, name: 'Первый вопрос' },
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

export function validateAnalysis(data: Analysis): void {
  try {
    AnalysisSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`ОШИБКА ВАЛИДАЦИИ: ${formatZodError(error)}`);
    }
    throw error;
  }

  const { goal, part, firstQuestion, addedQuestion } = data;

  validateUniquePart(part, goal);
  validateAnalysisFields(data);
  validateQuestionMarks(firstQuestion, addedQuestion || null);
}
