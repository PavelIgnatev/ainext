import { z } from 'zod';
import type { Crm } from '@/@types/Crm';

const CrmSchema = z.object({
  type: z.enum(['amo', 'bitrix', 'api'], {
    errorMap: () => ({
      message: 'Выберите корректный тип CRM: АмоCRM, Bitrix24 или Custom API',
    }),
  }),
  groupId: z.string().min(1, 'Идентификатор группы обязателен'),
  webhook: z
    .string()
    .url(
      'Введите корректный URL webhook (должен начинаться с http:// или https://)'
    ),
});

const FIELD_NAMES: Record<string, string> = {
  type: 'Тип CRM',
  groupId: 'Идентификатор группы',
  webhook: 'Webhook URL',
};

const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Обязательное поле!',
  INVALID_WEBHOOK_PROTOCOL:
    'URL webhook должен начинаться с http:// или https://',
  INVALID_WEBHOOK_FORMAT:
    'Некорректный формат URL webhook. Пример: https://your-domain.com/webhook',
  INVALID_TYPE: 'Выберите корректный тип CRM: АмоCRM, Bitrix24 или Custom API',
  WEBHOOK_EXAMPLES: {
    amo: 'Пример для АмоCRM: https://yoursubdomain.amocrm.ru/api/v4/webhooks/...',
    bitrix: 'Пример для Bitrix24: https://your-portal.bitrix24.ru/rest/...',
    api: 'Пример для Custom API: https://your-domain.com/api/webhook',
  },
} as const;

function validateCrmFields(data: Crm) {
  const errors: string[] = [];

  if (!data.type) {
    errors.push(`${FIELD_NAMES.type}: ${VALIDATION_MESSAGES.REQUIRED_FIELD}`);
  }

  if (!data.groupId) {
    errors.push(
      `${FIELD_NAMES.groupId}: ${VALIDATION_MESSAGES.REQUIRED_FIELD}`
    );
  }

  if (!data.webhook) {
    errors.push(
      `${FIELD_NAMES.webhook}: ${VALIDATION_MESSAGES.REQUIRED_FIELD}`
    );
  } else {
    if (
      !data.webhook.startsWith('http://') &&
      !data.webhook.startsWith('https://')
    ) {
      const example = data.type
        ? VALIDATION_MESSAGES.WEBHOOK_EXAMPLES[
            data.type as keyof typeof VALIDATION_MESSAGES.WEBHOOK_EXAMPLES
          ]
        : '';
      errors.push(
        `${FIELD_NAMES.webhook}: ${VALIDATION_MESSAGES.INVALID_WEBHOOK_PROTOCOL}${example ? '. ' + example : ''}`
      );
    } else {
      try {
        new URL(data.webhook);
      } catch {
        const example = data.type
          ? VALIDATION_MESSAGES.WEBHOOK_EXAMPLES[
              data.type as keyof typeof VALIDATION_MESSAGES.WEBHOOK_EXAMPLES
            ]
          : '';
        errors.push(
          `${FIELD_NAMES.webhook}: ${VALIDATION_MESSAGES.INVALID_WEBHOOK_FORMAT}${example ? '. ' + example : ''}`
        );
      }
    }
  }

  if (data.type && !['amo', 'bitrix', 'api'].includes(data.type)) {
    errors.push(`${FIELD_NAMES.type}: ${VALIDATION_MESSAGES.INVALID_TYPE}`);
  }

  return errors;
}

function formatZodError(error: z.ZodError, data?: Crm): string {
  return error.errors
    .map((err) => {
      const fieldName = FIELD_NAMES[err.path[0] as string] || err.path[0];

      if (err.path[0] === 'webhook' && err.code === 'invalid_string') {
        const example = data?.type
          ? VALIDATION_MESSAGES.WEBHOOK_EXAMPLES[
              data.type as keyof typeof VALIDATION_MESSAGES.WEBHOOK_EXAMPLES
            ]
          : '';
        return `${fieldName}: ${err.message}${example ? '. ' + example : ''}`;
      }

      return `${fieldName}: ${err.message}`;
    })
    .join('\n');
}

export function validateCrm(data: Crm) {
  try {
    CrmSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(formatZodError(error, data));
    }
    throw error;
  }

  const fieldErrors = validateCrmFields(data);
  if (fieldErrors.length > 0) {
    throw new Error(fieldErrors.join('\n'));
  }
}
