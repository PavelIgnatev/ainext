import { makeLLMRequest } from './utils/llmRequest';
import { llmRandomString } from './utils/llmRandomString';
import { llmDateNow } from './utils/llmDateNow';
import { getCombinedMessages } from './utils/llmCombinedMessages';
import {
  llmDefaultValidation,
  getValidationRules,
} from './utils/llmDefaultValidation';
import { llmLanguageValidation } from './utils/llmLanguageValidation';
import {
  llmExtractLinks,
  llmRestoreLinks,
  LlmProcessedText,
} from './utils/llmLink';
import { llmCustomValidation } from './utils/llmCustomValidation';

import {
  AutoResponseSchema,
  AutoResponseOptionsSchema,
  AutoResponse,
  AutoResponseOptions,
  AutoResponseConfig,
} from './schemas/llmAutoResponse';
import { fullNormalize } from './utils/llmNormalize';
import { sleep } from './utils/llmSleep';

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

  const {
    llmParams,
    options: config,
    onRequest,
    onTry,
    onThrow,
    onLogger,
  } = options;
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

  const generations: LlmProcessedText[] = [];
  const errors: string[] = [];

  for (let i = 0; i < maxRetries; i++) {
    const systemPrompt = createAutoResponsePrompt(context, {
      config,
      stage,
      finalPart,
    });

    let messages: { role: 'assistant' | 'system' | 'user'; content: string }[] =
      [];

    if (generations.length > 0 && errors.length > 0) {
      messages = [{ role: 'system', content: systemPrompt }];

      for (let j = 0; j < generations.length; j++) {
        const restoredText = llmRestoreLinks(
          generations[j],
          context.personalChannel
        );

        messages.push({
          role: 'assistant',
          content: restoredText,
        });

        if (j < errors.length) {
          messages.push({
            role: 'user',
            content: createRetryPrompt(restoredText, errors[j]),
          });
        }
      }
    } else {
      messages = [
        { role: 'system' as const, content: systemPrompt },
        ...combinedMessages,
      ];
    }

    const currentParams = {
      ...otherLlmParams,
      messages,
    };

    let message = '';
    try {
      onLogger?.('AR_REQUEST', {
        name: context.companyName,
        params: currentParams,
        attempt: i + 1,
      });

      onRequest?.();

      const llmResponse = await makeLLMRequest(currentParams);
      const processedMessage = await llmExtractLinks(llmResponse);
      const normalizedText = fullNormalize(processedMessage.text);
      generations.push({ ...processedMessage, text: normalizedText });
      message = llmRestoreLinks(
        { ...processedMessage, text: normalizedText },
        context.personalChannel
      );

      llmDefaultValidation(normalizedText, stage);

      const { isValid, error } = llmLanguageValidation(
        normalizedText,
        [
          JSON.stringify(context),
          combinedMessages.map((msg) => msg.content).join(' '),
        ].join(' '),
        context.language
      );

      if (!isValid) {
        throw new Error(error);
      }

      llmCustomValidation(normalizedText, processedMessage, stage, finalPart);

      onLogger?.('AR_RESPONSE', {
        name: context.companyName,
        attempt: i + 1,
        message,
      });

      return { ...processedMessage, text: normalizedText };
    } catch (error: any) {
      const errorMessage = error.message || 'UNDEFINED_ERROR';
      errors.push(errorMessage);

      onTry?.(errorMessage);
      onLogger?.('AR_ERROR', {
        name: context.companyName,
        message,
        error: errorMessage,
        attempt: i + 1,
      });

      if (i < maxRetries - 1) {
        await sleep(LLM_CONSTANTS.DEFAULT_RETRY_DELAY);
      }
    }
  }

  if (generations.length > 0) {
    onThrow?.(`** GENERATION_ERROR **
_____________
GENERATIONS:
${generations.map((g, i) => `${i + 1}: ${llmRestoreLinks(g)}`).join('\n')}
ERRORS:
${errors.map((e, i) => `${i + 1}: ${e}`).join('\n')}
_____________`);
    return generations[generations.length - 1];
  }

  throw new Error('STOPPED_ERROR');
}

function createAutoResponsePrompt(
  context: AutoResponse,
  options: {
    stage: number;
    finalPart: string;
    config: AutoResponseConfig;
  }
): string {
  const { config, stage, finalPart } = options;

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

  return `<USER_PROFILE>
  ${userName ? `[NAME]${userName}[/NAME]` : ''}
  ${userGender ? `[GENDER]${userGender}[/GENDER]` : ''}
  [STATUS]First-time contact[/STATUS]
  [KNOWLEDGE]Zero prior interaction, need to interest and talk about the offer/product[/KNOWLEDGE]
</USER_PROFILE>

<ASSISTANT_IDENTITY>
  [NAME]${meName}[/NAME]
  [GENDER]${meGender}[/GENDER]
  [ROLE]${aiRole}[/ROLE]
  [COMMUNICATION_MODE]Direct messaging - you are writing a message to be sent immediately[/COMMUNICATION_MODE]
  [INTERACTION_STYLE]Live chat format - write as if typing directly to the prospect[/INTERACTION_STYLE]
  [TEMPORAL_CONTEXT]You are responding to messages you just received - react to the latest context, not the entire history[/TEMPORAL_CONTEXT]

  [MISSION]    
    ${stage >= 2 ? `[OBJECTIVE]${isLead ? leadGoal : goal}[/OBJECTIVE]` : ''}
    
    [TASK]
      - Generate responses for cold leads
      - Craft precisely ${messagesCount} sentences
      - Target length: ${messagesCount * 75} characters
      - Discuss the offer and its benefits
      - End with a question
    [/TASK]
    
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

  [REQUIREMENTS]
    [LANGUAGE]Use ONLY ${language.toUpperCase()}[/LANGUAGE]
    [LENGTH]Target response length: ${messagesCount * 75} characters[/LENGTH]
    [STRUCTURE]${messagesCount} sentences[/STRUCTURE]
    [STYLE]Professional but conversational[/STYLE]
  [/REQUIREMENTS]

  [CURRENT_DATE_TIME]${llmDateNow()}[/CURRENT_DATE_TIME]
    
  [CONTEXT]
    [COMPANY_OFFERING]${companyDescription}[/COMPANY_OFFERING]
    ${stage !== 1 && flowHandling ? `[DIALOGUE_FLOW]${flowHandling}[/DIALOGUE_FLOW]` : ''}
    ${stage !== 1 && addedInformation ? `[CONTEXTUAL_DATA]${addedInformation}[/CONTEXTUAL_DATA]` : ''}
  [/CONTEXT]

</ASSISTANT_IDENTITY>`;
}

function createRetryPrompt(lastMessage: string, lastError: string): string {
  return `<ERROR_DETAILS>
  [ERROR_TYPE]VALIDATION ERROR[/ERROR_TYPE]
  [ERROR_MESSAGE]${lastError}[/ERROR_MESSAGE]
  [GENERATED_VARIANT]${lastMessage}[/GENERATED_VARIANT]
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
