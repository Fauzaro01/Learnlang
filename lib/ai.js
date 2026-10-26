/**
 * AI Service Provider Abstraction
 * Supports 9Router (default, OpenAI-compatible) and Ollama (legacy fallback)
 */

export function getAIConfig() {
  const provider = (process.env.AI_PROVIDER || "9router").toLowerCase();

  if (provider === "ollama") {
    const rawBaseUrl =
      process.env.OLLAMA_BASE_URL ||
      process.env.OLLAMA_API_URL ||
      "http://127.0.0.1:11434";
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");
    const model = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";

    return {
      provider: "ollama",
      baseUrl,
      model,
      apiKey: null,
    };
  }

  // Default to 9Router
  const rawBaseUrl =
    process.env.NINEROUTER_BASE_URL || "http://127.0.0.1:20128/v1";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const model = process.env.NINEROUTER_MODEL || "auto";
  const apiKey = process.env.NINEROUTER_API_KEY || "";

  return {
    provider: "9router",
    baseUrl,
    model,
    apiKey,
  };
}

/**
 * Fetch available models from 9Router GET /models
 */
export async function getAvailable9RouterModels(config) {
  try {
    const headers = {};
    if (config.apiKey && config.apiKey.trim().length > 0) {
      headers["Authorization"] = `Bearer ${config.apiKey.trim()}`;
    }
    const res = await fetch(`${config.baseUrl}/models`, {
      method: "GET",
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        return data.data.map((item) => item.id).filter(Boolean);
      }
    }
  } catch {
    // Ignore fetch errors during discovery
  }
  return [];
}

/**
 * Send chat messages to the configured AI provider.
 *
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages - Sanitized chat messages
 * @param {number} [options.temperature=0.7] - Sampling temperature
 * @param {number} [options.timeoutMs=30000] - Request timeout in milliseconds
 * @param {AbortSignal} [options.signal] - Optional external abort signal
 * @returns {Promise<{content: string, model: string, provider: string}>}
 */
export async function sendChatCompletion({
  messages = [],
  temperature = 0.7,
  timeoutMs = 30000,
  signal: externalSignal,
}) {
  const config = getAIConfig();

  // Combine timeout signal with external signal if available
  const timeoutController = new AbortController();
  const timer = setTimeout(() => {
    timeoutController.abort(new Error(`AI request timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  const abortListener = () => timeoutController.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      throw new Error("Request was aborted");
    }
    externalSignal.addEventListener("abort", abortListener, { once: true });
  }

  try {
    if (config.provider === "ollama") {
      return await sendOllamaChat({
        config,
        messages,
        temperature,
        signal: timeoutController.signal,
      });
    }

    return await send9RouterChat({
      config,
      messages,
      temperature,
      signal: timeoutController.signal,
    });
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", abortListener);
    }
  }
}

/**
 * Helper to execute a single completion request to 9Router
 */
async function execute9RouterRequest({ baseUrl, apiKey, model, messages, temperature, signal }) {
  const url = `${baseUrl}/chat/completions`;
  const headers = {
    "Content-Type": "application/json",
  };

  if (apiKey && apiKey.trim().length > 0) {
    headers["Authorization"] = `Bearer ${apiKey.trim()}`;
  }

  const payload = {
    model,
    messages,
    temperature,
    stream: false,
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError" || signal?.aborted) {
      throw new Error("Permintaan ke 9Router melebihi batas waktu (timeout).");
    }
    throw new Error(
      `Gagal terhubung ke 9Router di ${baseUrl}. Pastikan service 9Router berjalan: ${err.message}`,
    );
  }

  return response;
}

/**
 * 9Router Chat Completion (OpenAI-compatible) with auto-discovery and smart fallback
 */
async function send9RouterChat({ config, messages, temperature, signal }) {
  let targetModel = config.model;

  // Auto-discovery mode: if model is "auto" or empty, fetch first available model from 9Router
  if (!targetModel || targetModel.toLowerCase() === "auto") {
    const available = await getAvailable9RouterModels(config);
    if (available.length > 0) {
      targetModel = available[0];
    } else {
      targetModel = "free-combo"; // fallback to common 9Router combo if models endpoint is empty
    }
  }

  let response = await execute9RouterRequest({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: targetModel,
    messages,
    temperature,
    signal,
  });

  // If 404 or entity not found, try auto-fallback to available models in 9Router
  if (!response.ok && response.status === 404) {
    const available = await getAvailable9RouterModels(config);
    const candidate = available.find((m) => m !== targetModel);

    if (candidate) {
      console.warn(
        `[9Router] Model '${targetModel}' 404, otomatis mencoba fallback ke model '${candidate}'...`,
      );
      const retryResponse = await execute9RouterRequest({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: candidate,
        messages,
        temperature,
        signal,
      });

      if (retryResponse.ok) {
        response = retryResponse;
        targetModel = candidate;
      }
    }

    // If still not ok after candidate fallback
    if (!response.ok && response.status === 404) {
      let errorMessage = `9Router returned status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson?.error?.message) {
          errorMessage = errorJson.error.message;
        } else if (typeof errorJson?.message === "string") {
          errorMessage = errorJson.message;
        }
      } catch {
        const text = await response.text().catch(() => "");
        if (text) errorMessage = text;
      }

      const availableHint =
        available.length > 0
          ? ` Model aktif yang terdeteksi di 9Router Anda: [${available.join(", ")}].`
          : " Pastikan sudah ada model atau provider yang aktif di dashboard 9Router (http://localhost:20128).";

      throw new Error(
        `Model '${targetModel}' atau endpoint tidak ditemukan di 9Router (${config.baseUrl}): ${errorMessage}.${availableHint}`,
      );
    }
  }

  if (!response.ok) {
    let errorMessage = `9Router returned status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error?.message) {
        errorMessage = errorJson.error.message;
      } else if (typeof errorJson?.message === "string") {
        errorMessage = errorJson.message;
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) errorMessage = text;
    }

    if (response.status === 401) {
      throw new Error(
        `Autentikasi 9Router gagal: ${errorMessage}. Periksa NINEROUTER_API_KEY pada environment.`,
      );
    } else if (response.status === 429) {
      throw new Error(
        `Batas kuota / rate limit pada upstream provider 9Router tercapai (${errorMessage}). Coba lagi beberapa saat lagi.`,
      );
    }

    throw new Error(`9Router error: ${errorMessage}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  const reply = choice?.message?.content?.trim();

  if (!reply) {
    throw new Error("9Router mengembalikan respons kosong.");
  }

  return {
    content: reply,
    model: data?.model || targetModel,
    provider: "9router",
  };
}

/**
 * Ollama Chat Completion (Legacy fallback)
 */
async function sendOllamaChat({ config, messages, temperature, signal }) {
  const url = `${config.baseUrl}/api/chat`;
  const headers = {
    "Content-Type": "application/json",
  };

  const payload = {
    model: config.model,
    messages,
    stream: false,
    options: {
      temperature,
    },
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError" || signal?.aborted) {
      throw new Error("Permintaan ke Ollama melebihi batas waktu (timeout).");
    }
    throw new Error(
      `Gagal terhubung ke Ollama server di ${config.baseUrl}: ${err.message}`,
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Ollama server error status ${response.status}`);
  }

  const data = await response.json();
  const reply = data?.message?.content?.trim();

  if (!reply) {
    throw new Error("Ollama mengembalikan respons kosong.");
  }

  return {
    content: reply,
    model: config.model,
    provider: "ollama",
  };
}
