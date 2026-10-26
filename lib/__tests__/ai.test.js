import { getAIConfig, sendChatCompletion } from "@/lib/ai";

describe("AI Service (lib/ai.js)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getAIConfig()", () => {
    it("should default to 9router with default settings", () => {
      delete process.env.AI_PROVIDER;
      delete process.env.NINEROUTER_BASE_URL;
      delete process.env.NINEROUTER_API_KEY;
      delete process.env.NINEROUTER_MODEL;

      const config = getAIConfig();
      expect(config.provider).toBe("9router");
      expect(config.baseUrl).toBe("http://127.0.0.1:20128/v1");
      expect(config.model).toBe("auto");
      expect(config.apiKey).toBe("");
    });

    it("should read custom 9Router configuration", () => {
      process.env.AI_PROVIDER = "9router";
      process.env.NINEROUTER_BASE_URL = "http://localhost:20128/v1/";
      process.env.NINEROUTER_API_KEY = "test-9router-key";
      process.env.NINEROUTER_MODEL = "anthropic/claude-3-5-sonnet";

      const config = getAIConfig();
      expect(config.provider).toBe("9router");
      expect(config.baseUrl).toBe("http://localhost:20128/v1"); // Trailing slash stripped
      expect(config.apiKey).toBe("test-9router-key");
      expect(config.model).toBe("anthropic/claude-3-5-sonnet");
    });

    it("should support fallback to ollama provider when configured", () => {
      process.env.AI_PROVIDER = "ollama";
      process.env.OLLAMA_BASE_URL = "http://localhost:11434/";
      process.env.OLLAMA_MODEL = "qwen2.5:3b";

      const config = getAIConfig();
      expect(config.provider).toBe("ollama");
      expect(config.baseUrl).toBe("http://localhost:11434");
      expect(config.model).toBe("qwen2.5:3b");
    });
  });

  describe("sendChatCompletion() with 9Router", () => {
    beforeEach(() => {
      delete process.env.AI_PROVIDER;
      process.env.NINEROUTER_BASE_URL = "http://127.0.0.1:20128/v1";
      process.env.NINEROUTER_API_KEY = "test-secret-key";
      process.env.NINEROUTER_MODEL = "openai/gpt-4o-mini";
    });

    it("should send OpenAI-compatible payload and return parsed response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "chatcmpl-123",
          model: "openai/gpt-4o-mini",
          choices: [
            {
              message: {
                role: "assistant",
                content: "Hello! I can help you learn English.",
              },
            },
          ],
        }),
      });

      const messages = [
        { role: "system", content: "You are a teacher." },
        { role: "user", content: "Hi" },
      ];

      const result = await sendChatCompletion({ messages });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:20128/v1/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer test-secret-key",
          }),
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages,
            temperature: 0.7,
            stream: false,
          }),
        }),
      );

      expect(result).toEqual({
        content: "Hello! I can help you learn English.",
        model: "openai/gpt-4o-mini",
        provider: "9router",
      });
    });

    it("should omit Authorization header when API key is empty", async () => {
      process.env.NINEROUTER_API_KEY = "";

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: "Response without auth" } }],
        }),
      });

      await sendChatCompletion({ messages: [{ role: "user", content: "Hi" }] });

      const callHeaders = global.fetch.mock.calls[0][1].headers;
      expect(callHeaders.Authorization).toBeUndefined();
    });

    it("should throw descriptive error on 401 unauthorized", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: "Invalid API key" } }),
      });

      await expect(
        sendChatCompletion({ messages: [{ role: "user", content: "Hi" }] }),
      ).rejects.toThrow(/Autentikasi 9Router gagal/);
    });

    it("should throw descriptive error on 404 model not found", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "Model not found" } }),
      });

      await expect(
        sendChatCompletion({ messages: [{ role: "user", content: "Hi" }] }),
      ).rejects.toThrow(/Model 'openai\/gpt-4o-mini' atau endpoint tidak ditemukan/);
    });

    it("should throw descriptive error on 429 rate limit", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "Rate limit exceeded" } }),
      });

      await expect(
        sendChatCompletion({ messages: [{ role: "user", content: "Hi" }] }),
      ).rejects.toThrow(/Batas kuota \/ rate limit pada upstream provider 9Router/);
    });

    it("should handle network connection errors", async () => {
      global.fetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

      await expect(
        sendChatCompletion({ messages: [{ role: "user", content: "Hi" }] }),
      ).rejects.toThrow(/Gagal terhubung ke 9Router/);
    });
  });

  describe("sendChatCompletion() with Ollama fallback", () => {
    beforeEach(() => {
      process.env.AI_PROVIDER = "ollama";
      process.env.OLLAMA_BASE_URL = "http://127.0.0.1:11434";
      process.env.OLLAMA_MODEL = "qwen2.5:1.5b";
    });

    it("should send Ollama native chat format", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          message: {
            role: "assistant",
            content: "Ollama reply",
          },
        }),
      });

      const messages = [{ role: "user", content: "Hi" }];
      const result = await sendChatCompletion({ messages });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:11434/api/chat",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen2.5:1.5b",
            messages,
            stream: false,
            options: {
              temperature: 0.7,
            },
          }),
        }),
      );

      expect(result).toEqual({
        content: "Ollama reply",
        model: "qwen2.5:1.5b",
        provider: "ollama",
      });
    });
  });
});
