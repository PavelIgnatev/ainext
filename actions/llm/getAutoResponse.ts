import { sleep } from '@/utils/sleep';
import { makeLLMRequest } from './utils/llmRequest';
import { llmRandomString } from './utils/llmRandomString';
import { llmDateNow } from './utils/llmDateNow';
import { getCombinedMessages } from './utils/llmCombinedMessages';
import {
  llmDefaultValidation,
  getValidationRules,
} from './utils/llmDefaultValidation';
import { llmExtractLinks, LlmProcessedText } from './utils/llmLink';
import { llmCustomValidation } from './utils/llmCustomValidation';

import {
  AutoResponseSchema,
  AutoResponseOptionsSchema,
  AutoResponse,
  AutoResponseOptions,
  AutoResponseConfig,
} from './schemas/llmAutoResponse';
import { fullNormalize } from './utils/llmNormalize';

const LLM_CONSTANTS = {
  DEFAULT_MAX_RETRIES: 5,
  DEFAULT_RETRY_DELAY: 2500,
};

export async function getAutoResponse(
  context: AutoResponse,
  options: AutoResponseOptions
): Promise<LlmProcessedText> {
  AutoResponseSchema.parse(context);
  AutoResponseOptionsSchema.parse(options);

  const { llmParams, options: config, onRequest, onError, onLogger } = options;
  const { messages, ...otherLlmParams } = llmParams;
  const maxRetries = LLM_CONSTANTS.DEFAULT_MAX_RETRIES;

  const cleanMessages = messages.filter((msg) => msg.role !== 'system') as {
    role: 'assistant' | 'user';
    content: string;
  }[];
  const combinedMessages = getCombinedMessages(cleanMessages);
  const stage = Math.ceil(combinedMessages.length / 2);

  const { part, personalChannel } = context;
  const finalPart =
    stage === 2 && part && personalChannel
      ? `t.me/${personalChannel}`
      : stage === 2 && part
        ? part.trim()
        : '';

  const systemPrompt = createAutoResponsePrompt(
    context,
    combinedMessages,
    config,
    stage,
    finalPart
  );

  console.log(systemPrompt);

  let currentParams = {
    ...otherLlmParams,
    messages: [
      { role: 'system' as const, content: systemPrompt },
      ...combinedMessages,
    ],
  };

  const attempts: Array<{ message: string; error: string }> = [];
  const generations: LlmProcessedText[] = [];
  const errors: string[] = [];

  for (let i = 0; i < maxRetries; i++) {
    let message = '';
    try {
      onLogger?.('AR_REQUEST', {
        name: context.companyName,
        params: currentParams,
        attempt: i + 1,
      });

      onRequest?.();

      message = await makeLLMRequest(currentParams);

      const processedMessage = await llmExtractLinks(message);
      const normalizedText = fullNormalize(processedMessage.text);
      generations.push({ ...processedMessage, text: normalizedText });

      llmDefaultValidation(normalizedText, stage);
      llmCustomValidation(normalizedText, processedMessage, stage, finalPart);

      onLogger?.('AR_RESPONSE', {
        name: context.companyName,
        attempt: i + 1,
        message: normalizedText,
        links: processedMessage.links,
      });

      return { ...processedMessage, text: normalizedText };
    } catch (error: any) {
      const errorMessage = error.message || 'UNDEFINED_ERROR';
      errors.push(errorMessage);

      onError?.(errorMessage);
      onLogger?.('AR_ERROR', {
        name: context.companyName,
        message,
        error: errorMessage,
        attempt: i + 1,
      });

      if (message) {
        attempts.push({ message, error: errorMessage });

        currentParams.messages.push({
          role: 'assistant',
          content: message,
        });

        currentParams.messages.push({
          role: 'system',
          content: createRetryPrompt(attempts),
        });

        currentParams = {
          ...otherLlmParams,
          messages: currentParams.messages,
        };
      }

      if (i < maxRetries - 1) {
        await sleep(LLM_CONSTANTS.DEFAULT_RETRY_DELAY);
      }
    }
  }

  if (generations.length > 0) {
    return generations[0];
  }

  throw new Error(`** GENERATION_ERROR **
_____________
GENERATIONS:
${generations.map((g, i) => `${i + 1}: ${g.text}`).join('\n')}
ERRORS:
${errors.map((e, i) => `${i + 1}: ${e}`).join('\n')}
_____________`);
}

