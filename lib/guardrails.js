/**
 * Guardrails and Security Filters for Arga AI
 * Defense-in-depth against prompt injection, jailbreak attempts, and scope drift.
 */

export const ARGA_GUARDRAIL_FALLBACK =
  "Maaf ya, sebagai Arga AI di LernLang, tugasku khusus untuk membantumu belajar dan berlatih bahasa Inggris (seperti grammar, vocabulary, tenses, percakapan, atau koreksi kalimat). Aku tidak dapat menjalankan perintah di luar topik ini. Kalau ada yang ingin kamu tanyakan seputar bahasa Inggris, aku siap membantu! 😊";

// Pola ekspresi jailbreak / prompt injection umum
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(system|previous|prior)\s+(instructions|prompts)/i,
  /you\s+are\s+now\s+(in|a)?\s*(dan|developer\s+mode|unrestricted|jailbreak)/i,
  /pretend\s+(you\s+have\s+no|there\s+are\s+no)\s+(rules|restrictions|filters)/i,
  /bypass\s+(all\s+)?(content\s+filters|safety\s+guidelines)/i,
  /act\s+as\s+(an?\s+)?unrestricted/i,
  /start\s+acting\s+as/i,
  /from\s+now\s+on\s+you\s+are/i,
  /mulai\s+sekarang\s+kamu\s+adalah/i,
  /abaikan\s+(semua\s+)?instruksi\s+(sebelumnya|awal)/i,
  /lupakan\s+(semua\s+)?aturan/i,
  /mode\s+pengembang|mode\s+bebas/i,
  /system\s*override/i,
  /<\/?system>/i,
  /\[system\]/i,
];

/**
 * Deteksi apakah input pengguna mengandung upaya prompt injection atau jailbreak.
 * @param {string} text
 * @returns {boolean}
 */
export function detectJailbreakAttempt(text = "") {
  if (typeof text !== "string" || !text.trim()) return false;
  const normalized = text.toLowerCase();
  return INJECTION_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Validasi output model untuk mencegah kebocoran kode pemrograman lengkap non-bahasa Inggris.
 * @param {string} content
 * @returns {string} content asli jika valid, atau fallback ramah jika melanggar
 */
export function sanitizeAIOutput(content = "") {
  if (typeof content !== "string") return content;

  // Cek jika model membocorkan script kode lengkap (misal script python/C++/bash mandiri)
  const fullCodeScriptPattern =
    /```(python|javascript|typescript|c\+\+|cpp|c|java|go|rust|bash|sh|php)\s+[\s\S]*?(def\s+|import\s+|class\s+|function\s+|#include|public\s+static\s+void)[\s\S]*?```/i;

  if (fullCodeScriptPattern.test(content)) {
    // Jika tidak ada penjelasan bahasa Inggris sama sekali di luarnya
    const textWithoutCode = content.replace(/```[\s\S]*?```/g, "").trim();
    if (textWithoutCode.length < 30) {
      return ARGA_GUARDRAIL_FALLBACK;
    }
  }

  return content;
}
