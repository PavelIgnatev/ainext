import emojiRegex from 'emoji-regex';

function trimmer(str: string): string {
  if (
    str.endsWith('.') ||
    str.endsWith(',') ||
    str.endsWith('!') ||
    str.endsWith('?')
  ) {
    return str.slice(0, -1);
  }
  return str;
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function addSpaceAfterPunctuation(str: string): string {
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

  return result;
}

function removeGreetings(text: string): string {
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

export function fullNormalize(message: string): string {
  let normalized = message
    .replace(/\*/g, '')
    .replace(/!/g, '.')
    .replace(emojiRegex(), '')
    .replace('<ASSISTANT>:', '')
    .replace('<ASSISTANT>', '')
    .replaceAll(/[`『』「」]/g, '')
    .replace('т.me', 't.me')
    .replace('т .me', 't.me')
    .replace('т. me', 't.me')
    .replace(/[^\S\n]+/g, ' ')
    .trim();

  // const finalMessage = capitalizeFirstLetter(
  //   addSpaceAfterPunctuation(normalized)
  // );

  return normalized;
}
