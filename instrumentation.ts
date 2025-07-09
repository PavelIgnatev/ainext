export async function register() {
  // Перехватываем все необработанные ошибки
  if (typeof globalThis !== 'undefined') {
    const originalError = console.error;

    console.error = (...args) => {
      // Логируем все ошибки детально
      args.forEach((arg) => {
        if (arg instanceof Error) {
          console.log('🔥 ДЕТАЛЬНАЯ ОШИБКА:', {
            message: arg.message,
            stack: arg.stack,
            name: arg.name,
            cause: arg.cause,
          });
        }
      });

      return originalError.apply(console, args);
    };

    // Принудительно отключаем production режим для ошибок
    process.env.NODE_ENV = 'development';

    // Перехватываем unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.log('🔥 UNHANDLED REJECTION:', reason);
    });

    // Перехватываем uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.log('🔥 UNCAUGHT EXCEPTION:', {
        message: error.message,
        stack: error.stack,
      });
    });
  }
}
