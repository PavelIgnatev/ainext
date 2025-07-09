'use server';

import axios from 'axios';
import { CohereAIParamsSchema, CohereAIParams } from '../schemas/llmCohereAi';

const REQUEST_TIMEOUT = 30000;

export async function makeLLMRequest(params: CohereAIParams) {
  const apiUrl = process.env.LLM_API_URL || 'http://91.198.220.234/chatv2';
  if (!apiUrl) {
    throw new Error('[SERVER_LEVEL] ENV: LLM_API_URL UNDEFINED');
  }

  try {
    CohereAIParamsSchema.parse(params);

    const { data } = await axios.post(apiUrl, params, {
      timeout: REQUEST_TIMEOUT,
    });

    const responseText = String(data?.message?.content?.[0]?.text || '').trim();

    if (!responseText) {
      throw new Error('[SERVER_LEVEL] EMPTY OR INVALID API RESPONSE');
    }

    return responseText;
  } catch (error: any) {
    const errorMessage = error.message || 'UNDEFINED_ERROR';
    const statusCode = error.response?.status;

    throw new Error(
      `[SERVER_LEVEL] LLM_REQUEST_ERROR: ${errorMessage}${statusCode ? ` (HTTP ${statusCode})` : ''}`
    );
  }
}
