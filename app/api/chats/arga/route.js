import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT =
  "Kamu adalah Arga AI, asisten belajar bahasa Inggris yang ramah, hangat, dan singkat. Jawab dalam bahasa Indonesia yang jelas kecuali jika pengguna meminta bahasa Inggris. Fokus pada pembelajaran, koreksi, contoh kalimat, dan penjelasan yang mudah dipahami.";

/**
 * Convert conversation history to Gemini API format
 * Gemini expects contents array with role/parts structure
 */
function buildGeminiMessages(userMessages = []) {
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

  // Convert to Gemini format: each message becomes a content object with parts array
  const contents = sanitizedMessages.map((message) => ({
    role: message.role === "user" ? "user" : "model",
    parts: [
      {
        text: message.content.trim(),
      },
    ],
  }));

  return contents;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    if (!GOOGLE_API_KEY) {
      return jsonResponse(
        ApiResponse.internalError("GOOGLE_AI_API_KEY not configured"),
        500,
      );
    }

    const key = getRateLimitKey(session.user.id);
    if (!limiters.general.isAllowed(key)) {
      return jsonResponse(ApiResponse.rateLimit(), 429);
    }
    limiters.general.increment(key);

    const body = await req.json().catch(() => ({}));
    const contents = buildGeminiMessages(body?.messages || []);

    // Prepend system prompt as a model message for context
    const requestPayload = {
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "Saya siap membantu belajar bahasa Inggris." }],
        },
        ...contents,
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    };

    const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Gemini API error:", errorText);
      return jsonResponse(
        ApiResponse.internalError(errorText || "Gagal terhubung ke Gemini API"),
        502,
      );
    }

    const data = await response.json();

    // Extract response from Gemini format
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Maaf, Arga AI belum memiliki jawaban.";

    return jsonResponse(
      ApiResponse.success({
        message: {
          role: "assistant",
          content: reply,
          model: GEMINI_MODEL,
        },
      }),
      200,
    );
  } catch (error) {
    console.error("Arga AI error:", error);
    return jsonResponse(
      ApiResponse.internalError(error.message || "Gagal memproses Arga AI"),
      500,
    );
  }
}
