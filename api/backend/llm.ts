const axios = require('axios');

interface LLMError extends Error {
  status?: number;
  details?: any;
  code: string;
  originalError?: any;
}

class BackendLLMService {
  async generate(params: any): Promise<any> {
    try {
      const requestParams = {
        model: 'command-a-03-2025',
        ...params,
      };

      const { data } = await axios.post(
        'http://91.198.220.234/chatv2',
        requestParams
      );

      if (!data) {
        const error = new Error('Пустой ответ от LLM сервера') as LLMError;
        error.status = 502;
        error.code = 'EMPTY_LLM_RESPONSE';
        throw error;
      }

      return data;
    } catch (error: any) {
      const llmError = new Error(
        error.message || 'Внутренняя ошибка сервера при обращении к LLM'
      ) as LLMError;

      llmError.status = error.response?.status || 500;
      llmError.code = error.code || 'BACKEND_LLM_ERROR';
      llmError.details = error.response?.data || {};
      llmError.originalError = error;

      throw llmError;
    }
  }
}

const BackendLLMApi = new BackendLLMService();
export default BackendLLMApi;
