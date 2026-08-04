const MODELS = [
  "@cf/meta/llama-3.2-3b-instruct",
  "@cf/meta/llama-3.2-1b-instruct",
];

export async function callAIWithFallback(env, messages, maxTokens = 1024) {
  let lastError;
  for (const model of MODELS) {
    try {
      const result = await callAIWithRetry(env, model, messages, maxTokens);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`AI fallback: model ${model} failed, trying next...`);
    }
  }
  throw lastError;
}

async function callAIWithRetry(env, model, messages, maxTokens, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await env.AI.run(model, { messages, max_tokens: maxTokens });
    } catch (err) {
      lastError = err;
      const msg = String(err.message || err);
      if (isRetryableError(msg) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`AI retry: model ${model} throttled, attempt ${attempt + 1}/${retries} after ${Math.round(delay)}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function isRetryableError(msg) {
  return ['429', '503', 'Throttled', 'rate'].some(keyword => msg.includes(keyword));
}

export function parseAIResponse(rawContent) {
  const cleaned = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // 小模型经常在 JSON 前后夹带解释文字，尝试提取其中的 JSON 对象
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // 提取失败则原样返回，交给调用方兜底
      }
    }
    return cleaned;
  }
}

export function createErrorResponse(error, detail = null, status = 500) {
  return new Response(
    JSON.stringify({ error, detail: detail ? String(detail) : null }),
    { status, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}

export function createSuccessResponse(data) {
  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}