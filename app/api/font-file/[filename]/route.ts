import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getFontRoot(rootKey: string) {
  if (rootKey === "user" && process.platform === "win32" && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, "Microsoft", "Windows", "Fonts");
  }

  if (rootKey === "configured") {
    return process.env.FONTS_DIR || path.join(process.cwd(), "public", "fonts");
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const separatorIndex = filename.indexOf("/");
  const rootKey = separatorIndex === -1 ? "configured" : filename.slice(0, separatorIndex);
  const relativeFilename = separatorIndex === -1 ? filename : filename.slice(separatorIndex + 1);
  const fontsDir = getFontRoot(rootKey);

  if (!fontsDir || !relativeFilename || path.isAbsolute(relativeFilename)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.resolve(fontsDir, relativeFilename);
  const resolvedFontsDir = path.resolve(fontsDir);

  // Cegah path traversal (misal ../../../../etc/passwd)
  if (!filePath.startsWith(`${resolvedFontsDir}${path.sep}`)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  const ext = path.extname(relativeFilename).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
