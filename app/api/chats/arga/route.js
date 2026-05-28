import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
const DEFAULT_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

function buildMessages(userMessages = []) {
  const sanitizedMessages = Array.isArray(userMessages)
    ? userMessages
        .filter(
          (message) =>
            message &&
            typeof message.content === "string" &&
            message.content.trim().length > 0 &&
            ["user", "assistant"].includes(message.role),
        )
        .slice(-12)
    : [];

  return [
    {
      role: "system",
      content:
        "Kamu adalah Arga AI, asisten belajar bahasa Inggris yang ramah, hangat, dan singkat. Jawab dalam bahasa Indonesia yang jelas kecuali jika pengguna meminta bahasa Inggris. Fokus pada pembelajaran, koreksi, contoh kalimat, dan penjelasan yang mudah dipahami.",
    },
    ...sanitizedMessages.map((message) => ({
      role: message.role,
      content: message.content.trim(),
    })),
  ];
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const key = getRateLimitKey(session.user.id);
    if (!limiters.general.isAllowed(key)) {
      return jsonResponse(ApiResponse.rateLimit(), 429);
    }
    limiters.general.increment(key);

    const body = await req.json().catch(() => ({}));
    const messages = buildMessages(body?.messages || []);

    const response = await fetch(`${DEFAULT_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return jsonResponse(
        ApiResponse.internalError(
          errorText || "Gagal terhubung ke Ollama server",
        ),
        502,
      );
    }

    const data = await response.json();
    const reply =
      data?.message?.content?.trim() || "Maaf, Arga AI belum memiliki jawaban.";

    return jsonResponse(
      ApiResponse.success({
        message: {
          role: "assistant",
          content: reply,
          model: DEFAULT_MODEL,
        },
      }),
      200,
    );
  } catch (error) {
    return jsonResponse(
      ApiResponse.internalError(error.message || "Gagal memproses Arga AI"),
      500,
    );
  }
}