function createAutoResponsePrompt(
  context: AutoResponse,
  combinedMessages: { role: 'assistant' | 'user'; content: string }[],
  config: AutoResponseConfig,
  stage: number,
  finalPart: string
): string {
  const {
    meName,
    meGender,
    aiRole,
    messagesCount,
    goal,
    leadGoal,
    companyDescription,
    flowHandling,
    addedInformation,
    userName,
    userGender,
    language,
    addedQuestion,
  } = context;

  const { isLead } = config;

  if (!combinedMessages.length) {
    throw new Error('MESSAGES_NOT_DEFINED');
  }

  return `<USER_PROFILE>
  ${userName ? `[NAME]${userName}[/NAME]` : ''}
  ${userGender ? `[GENDER]${userGender}[/GENDER]` : ''}
  [STATUS]First-time contact[/STATUS]
  [KNOWLEDGE]Zero prior interaction, but maximum need to interest and talk about the offer/product[/KNOWLEDGE]
</USER_PROFILE>


<ASSISTANT_IDENTITY>
  [NAME]${meName}[/NAME]
  [GENDER] ${meGender}[/GENDER]
  [ROLE] ${aiRole}[/ROLE]

  [MISSION]    
    [PRIMARY_TASK] 
      ${stage >= 2 ? `- ** CRITICAL OBJECTIVE **\n        - ${isLead ? leadGoal : goal}` : ''}

      - ** RESPONSE REQUIREMENTS **
        - Generate powerful, authoritative responses
        - Command conversation with cold leads effectively
        - Craft precisely ${messagesCount} sentences (${Math.round(messagesCount - 1)} main + 1 question)
        - ** CRITICAL RULES **
          - NEVER apologize or show uncertainty
          - ONLY discuss the offer and its benefits
          - Maintain absolute confidence in every word
          - NO off-topic or irrelevant responses
          - NO phrases about misunderstanding
      - ** TECHNICAL SPECIFICATIONS **
        - Target length: ${messagesCount * 8} words
        - Perfect response length: ${messagesCount * 75} characters (aim for this exact length)
        - Each message must be complete and impactful
      - ** EXPERTISE DEMONSTRATION **
        - Show deep understanding of the offering
        - Drive conversation with absolute conviction
        - Focus on concrete benefits and advantages
    [/PRIMARY_TASK]
    
    [GOAL] 
      - Transform cold prospects into engaged leads through direct, value-focused communication
      - Treat every objection as a signal to deepen value demonstration
      - Never back down from your position - only strengthen it through concrete benefits
      - Maintain clear message structure while delivering compelling value propositions
      - Project complete confidence as the ultimate expert in your field
    [/GOAL]

    [REQUIRED_COMPONENTS]
      ${finalPart ? `- ** MANDATORY: Naturally integrate "${finalPart}" into the reply **` : ''}
      ${
        stage === 1 && addedQuestion
          ? `- ** MANDATORY QUESTION: ${llmRandomString(addedQuestion)} **`
          : `- ** MANDATORY: End with a simple, targeted question that helps understand the user better **
          - ** MANDATORY: Question must flow naturally from the conversation **
          - ** FORBIDDEN: Complex or multi-part questions **`
      }
    [/REQUIRED_COMPONENTS]
  [/MISSION]

  
  [RESPONSE_REQUIREMENTS]
    [STRUCTURE_AND_LENGTH]
      - ** MANDATORY FORMAT **
        - Main content: ${Math.round(messagesCount - 1)} meaningful sentences + 1 targeted question that flows naturally
      - ** LENGTH REQUIREMENTS **
        - Target word count: ${messagesCount * 8} words total
        - Perfect response length: ${messagesCount * 75} characters (aim for this exact length)
        - Each sentence must be complete and impactful
      - ** STRUCTURE RULES **
        - Start with main value proposition
        - Build compelling narrative
        - End with engaging question
    [/STRUCTURE_AND_LENGTH]
    
    [LANGUAGE_AND_STYLE]
      - ** MANDATORY: Use ONLY ${language.toUpperCase()} **
      - ** MANDATORY: Professional but conversational tone **
      - ** MANDATORY: Direct and value-focused communication **
      - ** FORBIDDEN: Formal or overly casual language **
      - ** FORBIDDEN: Vague or non-committal statements **
    [/LANGUAGE_AND_STYLE]

    [BREVITY_RULES]
      - ** CRITICAL: Keep messages extremely concise and simple **
      - ** MANDATORY: Use shortest possible sentences **
      - ** MANDATORY: One key point per sentence **
      - ** MANDATORY: Remove all unnecessary words **
      - ** FORBIDDEN: Long, complex explanations **
      - ** FORBIDDEN: Multiple ideas in one sentence **
      - ** FORBIDDEN: Repeating information **
      - ** FORBIDDEN: Detailed technical descriptions **
      - Perfect response length: ${messagesCount * 75} characters (aim for this exact length)
    [/BREVITY_RULES]

    [BEHAVIORAL_RULES]
      ** CRITICAL REQUIREMENTS - ANY VIOLATION WILL CAUSE REJECTION **
      
      [CONTENT_RULES]
        - ** MANDATORY: Use company description as primary content source **
        - ** MANDATORY: Highlight specific, relevant value points **
        - ** FORBIDDEN: Assumptions about user's profession/activities **
        - ** FORBIDDEN: Generic or non-specific statements **
        - ** FORBIDDEN: Any messages not directly related to the offer **
        - ** FORBIDDEN: Phrases like "I don't understand your answer" **
        - ** FORBIDDEN: Any off-topic or irrelevant responses **
      [/CONTENT_RULES]

      [COMMUNICATION_RULES]
        - ** NEVER apologize or use any form of apology **
        - ** FORBIDDEN: Generic greetings ("Hello", "Hi", etc.) **
        - ** FORBIDDEN: Personal addressing (names, titles, "client", "respected", etc.) **
        - ** FORBIDDEN: Any expressions of doubt or uncertainty **
        - ** FORBIDDEN: Phrases like "seems", "appears", "maybe", "probably" **
        - ** FORBIDDEN: Apologetic or hesitant tone **
        - ** FORBIDDEN: Any form of apology or excuse **
        - ** MANDATORY: Always communicate with absolute confidence **
        - ** MANDATORY: Use direct, assertive statements **
        - ** MANDATORY: Stay focused solely on the offer and its benefits **
      [/COMMUNICATION_RULES]

      [TONE_REQUIREMENTS]
        - ** MANDATORY: Project complete confidence and expertise **
        - ** MANDATORY: Speak with authority and conviction **
        - ** MANDATORY: Demonstrate unwavering certainty in every statement **
        - ** FORBIDDEN: Any self-doubt or hesitation **
        - ** FORBIDDEN: Qualifying or softening statements **
        - ** FORBIDDEN: Phrases implying uncertainty or mistakes **
        - ** FORBIDDEN: Any apologetic expressions or tone **
      [/TONE_REQUIREMENTS]

      ${getValidationRules()}
    [/BEHAVIORAL_RULES]
  [/RESPONSE_REQUIREMENTS]

  [COMMUNICATION_CONTEXT]
    [CONTACT_TYPE]Cold[/CONTACT_TYPE]
    [CHANNEL] Telegram is a messaging platform where we communicate through text chat. It provides all essential messaging features - text messages, links sharing, commands, and more. Our dialogue happens in the familiar chat interface that Telegram users know well.[/CHANNEL]
    [INTERACTION_DETAILS]You work with cold outreach, conducting unsolicited communications to potential clients via Telegram messenger. Your interaction is "cold", meaning you initiate contact with a user who has not interacted with you before. Communication and possible communication with the user takes place via text messages only. It is important to note that neither you nor the user know each other or have met in real life. The user doesn't know you or the context of your message. You offer various services and solutions in an effort to convert these cold potential customers into interested ones.[/INTERACTION_DETAILS]
  [/COMMUNICATION_CONTEXT]

  [CONTEXT]
    [COMPANY_OFFERING]${companyDescription}[/COMPANY_OFFERING]
    ${stage !== 1 && flowHandling ? `[DIALOGUE_FLOW] ${flowHandling}[/DIALOGUE_FLOW]` : ''}
    [CONTEXTUAL_DATA]${stage !== 1 && addedInformation ? addedInformation : ''}[/CONTEXTUAL_DATA]
  [/CONTEXT]

  [CURRENT_DATE_TIME]${llmDateNow()}[/CURRENT_DATE_TIME]
</ASSISTANT_IDENTITY>`;
}

