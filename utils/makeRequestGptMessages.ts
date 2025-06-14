import emojiRegex from 'emoji-regex';

import FrontendApi from '../api/frontend/frontend';
import { validateText } from './validationText';

function filterString(str: string, part: string | null, replaceValue: string) {
  if (!part) {
    return str;
  }

  const escapedPart = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return str.replace(new RegExp(escapedPart, 'gi'), replaceValue);
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function addSpaceAfterPunctuation(str: string) {
  const urlRegex =
    /((http|https):\/\/)?(www\.)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9\&\;\:\.\?\=\-\_\+\%\'\~\#]*)*/g;

  let match;
  const urls = [];
  while ((match = urlRegex.exec(str)) !== null) {
    urls.push({ start: match.index, end: match.index + match[0].length });
  }

  let result = '';

  for (let i = 0; i < str.length; i++) {
    const inUrl = urls.some((url) => i >= url.start && i < url.end);

    if (
      !inUrl &&
      /[,.?!;:]/.test(str[i]) &&
      i + 1 < str.length &&
      /\S/.test(str[i + 1])
    ) {
      result += str[i] + ' ';
    } else {
      result += str[i];
    }
  }

  if (str !== result) {
    console.log(`
**ПРАВКИ ПУНКТУАЦИИ**
СООБЩЕНИЕ ДО: ${str}
СООБЩЕНИЕ ПОСЛЕ: ${result}`);
  }

  return result;
}

function countSentences(paragraph: string) {
  const sentenceEnders = ['.', '!', '?'];
  let sentenceCount = 0;

  for (let i = 0; i < paragraph.length; i++) {
    if (sentenceEnders.includes(paragraph[i])) {
      sentenceCount++;
    }
  }

  return sentenceCount;
}

function removeGreetings(text: string) {
  const greetings = [
    'Приветствую всех участников',
    'Приветствую всех вас',
    'Приветствую всех',
    'Приветствую, коллеги',
    'Приветствую, друзья',
    'Рад приветствовать',
    'Рад всех видеть',
    'Рад видеть всех',
    'Доброе время суток',
    'Рад вас видеть',
    'Рад видеть',
    'Рада видеть',
    'Привет-привет',
    'Доброго времени суток',
    'Доброго времени',
    'Добрейшего дня',
    'Приветствую',
    'Приветики',
    'Доброе утро',
    'Добрый вечер',
    'Добрый день',
    'Доброго утра',
    'Доброго вечера',
    'Доброго дня',
    'С добрым утречком',
    'С добрым утром',
    'С добрым днем',
    'С добрым вечером',
    'Добрый полдень',
    'Приветик',
    'Здравствуйте',
    'Здравствуй',
    'Привет',
    'Хэй',
    'Хай',
    'Доброго',
  ];

  const followUpWords = [
    'уважаемые коллеги',
    'дорогие друзья',
    'господа и дамы',
    'уважаемые партнеры',
    'коллеги мои',
    'друзья мои',
    'всех вас',
    'моих коллег',
    'наших гостей',
    'дорогие',
    'уважаемые',
    'господа',
    'товарищи',
    'коллеги',
    'друзья',
    'друг',
    'тебя',
    'вас',
    'вам',
    'тебе',
    'наши',
    'дня',
    'вечера',
    'утра',
    'времени',
    'суток',
    'благодарю',
  ];

  greetings.forEach((greeting) => {
    followUpWords.forEach((followUp) => {
      const regex = new RegExp(`${greeting}\\s${followUp}[\\.,!]?`, 'gi');
      text = text.replace(regex, '');
    });

    const regexSingleGreeting = new RegExp(`${greeting}[\\.,!]?`, 'gi');
    text = text.replace(regexSingleGreeting, '');
  });

  return text.trim();
}

function containsIdeographicOrArabic(str: string) {
  const ideographicAndArabicRegex =
    /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  return ideographicAndArabicRegex.test(str);
}

export async function makeRequestGptMessages(
  messages: {
    role: 'assistant' | 'system' | 'user';
    content: string;
  }[],
  part: string,
  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN' | 'ANY',
  disableLink: boolean,
  mandatoryQuestion: boolean,
  minimalProposalLength: number,
  isRemoveGreetings: boolean
) {
  console.log('--------------------------------------------------------');
  console.log(`Текущий messages: ${JSON.stringify(messages, null, 2)}`);
  console.log('Дополнительные фильтры:');
  console.log(`Удаление ссылки: ${disableLink ? 'включено' : 'выключено'}`);
  console.log(`Минимальное количество сообщений: ${minimalProposalLength}`);
  console.log(
    `Проверка на составную часть: ${part ? `включено (${part})` : 'выключено'}`
  );

  const errors: string[] = [];
  let lastGeneration = '';
  let i = 0;

  while (i !== 5) {
    try {
      const fixedMessages = messages.map((message) => {
        if (message.role !== 'system' || errors.length === 0) return message;

        return {
          ...message,
          content: `${message.content}
## MANDATORY REQUIREMENTS FOR REPLY
${errors.map((error) => `- **${error}**`).join('\n')}`,
        };
      });

      console.log(`Попытка: **${i + 1}/5**`);
      const { data: resultData } = await FrontendApi.gptGenerate(fixedMessages);
      const data = resultData?.message?.content?.[0]?.text || '';

      if (!data.trim()) {
        throw new Error('Пустое сообщение');
      }

      let message = filterString(
        data
          .replace(/\n/g, '')
          .replace(/\*/g, '')
          .replace(/!/g, '.')
          .replace(emojiRegex(), '')
          .replace('<ASSISTANT>:', '')
          .replace('<ASSISTANT>', '')
          .replaceAll(/[«»„“”‘’'"`『』「」]/g, '')
          .trim(),
        part || '',
        'mainlink'
      );

      const pattern =
        /((http|https):\/\/)?(www\.)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,6}(\/[a-zA-Z0-9\&\;\:\.\,\?\=\-\_\+\%\'\~\#]*)*/g;
      const hasTextLink = message.match(pattern);

      message = isRemoveGreetings ? removeGreetings(message) : message;
      if (hasTextLink && disableLink) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${message}\x1b[0m`
        );
        throw new Error(
          'The reply should not contain any references at this stage'
        );
      }

      if (
        message.includes('[') ||
        message.includes(']') ||
        message.includes('{') ||
        message.includes('}') ||
        message.includes('<') ||
        message.includes('>') ||
        message.includes('section') ||
        message.includes('sign')
      ) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${message}\x1b[0m`
        );
        throw new Error(
          'The response should not contain suspicious characters [],{},<>, the word "section" or "sign"'
        );
      }

      if (containsIdeographicOrArabic(message)) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${message}\x1b[0m`
        );
        throw new Error(
          'The answer must not contain Arabic characters or any hieroglyphics'
        );
      }

      lastGeneration = message;

      const varMessage = capitalizeFirstLetter(
        addSpaceAfterPunctuation(message)
      );

      if (mandatoryQuestion && !varMessage.includes('?')) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${varMessage}\x1b[0m`
        );
        throw new Error(
          'The question in the reply is mandatory. The question was not found. Add a question at the end of the line.'
        );
      }

      if (mandatoryQuestion && varMessage.length < 130) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${varMessage}\x1b[0m`
        );
        throw new Error('Minimum reply length 200 characters');
      }

      if (minimalProposalLength > countSentences(varMessage)) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${varMessage}\x1b[0m`
        );
        throw new Error(
          `The minimum number of sentences is ${minimalProposalLength}`
        );
      }

      if (part && !varMessage.includes('mainlink')) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${varMessage}\x1b[0m`
        );
        throw new Error(
          `The response does not contain the unique "${part}" part, even though it should contain`
        );
      }

      const text = validateText(JSON.stringify(messages), varMessage, language);
      if (text) {
        console.log(
          `\x1b[4mПотенциальное сообщение:\x1b[0m \x1b[36m${varMessage}\x1b[0m`
        );
        throw new Error(
          `The word ${text} is not allowed in reply, its use is prohibited`
        );
      }

      const resulted = filterString(
        varMessage.replace(/^[^a-zA-Zа-яА-Я]+/, ''),
        'mainlink',
        part || ''
      );
      console.log(`Успешно сгенерированный ответ: ${resulted}`);
      console.log('--------------------------------------------------------');
      return resulted;
    } catch (error: any) {
      console.log(`Ошибка запроса. ${error.message}`);

      if (
        error.message !==
          'The answer must not contain Arabic characters or any hieroglyphics' &&
        error.message !==
          'The response should not contain suspicious characters [],{},<>, the word "section" or "sign"'
      ) {
        i += 1;
      }

      errors.push(error.message);
    }
  }

  if (!lastGeneration) {
    throw new Error('Ошибка');
  }

  const resulted = filterString(
    lastGeneration.replace(/^[^a-zA-Zа-яА-Я]+/, ''),
    'mainlink',
    part || ''
  );
  console.log(`Ответ, сгенерированный при наличии ошибок: ${resulted}`);
  console.log('--------------------------------------------------------');
  return resulted;
}
