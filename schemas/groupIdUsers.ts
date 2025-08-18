import { z } from 'zod';

const GroupIdUsersSchema = z.array(z.string().min(1));

const VALIDATION_PATTERNS = {
  USERNAME_PATTERN: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  PHONE_E164: /^\+[0-9]{7,15}$/,
} as const;

const VALIDATION_MESSAGES = {
  INVALID_USERNAME:
    'Юзернейм должен начинаться с английской буквы и содержать только английские буквы, цифры или символ подчеркивания (_)',
  EMPTY_DATABASE: 'База данных не может быть пустой',
  INVALID_GROUP_ID: 'Некорректный идентификатор группы',
  SHORT_USERNAME: 'Юзернеймы должны содержать минимум 3 символа',
  PHONES_ONLY:
    'Для запуска с режимом "phone" допускаются только номера телефонов',
  INVALID_PHONE_FORMAT:
    'Номера телефонов должны быть в формате +[цифры] без пробелов, скобок и разделителей',
  PHONES_NOT_ALLOWED:
    'В обычных запусках без части "phone" рассылать по номерам нельзя',
} as const;

function validateDatabase(database: Array<string>) {
  if (!database || database.length === 0) {
    throw new Error(VALIDATION_MESSAGES.EMPTY_DATABASE);
  }

  const filteredDatabase = database
    .map((u: string) => u.trim().toLowerCase())
    .filter((u: string) => u.length > 0);

  if (filteredDatabase.length === 0) {
    throw new Error(VALIDATION_MESSAGES.EMPTY_DATABASE);
  }

  const nonPhoneEntries = filteredDatabase.filter((u) => !u.startsWith('+'));
  const phoneEntries = filteredDatabase.filter((u) => u.startsWith('+'));

  const invalidPhones = phoneEntries.filter(
    (p) => !VALIDATION_PATTERNS.PHONE_E164.test(p)
  );
  if (invalidPhones.length > 0) {
    throw new Error(
      `${VALIDATION_MESSAGES.INVALID_PHONE_FORMAT}. Некорректные поля: ${invalidPhones.join(', ')}`
    );
  }

  const shortUsernames = nonPhoneEntries.filter(
    (username) => username.length < 3
  );
  if (shortUsernames.length > 0) {
    throw new Error(
      `${VALIDATION_MESSAGES.SHORT_USERNAME}: ${shortUsernames.join(', ')}`
    );
  }

  const usernamesStartWithDigit = nonPhoneEntries.filter((u) => /^\d/.test(u));
  if (usernamesStartWithDigit.length > 0) {
    throw new Error(
      `Юзернеймы не могут начинаться с цифр. Исправьте: ${usernamesStartWithDigit.join(', ')}`
    );
  }

  const invalidUsernames = nonPhoneEntries.filter(
    (username) => !VALIDATION_PATTERNS.USERNAME_PATTERN.test(username)
  );

  if (invalidUsernames.length > 0) {
    throw new Error(
      `${VALIDATION_MESSAGES.INVALID_USERNAME}. Исправьте: ${invalidUsernames.join(', ')}`
    );
  }
}

function validatePhoneDatabase(database: Array<string>) {
  if (!database || database.length === 0) {
    throw new Error(VALIDATION_MESSAGES.EMPTY_DATABASE);
  }

  const filteredDatabase = database
    .map((u: string) => u.trim().toLowerCase())
    .filter((u: string) => u.length > 0);

  if (filteredDatabase.length === 0) {
    throw new Error(VALIDATION_MESSAGES.EMPTY_DATABASE);
  }

  const invalidWithoutPlus = filteredDatabase.filter(
    (entry) => !entry.startsWith('+')
  );
  if (invalidWithoutPlus.length > 0) {
    throw new Error(
      `${VALIDATION_MESSAGES.PHONES_ONLY}. Исправьте: ${invalidWithoutPlus.join(', ')}`
    );
  }

  const invalidByFormat = filteredDatabase.filter(
    (entry) =>
      entry.startsWith('+') && !VALIDATION_PATTERNS.PHONE_E164.test(entry)
  );
  if (invalidByFormat.length > 0) {
    throw new Error(
      `${VALIDATION_MESSAGES.INVALID_PHONE_FORMAT}. Исправьте: ${invalidByFormat.join(', ')}`
    );
  }
}

export function validateGroupIdUsers(database: Array<string>, groupId: string) {
  try {
    GroupIdUsersSchema.parse(database);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `ОШИБКА ВАЛИДАЦИИ: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }
    throw error;
  }

  const isPhoneMode = groupId.toLowerCase().includes('phone');
  if (!isPhoneMode) {
    const phoneEntries = database
      .map((u: string) => u.trim())
      .filter((u: string) => u.length > 0 && u.startsWith('+'));
    if (phoneEntries.length > 0) {
      throw new Error(
        `${VALIDATION_MESSAGES.PHONES_NOT_ALLOWED}. Исправьте: ${phoneEntries.join(', ')}`
      );
    }
  } else {
    validatePhoneDatabase(database);
  }

  validateDatabase(database);
}
