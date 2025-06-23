import { z } from 'zod';

const GroupIdUsersSchema = z.object({
  groupId: z.string().min(1),
  database: z.array(z.string().min(1)),
});

const VALIDATION_PATTERNS = {
  USERNAME_PATTERN: /^[a-zA-Z0-9_+]+$/,
} as const;

const VALIDATION_MESSAGES = {
  INVALID_USERNAME:
    'Некорректные юзернеймы. Проверьте, что в юзернеймах содержатся только английские буквы, цифры или символ подчеркивания (_)',
  EMPTY_DATABASE: 'База данных не может быть пустой',
  INVALID_GROUP_ID: 'Некорректный идентификатор группы',
  SHORT_USERNAME: 'Юзернеймы должны содержать минимум 3 символа',
} as const;

function validateDatabase(database: Array<string>): void {
  if (!database || database.length === 0) {
    throw new Error(VALIDATION_MESSAGES.EMPTY_DATABASE);
  }

  const filteredDatabase = database
    .map((u: string) => u.trim().toLowerCase())
    .filter((u: string) => u.length > 0);

  if (filteredDatabase.length === 0) {
    throw new Error(VALIDATION_MESSAGES.EMPTY_DATABASE);
  }

  const shortUsernames = filteredDatabase.filter(
    (username) => username.length < 3
  );
  if (shortUsernames.length > 0) {
    throw new Error(
      `${VALIDATION_MESSAGES.SHORT_USERNAME}: ${shortUsernames.join(', ')}`
    );
  }

  const invalidUsernames = filteredDatabase.filter(
    (username) => !VALIDATION_PATTERNS.USERNAME_PATTERN.test(username)
  );

  if (invalidUsernames.length > 0) {
    throw new Error(
      `Некорректные юзернеймы: ${invalidUsernames.join(', ')}. ${VALIDATION_MESSAGES.INVALID_USERNAME}. Каждый новый юзернейм должен находиться в отдельной строке.`
    );
  }
}

export function validateGroupIdUsers(
  groupId: string,
  database: Array<string>
): void {
  try {
    GroupIdUsersSchema.parse({ groupId, database });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `ОШИБКА ВАЛИДАЦИИ: ${error.errors.map((e) => e.message).join(', ')}`
      );
    }
    throw error;
  }

  if (!groupId || groupId.trim().length === 0) {
    throw new Error(VALIDATION_MESSAGES.INVALID_GROUP_ID);
  }

  validateDatabase(database);
}
