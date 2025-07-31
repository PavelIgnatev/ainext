async function withRetry<T>(fn: () => Promise<T>, maxRetries = 15) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  throw new Error('RETRY_MAXIMUM_LIMIT_ERROR');
}

export { withRetry };
