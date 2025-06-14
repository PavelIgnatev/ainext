import axios, { AxiosError } from 'axios';

import { urls } from '../urls';

interface LLMError extends Error {
  status?: number;
  details?: any;
  code?: string;
}

class FrontendLLMService {
  async generate(params: any): Promise<any> {
    try {
      const response = await axios.post(urls.llmGenerate, params);
      return response.data;
    } catch (error: any) {
      const llmError: LLMError = new Error(
        error.response?.data?.error ||
          error.message ||
          'Ошибка при генерации LLM'
      );

      llmError.status = error.response?.status;
      llmError.details = error.response?.data?.details;
      llmError.code = error.response?.data?.code || 'FRONTEND_LLM_ERROR';

      throw llmError;
    }
  }
}

const FrontendLLMApi = new FrontendLLMService();
export default FrontendLLMApi;
