export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return '';
}

export function optionalNumber(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return parsed;
}

export function truncate(value, maxChars) {
  if (!value || value.length <= maxChars) return value || '';
  return `${value.slice(0, maxChars)}\n\n[truncated ${value.length - maxChars} characters]`;
}

export function formatDateRange(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Date range contains an invalid date');
  }

  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });
  const startMonth = month.format(start);
  const endMonth = month.format(end);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} ${startDay}–${endMonth} ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear}–${endMonth} ${endDay}, ${endYear}`;
}

export function parseJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Model response did not contain JSON: ${text}`);
    return JSON.parse(match[0]);
  }
}

export async function withRetry(label, operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = 500 * 2 ** (attempt - 1);
      console.warn(`${label} failed on attempt ${attempt}/${attempts}: ${error.message}. Retrying in ${delayMs}ms.`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

export async function githubJson(path, options = {}) {
  const token = requireEnv('DOCS_AUTOMATION_GITHUB_TOKEN');
  const response = await fetch(`https://api.github.com${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub API ${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

export async function githubText(path, options = {}) {
  const token = requireEnv('DOCS_AUTOMATION_GITHUB_TOKEN');
  const response = await fetch(`https://api.github.com${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: options.accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub API ${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return text;
}

export async function githubPaginated(path, maxItems = Infinity) {
  const items = [];
  let page = 1;

  while (items.length < maxItems) {
    const separator = path.includes('?') ? '&' : '?';
    const pagePath = `${path}${separator}per_page=100&page=${page}`;
    const batch = await githubJson(pagePath);
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return items.slice(0, maxItems);
}

export async function runModelChatCompletion({ system, user }) {
  const attempts = optionalNumber('DOCS_AUTOMATION_MODEL_RETRIES', 3);

  return withRetry('Model call', async () => {
    const apiKey = requireEnv('DOCS_AUTOMATION_API_KEY');
    const model = requireEnv('DOCS_AUTOMATION_MODEL');
    const apiUrl = chatCompletionsUrl(requireEnv('DOCS_AUTOMATION_API_URL'));
    const body = {
      model,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: `Workflow input:

${user}

Return only the JSON object requested by the workflow prompt.`,
        },
      ],
      temperature: 0.2,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Model call failed: ${response.status} ${text}`);
    }

    const parsed = text ? JSON.parse(text) : null;
    const content = parsed?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`Model response did not include message content: ${text}`);
    }
    return content.trim();
  }, attempts);
}

function chatCompletionsUrl(baseUrl) {
  const trimmed = baseUrl.replace(/\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) return trimmed;
  if (trimmed.endsWith('/openai/v1')) return `${trimmed}/chat/completions`;
  return `${trimmed}/openai/v1/chat/completions`;
}
