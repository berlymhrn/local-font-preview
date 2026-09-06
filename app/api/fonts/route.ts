import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VALID_EXT = [".ttf", ".otf", ".woff", ".woff2"];

type FontRoot = {
  key: string;
  directory: string;
};

function getFontRoots(): FontRoot[] {
  const configuredDirectory =
    process.env.FONTS_DIR || path.join(process.cwd(), "public", "fonts");
  const roots = [{ key: "configured", directory: configuredDirectory }];

  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    roots.push({
      key: "user",
      directory: path.join(process.env.LOCALAPPDATA, "Microsoft", "Windows", "Fonts"),
    });
  }

  return roots.filter(
    (root, index) =>
      roots.findIndex(
        (candidate) => path.resolve(candidate.directory) === path.resolve(root.directory)
      ) === index
  );
}

function findFontFiles(directory: string, relativeDirectory = ""): string[] {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return findFontFiles(fullPath, relativePath);
    return VALID_EXT.includes(path.extname(entry.name).toLowerCase()) ? [relativePath] : [];
  });
}

export async function GET() {
  const fontRoots = getFontRoots();

  try {
    const existingRoots = fontRoots.filter((root) => fs.existsSync(root.directory));
    if (existingRoots.length === 0) {
      return NextResponse.json(
        {
          fonts: [],
          error: `Folder tidak ditemukan: ${fontRoots.map((root) => root.directory).join(", ")}`,
          debug_env_FONTS_DIR: process.env.FONTS_DIR || "(tidak terbaca / kosong)",
        },
        { status: 200 }
      );
    }

    const fonts = existingRoots
      .flatMap((root) =>
        findFontFiles(root.directory).map((file) => ({
          name: path.basename(file, path.extname(file)).replace(/[-_]/g, " "),
          file: `${root.key}/${file}`,
        }))
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ fonts });
  } catch (err) {
    return NextResponse.json({ fonts: [], error: String(err) }, { status: 500 });
  }
}
