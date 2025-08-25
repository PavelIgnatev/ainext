import { makeLLMRequest } from './utils/llmRequest';
import { extractJsonResponse } from './utils/llmExtractJson';
import { getCombinedMessages } from './utils/llmCombinedMessages';
import {
  DialogueAnalysisSchema,
  DialogueAnalysisOptionsSchema,
  DialogueAnalysis,
  DialogueAnalysisOptions,
  DialogueAnalysisResult,
} from './schemas/llmDialogueAnalysis';
import { sleep } from './utils/llmSleep';

const LLM_CONSTANTS = {
  DEFAULT_MAX_RETRIES: 5,
  DEFAULT_RETRY_DELAY: 2500,
};

export async function getDialogueAnalysis(
  context: DialogueAnalysis,
  options: DialogueAnalysisOptions
): Promise<{
  analysisResult: DialogueAnalysisResult;
  responseThink: string | null;
}> {
  DialogueAnalysisSchema.parse(context);
  DialogueAnalysisOptionsSchema.parse(options);

  const { leadDefinition, language, companyName } = context;
  const { llmParams, onRequest, onTry, onLogger } = options;
  const { messages, ...otherLlmParams } = llmParams;
  const maxRetries = LLM_CONSTANTS.DEFAULT_MAX_RETRIES;

  const cleanMessages = messages.filter((msg) => msg.role !== 'system') as {
    role: 'assistant' | 'user';
    content: string;
  }[];
  const combinedMessages = getCombinedMessages(cleanMessages);
  const analysisPrompt = createAnalysisPrompt(leadDefinition, language);

  const dialogueMarkup = buildDialogueMarkup(combinedMessages);
  const userInstruction = buildUserInstruction(language);
  const params = {
    ...otherLlmParams,
    messages: [
      {
        role: 'system' as const,
        content: `${analysisPrompt}\n\n${dialogueMarkup}`,
      },
      { role: 'user' as const, content: userInstruction },
    ],
  };

  onLogger?.('DA_REQUEST', {
    companyName,
    leadDefinition,
    params,
  });

  const attempts: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < maxRetries; i++) {
    let llmResponse = '';
    try {
      onRequest?.();

      const { responseText, responseThink } = await makeLLMRequest(params);
      llmResponse = responseText;
      const analysisResult = extractJsonResponse(responseText);

      if (!analysisResult) {
        throw new Error('ANALYSIS_RESULT_NOT_DEFINED');
      }

      onLogger?.('DA_RESPONSE', {
        companyName,
        ...analysisResult,
      });

      return { analysisResult, responseThink };
    } catch (error: any) {
      const errorMessage = error.message || 'UNDEFINED_ERROR';
      attempts.push(llmResponse || 'NO_RESPONSE');
      errors.push(errorMessage);

      onTry?.(errorMessage);
      onLogger?.('DA_ERROR', {
        companyName,
        error: errorMessage,
      });

      if (i < maxRetries - 1) {
        await sleep(LLM_CONSTANTS.DEFAULT_RETRY_DELAY);
      }
    }
  }

  throw new Error(`STOPPED_ERROR`);
}

function createAnalysisPrompt(
  leadDefinition: string,
  language: string
): string {
  return `You are an AI conversation analyst. Your objective is to analyze the entire conversation context and determine the user's engagement status. Follow these instructions precisely:

1. **Emotional & Linguistic Analysis**  
  - Assess the tone (positive, neutral, negative), style (formal, informal, slang, emojis), message length, and explicit objections or misunderstandings throughout the conversation.

2. **Engagement Triggers & Classification**  

**⭐ PRIORITY: LEAD DETECTION ⭐**
**LEAD**: ${leadDefinition}
**CRITICAL**: Lead detection is the PRIMARY objective. Analyze every user response with maximum attention to determine if it matches the LEAD criteria defined above. Pay extremely close attention to the specific triggers, behaviors, and patterns described in the LEAD section. Even subtle or ambiguous responses that could potentially fit the LEAD definition should be carefully evaluated for correspondence with the specified criteria. Be thorough and precise in matching user behavior against the LEAD requirements - this is the most important classification and requires the highest accuracy.

**NEGATIVE**: The user expresses **genuine hostility, aggression, or explicit demands to cease all communication**. This classification requires the presence of emotional escalation beyond normal business rejection. Look for signs of anger, frustration directed at the conversation itself (not just the product), personal attacks, threats, demands for immediate cessation of contact, or language indicating the user feels harassed or bothered by the very act of communication. This is fundamentally different from business-related rejections - negative status indicates the user is emotionally upset with the communication process itself and wants it to stop entirely. Mere disinterest in the product or service does NOT qualify as negative. The user must demonstrate clear hostility toward continuing ANY form of dialogue.

**CONTINUE**: All other conversations including **any normal rejections** ("I'm not interested", "No thanks", "Not right now", "Maybe later"), neutral information exchanges, polite deflections, general questions about the business, friendly but non-committal responses, small talk, and standard conversational flow. Even simple "no" responses are part of normal dialogue flow. These are cases where the AI should continue the dialogue - rejections are normal and don't mean stopping contact.

3. **🚨 MANDATORY LEAD VERIFICATION PROTOCOL 🚨**
**BEFORE FINAL CLASSIFICATION**: You MUST perform this lead verification checklist:
- Step 1: Re-read the LEAD definition above word by word
- Step 2: Re-examine the user's ENTIRE conversation for ANY potential lead signals
- Step 3: Ask yourself: "Could this response indicate lead behavior in ANY way?"
- Step 4: If there's even 1% chance this could be a lead - classify as LEAD
- Step 5: Remember: Missing a lead is the WORST possible outcome

4. **Reason Language**  
For translation purposes, replace the reason in the desired language using ${language} to automatically translate the reason. For example, if the user's language is Russian, translate the reason into Russian. You will replace the "reason" with the translated version based on the user's language preference.

5. **Structured JSON Response**  
Your response should be a JSON object with the following fields:  
{  
"status": "negative" | "lead" | "continue",  
"reason": "<Specific trigger detected>"  
}  
Please ensure that the analysis is precise and each classification is supported by clear references to the user's messages. The response should be concise and specific.

6. **REASON REQUIREMENTS**  
The "reason" field must contain:
- Detailed analysis of what triggered this classification (minimum 2-3 sentences)
- All text must be in ${language} language

**Structured JSON Response**  
Your response should be a JSON object with the following fields:  
{  
"status": "negative" | "lead" | "continue",  
"reason": "<Detailed analysis with examples>"  
}`;
}

function buildDialogueMarkup(
  messages: { role: 'assistant' | 'user'; content: string }[]
): string {
  if (!messages.length) return '';
  const items = messages
    .map((m) => {
      const tag = m.role === 'user' ? 'USER' : 'ASSISTANT';
      return `<${tag}>\n  [MESSAGE]${m.content}[/MESSAGE]\n</${tag}>`;
    })
    .join('\n');
  return `<DIALOGUE_HISTORY>\n${items}\n</DIALOGUE_HISTORY>`;
}

function buildUserInstruction(language: string): string {
  return `<INSTRUCTION>
  - Analyze the conversation strictly using [DIALOGUE_HISTORY]
  - Return ONLY a JSON object with keys "status" and "reason"
  - status must be one of: "negative" | "lead" | "continue"
  - reason must contain detailed analysis (2-3 sentences) in ${language.toUpperCase()}
  - Prefer "lead" if there is any reasonable indication
  - Do not include any extra text, tags, or comments
</INSTRUCTION>`;
}
