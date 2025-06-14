import axios from 'axios';

import { urls } from '../api/urls';

function extractStatusAndReason(
  input: any
): { status: string; reason: string } | null {
  if (!input) return null;

  if (typeof input === 'object' && input.text) {
    return extractStatusAndReason(input.text);
  }

  if (typeof input !== 'string') return null;

  const cleanInput = input.trim();
  let status = '';
  let reason = '';

  const statusMatches = cleanInput.match(
    /["']?status["']?\s*[=:]\s*["']?(stop|nurture|lead)["']?/i
  );
  if (statusMatches && statusMatches[1]) {
    status = statusMatches[1].toLowerCase();
  }

  const reasonKeyIndex = cleanInput.indexOf('"reason"');
  if (reasonKeyIndex !== -1) {
    const colonIndex = cleanInput.indexOf(':', reasonKeyIndex);
    if (colonIndex !== -1) {
      const startQuoteIndex = cleanInput.indexOf('"', colonIndex);
      if (startQuoteIndex !== -1) {
        let endQuoteIndex = -1;
        let searchIndex = startQuoteIndex + 1;

        while (searchIndex < cleanInput.length) {
          const nextQuote = cleanInput.indexOf('"', searchIndex);
          if (nextQuote === -1) break;

          if (cleanInput[nextQuote - 1] !== '\\') {
            endQuoteIndex = nextQuote;
            break;
          }

          searchIndex = nextQuote + 1;
        }

        if (endQuoteIndex !== -1) {
          reason = cleanInput.substring(startQuoteIndex + 1, endQuoteIndex);
        }
      }
    }
  }

  if (!reason) {
    const reasonMatches = cleanInput.match(
      /["']?reason["']?\s*[=:]\s*["']?(.*?)["']\s*}/i
    );
    if (reasonMatches && reasonMatches[1]) {
      reason = reasonMatches[1];
    }
  }

  if (!status) {
    if (cleanInput.includes('stop')) status = 'stop';
    else if (cleanInput.includes('nurture')) status = 'nurture';
    else if (cleanInput.includes('lead')) status = 'lead';
  }

  return status ? { status, reason: reason || 'No reason provided' } : null;
}

export async function makeRequestAnalysis(
  messages: {
    role: 'assistant' | 'system' | 'user';
    content: string;
  }[]
) {
  const errors: string[] = [];
  let retryCount = 0;
  const maxRetries = 5;

  while (retryCount < maxRetries) {
    try {
      const { data: resultData } = await axios.post(urls.llmGenerate, {
        maxTimeoutRequest: 7500,
        k: 1,
        temperature: 0.1,
        model: 'command-a-03-2025',
        response_format: {
          type: 'json_object',
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: `
  ** Current status of the dialog relative to the "user" messages **
  
  - **STOP** (Immediate termination): If the user displays swearing or insults, explicit negativity, or 3+ consecutive negative responses.
  - **NURTURE** (Continue nurturing): Engage with neutral or uncertain responses, general clarifying questions, passive agreement, or less than 2 consecutive neutral or positive responses.
  - **LEAD** (Potential client): Respond to commercial proposal requests, deal terms or discounts inquiries, contact details sharing, product or terms-related questions, or demo or presentation requests.`,
                enum: ['stop', 'nurture', 'lead'],
              },
              reason: {
                type: 'string',
                description: `- Reason must contain:
    * Detected trigger type
    * Brief action assessment for next steps`,
              },
            },
            required: ['status', 'reason'],
          },
        },
        messages: [
          {
            role: 'system',
            content: `Your main goal is to determine the user's interaction status based on their latest response in order to optimize conversion. Here are the specific steps you need to follow:
  
  1. **Tonal Analysis**: Pay attention to emotional coloring (positive or negative or neutral), lexical markers (slang, formality, emojis), response length (detailed vs monosyllabic), explicit objections, neutral or positive responses, general clarifying questions, and potential misunderstandings.
  
  2. **Semantic Triggers**:
  - * Positive Signals * : Respond to product or terms-related questions, detail clarification, demo or presentation requests, neutral or positive responses, and general clarifying questions.
  - * Negative Signals * : Address rudeness or sarcasm, explicit negativity, ignoring questions or 2+ consecutive neutral responses.
  
  3. **Status Classification**:
  - **STOP** (Immediate termination): If the user displays swearing or insults, explicit negativity, or 3+ consecutive negative responses.
  - **NURTURE** (Continue nurturing): Engage with neutral or uncertain responses, general clarifying questions, passive agreement, or less than 2 consecutive neutral or positive responses.
  - **LEAD** (Potential client): Respond to commercial proposal requests, deal terms or discounts inquiries, contact details sharing, product or terms-related questions, or demo or presentation requests.
  
  4. **Processing Algorithm**:
  - Analyze all user messages cumulatively, focusing on the last 2 messages.
  - Check for trigger phrases.
  - Identify behavioral patterns.
  
  **Output Requirements**:
  - Each field must strictly adhere to the schema
  - Reason must contain:
    * Detected trigger type
    * Brief action assessment for next steps
  - Strict response format: {
    "status": "stop|nurture|lead",
    "reason": "..."
  }`,
          },
          ...messages,
        ],
      });
      const parsedData = extractStatusAndReason(
        resultData?.message?.content?.[0]
      );

      if (!parsedData || !parsedData.status || !parsedData.reason) {
        throw new Error(`NO_DATA:${resultData?.message?.content?.[0]?.text}`);
      }

      return parsedData;
    } catch (error: any) {
      errors.push(error.message);
      retryCount++;

      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  }

  throw new Error('RESULT_NOT_FOUND');
}
