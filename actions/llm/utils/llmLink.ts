export interface LlmProcessedText {
  text: string;
  links: Map<string, string>;
}
export function findPotentialDomains(text: string): string[] {
  const cleaned = text.replace(/\n/g, ' ');
  const regex =
    /(?:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(?:(?:https?:\/\/)?(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9-]+)(?::\d+)?(?:\/\S*)?)/gi;

  const raw = cleaned.match(regex) || [];
  return Array.from(
    new Set(
      raw.map((m) => {
        let cur = m;
        cur = cur.replace(/[>\.,!?]+$/g, '');
        const opensPar = (cur.match(/\(/g) || []).length;
        const closesPar = (cur.match(/\)/g) || []).length;
        if (closesPar > opensPar) {
          cur = cur.replace(new RegExp(`\\){${closesPar - opensPar}}$`), '');
        }
        const opensSq = (cur.match(/\[/g) || []).length;
        const closesSq = (cur.match(/\]/g) || []).length;
        if (closesSq > opensSq) {
          cur = cur.replace(new RegExp(`\\]{${closesSq - opensSq}}$`), '');
        }
        const parts = cur.match(/^((?:https?:\/\/)?[^\/?]+)([\s\S]*)$/i);
        if (parts) {
          cur = parts[1].toLowerCase() + parts[2];
        } else {
          cur = cur.toLowerCase();
        }
        return cur;
      })
    )
  );
}

async function llmCheckUrl(url: string): Promise<boolean> {
  try {
    const hostname = url.replace(/^https?:\/\//, '').split('/')[0];
    const response = await fetch(
      `https://dns.google/resolve?name=${hostname}&type=A`
    );
    const data = await response.json();
    return Boolean(data.Answer?.length);
  } catch {
    return false;
  }
}

export async function llmExtractLinks(text: string): Promise<LlmProcessedText> {
  let processedText = text;
  const links = new Map<string, string>();
  const domains = findPotentialDomains(text);

  const checks = await Promise.all(
    domains.map(async (domain) => ({
      domain,
      isValid: await llmCheckUrl(domain),
    }))
  );

  for (const { domain, isValid } of checks) {
    if (isValid) {
      const placeholder = `LINK${Math.floor(Math.random() * 10 ** 10)}`;
      links.set(
        placeholder,
        domain
          .replace('https://t.me', 't.me')
          .replace('http://t.me', 't.me')
          .replace(/\*+$/, '')
      );
      processedText = processedText.replace(domain, placeholder);
    }
  }

  return {
    text: processedText,
    links,
  };
}

export function llmRestoreLinks(
  processedText: LlmProcessedText,
  personalChannel?: string
): string {
  let restoredText = processedText.text;

  if (personalChannel) {
    const personalChannelUrl = `t.me/${personalChannel}`;
    processedText.links.forEach((_, placeholder) => {
      restoredText = restoredText.replace(placeholder, personalChannelUrl);
    });
  } else {
    processedText.links.forEach((url, placeholder) => {
      restoredText = restoredText.replace(placeholder, url);
    });
  }
  return restoredText;
}
