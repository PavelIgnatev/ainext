interface StatusResponse {
  status: 'negative' | 'lead' | 'continue';
  reason: string;
}

function findAllJsonObjects(input: string): Record<string, any>[] {
  if (!input) return [];

  const results: Record<string, any>[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const jsonCandidate = input.slice(start, i + 1);
        try {
          const parsed = JSON.parse(jsonCandidate);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            results.push(parsed);
          }
        } catch {}
        start = -1;
      }
    }
  }

  return results;
}

export function extractJsonResponse(input: string): StatusResponse | null {
  if (!input) return null;

  try {
    const allObjects = findAllJsonObjects(input);

    const validObjects = allObjects
      .map((obj) => {
        const status = String(obj.status || '').toLowerCase();
        const reason = String(obj.reason || '');

        if (
          status &&
          reason &&
          ['negative', 'lead', 'continue'].includes(status)
        ) {
          return {
            status: status as StatusResponse['status'],
            reason,
          };
        }
        return null;
      })
      .filter((obj): obj is StatusResponse => obj !== null);

    return validObjects.length > 0 ? validObjects[0] : null;
  } catch (e) {
    return null;
  }
}
