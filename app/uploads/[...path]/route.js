import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const segments = Array.isArray(resolvedParams.path)
      ? resolvedParams.path
      : [resolvedParams.path];

    const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadsRoot, ...segments);

    if (!filePath.startsWith(uploadsRoot + path.sep) && filePath !== uploadsRoot) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.error("Error serving upload file:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}