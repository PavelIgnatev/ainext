import type { LlmProcessedText } from './llmLink';

type ValidationFunction = (
  message: string,
  stage: number,
  processedMessage: LlmProcessedText,
  finalPart: string
) => { isValid: boolean; error?: string };

function validateQuestionMarkInEarlyStages(
  message: string,
  stage: number,
  _processedMessage: LlmProcessedText,
  _finalPart: string
) {
  if (stage <= 2 && !message.includes('?')) {
    return {
      isValid: false,
      error:
        'Missing question mark\n' +
        'REASON: In early dialogue stages (stage <= 2) response must contain a question\n' +
        'REQUIREMENT: Add a question with a question mark\n' +
        'HOW TO FIX: Rephrase the response by adding a clarifying question',
    };
  }
  return { isValid: true };
}

function validateMinimumSentences(
  message: string,
  stage: number,
  _processedMessage: LlmProcessedText,
  _finalPart: string
) {
  const minSentences = stage <= 2 ? 3 : 2;
  const sentences = message
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0);

  if (sentences.length < minSentences) {
    return {
      isValid: false,
      error:
        `Insufficient number of sentences\n` +
        `REASON: Stage ${stage} requires minimum ${minSentences} sentences\n` +
        'REQUIREMENT: Message must contain complete sentences separated by . ! or ?\n' +
        'EXAMPLES OF VALID INPUT:\n' +
        '- "First sentence. Second sentence. Third sentence?"\n' +
        'HOW TO FIX: Add more complete sentences to meet the minimum requirement',
    };
  }
  return { isValid: true };
}

function validateNoLinksInFirstStage(
  _message: string,
  stage: number,
  processedMessage: LlmProcessedText,
  _finalPart: string
) {
  if (stage === 1 && processedMessage.links.size > 0) {
    return {
      isValid: false,
      error:
        'Links detected in message\n' +
        'REASON: Links are not allowed in the first stage of dialogue\n' +
        'REQUIREMENT: Avoid using URLs and web links\n' +
        'HOW TO FIX: Provide information without using links',
    };
  }
  return { isValid: true };
}

function validateFinalPart(
  message: string,
  _stage: number,
  processedMessage: LlmProcessedText,
  finalPart: string
) {
  if (!finalPart) return { isValid: true };

  const hasLinkInOriginal = Array.from(processedMessage.links.values()).some(
    (link) => link.toLowerCase().includes(finalPart.toLowerCase())
  );

  if (!hasLinkInOriginal) {
    return {
      isValid: false,
      error:
        `Required text "${finalPart}" is missing\n` +
        'REASON: The response must include the specified text\n' +
        'REQUIREMENT: Include the exact text in the response\n' +
        'HOW TO FIX: Add the required text exactly as specified',
    };
  }
  return { isValid: true };
}

export const CUSTOM_VALIDATION_RULES: ValidationFunction[] = [
  validateQuestionMarkInEarlyStages,
  validateMinimumSentences,
  validateNoLinksInFirstStage,
  validateFinalPart,
];

export function llmCustomValidation(
  message: string,
  processedMessage: LlmProcessedText,
  stage: number,
  finalPart: string
) {
  for (const validation of CUSTOM_VALIDATION_RULES) {
    const result = validation(
      message.toLowerCase(),
      stage,
      processedMessage,
      finalPart
    );
    if (!result.isValid) {
      throw new Error(result.error);
    }
  }
}
