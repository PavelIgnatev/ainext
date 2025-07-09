/**
 * Глобальный обработчик ошибок для Server Actions
 * Показывает детальные ошибки даже в продакшене
 */

// Обертка для Server Actions чтобы ошибки проходили через клиент
export function withErrorHandling<T extends any[], R>(
  serverAction: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await serverAction(...args);
    } catch (error) {
      // Форматируем ошибку для клиента (избегаем Server Component санитизации)
      const errorMessage =
        error instanceof Error ? error.message : 'Произошла ошибка';

      // В продакшене Next.js скрывает детали, поэтому оборачиваем в клиентскую ошибку
      const clientError = new Error(errorMessage);
      clientError.name = 'ClientError'; // Маркируем как клиентскую

      throw clientError;
    }
  };
}

// Хук для React Query с улучшенной обработкой ошибок
export function useErrorHandler() {
  return {
    onError: (error: any) => {
      // Если это наша клиентская ошибка - показываем как есть
      if (error?.name === 'ClientError') {
        return error.message;
      }

      // Если Server Component ошибка - извлекаем полезную информацию
      if (typeof error?.message === 'string') {
        // Пытаемся найти оригинальное сообщение в digest или стеке
        const originalMessage = extractOriginalError(error.message);
        return originalMessage || error.message;
      }

      return 'Произошла неожиданная ошибка';
    },
  };
}

// Извлекает оригинальную ошибку из санитизированного сообщения Next.js
function extractOriginalError(message: string): string | null {
  // Паттерны для поиска оригинальных ошибок валидации
  const patterns = [
    /ОШИБКА ВАЛИДАЦИИ: (.+)/i,
    /ValidationError: (.+)/i,
    /обязательное поле/i,
    /заполните.*поля/i,
    /недопустимые символы/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}
