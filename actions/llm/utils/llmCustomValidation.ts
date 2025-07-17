import type { LlmProcessedText } from './llmLink';
import { findPotentialDomains } from './llmLink';

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
  if (stage <= 2) {
    if (!message.includes('?')) {
      return {
        isValid: false,
        error:
          'Missing question mark\n' +
          'REASON: In early dialogue stages (stage <= 2) response must contain a question\n' +
          'REQUIREMENT: Add a question with a question mark\n' +
          'HOW TO FIX: Rephrase the response by adding a clarifying question',
      };
    }

    if (!message.trim().endsWith('?')) {
      const questionMatch = message.match(/[^.!?]*\?/);
      const exampleQuestion = questionMatch![0].trim();

      return {
        isValid: false,
        error:
          'Question must be at the end of message\n' +
          'REASON: In early dialogue stages (stage <= 2) the question must be the very last part\n' +
          'REQUIREMENT: Move the question to the end of your response\n' +
          'HOW TO FIX: Restructure your response so it ends with: "' +
          exampleQuestion +
          '"\n' +
          'EXAMPLE: "Your statement text. Your explanation. ' +
          exampleQuestion +
          '"',
      };
    }
  }
  return { isValid: true };
}

function validateMinimumSentences(
  message: string,
  stage: number,
  _processedMessage: LlmProcessedText,
  _finalPart: string
) {
  const minSentences = stage <= 2 ? 3 : stage <= 4 ? 2 : 1;
  const sentences = message
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 0);

  if (sentences.length < minSentences) {
    const currentCount = sentences.length;
    const needed = minSentences - currentCount;

    return {
      isValid: false,
      error:
        `NOT ENOUGH SENTENCES - ADD MORE TEXT!\n` +
        `CURRENT: ${currentCount} sentences | REQUIRED: ${minSentences} sentences\n` +
        `ACTION NEEDED: Add ${needed} more complete sentence${needed > 1 ? 's' : ''} to your response\n` +
        `SOLUTION: Simply write ${needed} additional sentence${needed > 1 ? 's' : ''} with proper punctuation (. ! or ?)\n` +
        `EXAMPLE: Your current text + "Additional sentence. Another sentence." + more if needed`,
    };
  }
  return { isValid: true };
}

function validateNoPotentialLinksInFirstStage(
  message: string,
  stage: number,
  _processedMessage: LlmProcessedText,
  _finalPart: string
) {
  if (stage === 1) {
    const potentialDomains = findPotentialDomains(message);
    if (potentialDomains.length > 0) {
      return {
        isValid: false,
        error:
          `Potential links detected in message: ${potentialDomains.join(', ')}\n` +
          'REASON: Any URLs or domain names are not allowed in the first stage of dialogue\n' +
          'REQUIREMENT: Avoid mentioning websites, domains, or any text that looks like a link\n' +
          'HOW TO FIX: Remove or rephrase any website references, domain names, or URL-like text\n' +
          'EXAMPLES TO AVOID: aisender.com, www.example.com, example.ru, site.org',
      };
    }
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

  const partForCheck = finalPart.startsWith('@')
    ? finalPart.slice(1)
    : finalPart;
  const hasLinkInOriginal = Array.from(processedMessage.links.values()).some(
    (link) => link.toLowerCase().includes(finalPart.toLowerCase())
  );

  if (
    !(
      message.toLowerCase().includes(partForCheck.toLowerCase()) ||
      hasLinkInOriginal
    )
  ) {
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
  validateNoPotentialLinksInFirstStage,
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