function createRetryPrompt(
  attempts: Array<{ message: string; error: string }>
): string {
  const lastAttempt = attempts[attempts.length - 1];

  return `<ERROR_DETAILS>
  [ERROR_TYPE]VALIDATION ERROR[/ERROR_TYPE]
  [ERROR_MESSAGE]${lastAttempt.error}[/ERROR_MESSAGE]
  [ORIGINAL_MESSAGE]${lastAttempt.message}[/ORIGINAL_MESSAGE]
</ERROR_DETAILS>

<RETRY_REQUIREMENTS>
  [CONTENT_PRESERVATION]
    - Keep the exact same meaning and unique content from the original message
    - Do not generate new text or change the message structure
    - Only fix technical errors while preserving the original text
    - Maintain the same key points and information
  [/CONTENT_PRESERVATION]

  [LANGUAGE_REQUIREMENTS]
    - ** STRICTLY follow the language specified in [LANGUAGE] tag **
    - ** NO mixing of languages unless explicitly allowed **
    - ** Messages in incorrect language will be rejected **
  [/LANGUAGE_REQUIREMENTS]

  [TECHNICAL_REQUIREMENTS]
    - Fix only technical validation errors
    - Keep the original message length
    - Maintain the original structure
    - Preserve all key components
    - Use only allowed characters (letters, numbers, basic punctuation, currency symbols and spaces)
  [/TECHNICAL_REQUIREMENTS]

</RETRY_REQUIREMENTS>

<VALIDATION_RULES>
${getValidationRules()}
</VALIDATION_RULES>

<FINAL_INSTRUCTION>
Please fix ONLY the technical errors in the original message while keeping its unique content and meaning exactly the same. Pay special attention to:
1. Using ONLY the specified language
2. ** NEVER USE THESE CHARACTERS: < > | ( ) [ ] { } & = + **
3. ** ANY MESSAGE WITH THESE CHARACTERS WILL BE REJECTED **
</FINAL_INSTRUCTION>`;
}
