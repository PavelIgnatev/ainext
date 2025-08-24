import emojiRegex from 'emoji-regex';

export function fullNormalize(message: string): string {
  let normalized = message
    .replace(/\*/g, '')
    .replace(/!/g, '.')
    .replace(emojiRegex(), '')
    .replace('<ASSISTANT>:', '')
    .replace('<ASSISTANT>', '')
    .replaceAll(/[`『』「」]/g, '')
    .replace('т.me', 't.me')
    .replace('т.ме', 't.me')
    .replace('т. ме', 't.me')
    .replace('т.мe', 't.me')
    .replace('т. мe', 't.me')
    .replace('т.мe', 't.me')
    .replace('т. мe', 't.me')
    .replace('т.me', 't.me')
    .replace('т. me', 't.me')
    .replace('nt.me', 't.me')
    .replace('nt. me', 't.me')
    .replace('т .me', 't.me')
    .replace('т. me', 't.me')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\\n/g, '\n')
    .trim();

  return normalized;
}
