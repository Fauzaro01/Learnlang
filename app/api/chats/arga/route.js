import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";
import { sendChatCompletion } from "@/lib/ai";

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

    const result = await sendChatCompletion({
      messages,
      temperature: 0.7,
      signal: req.signal,
    });

    return jsonResponse(
      ApiResponse.success({
        message: {
          role: "assistant",
          content: result.content,
          model: result.model,
          provider: result.provider,
        },
      }),
      200,
    );
  } catch (error) {
    const isNetworkOrTimeout =
      error.message?.includes("timed out") ||
      error.message?.includes("Gagal terhubung") ||
      error.message?.includes("timeout");

    const errorPayload = ApiResponse.internalError(
      error.message || "Gagal memproses Arga AI",
    );
    // Provide error property for compatibility with frontend error readers
    errorPayload.error = error.message || "Gagal memproses Arga AI";

    return jsonResponse(
      errorPayload,
      isNetworkOrTimeout ? 502 : 500,
    );
  }
}
