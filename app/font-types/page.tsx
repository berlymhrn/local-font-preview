"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FontItem = {
  name: string;
  file: string;
};

type FontCategory = {
  id: string;
  label: string;
  description: string;
};

const categories: FontCategory[] = [
  { id: "all", label: "Semua", description: "Semua font yang tersedia" },
  { id: "serif", label: "Serif", description: "Klasik dan elegan" },
  { id: "sans-serif", label: "Sans Serif", description: "Modern dan bersih" },
  { id: "slab-serif", label: "Slab Serif", description: "Serif tebal dan kokoh" },
  { id: "script", label: "Script", description: "Mengalir dan dekoratif" },
  { id: "handwritten", label: "Handwritten", description: "Seperti tulisan tangan" },
  { id: "display", label: "Display", description: "Menonjol untuk judul" },
  { id: "monospace", label: "Monospace", description: "Lebar karakter konsisten" },
  { id: "blackletter", label: "Blackletter", description: "Klasik dan gotik" },
  { id: "other", label: "Lainnya", description: "Font yang belum terklasifikasi" },
];

function getCategory(fontName: string): string {
  const name = fontName.toLowerCase();

  if (/blackletter|old english|fraktur|textura|schwabacher|algerian|old english/.test(name)) {
    return "blackletter";
  }
  if (/mono|code|console|courier|consolas|terminal|cairopixel/.test(name)) {
    return "monospace";
  }
  if (/slab|rockwell|museo slab|zilla slab|roboto slab|josefin slab|clarendon/.test(name)) {
    return "slab-serif";
  }
  if (/script|cursive|calligraphy|chancery|dancing|pacifico|lobster|satisfy|allura|signature|swash|bantengstory|barokah|batuphat|berkshire|bradhitc|brush|curlz|forte|harlow|harrington|mistral|monotype corsiva|vivaldi/.test(name)) {
    return "script";
  }
  if (/hand|handwriting|marker|comic|chiller|caveat|doodle|notes|banana|bakul nasi|bear days|butterpop|cheerful|chrisye|cleanwork|creamy chicken|darumadrop|deeps|kids|school|sketch|chalk|jokerman/.test(name)) {
    return "handwritten";
  }
  if (/display|impact|bebas|anton|oswald|league|decorative|agency|bauhaus|bernhc|britanic|broadw|castelar|colonna|cooper|elephant|engravers|gigi|goudy stout|hobo|magneto|ravie|showcard|stencil|snap|spartan|captur|coin|croissant|darumadrop/.test(name)) {
    return "display";
  }
  if (/serif|times|georgia|garamond|baskerville|baskvill|bodoni|bitter|merri|playfair|bookman|bookos|bell|cambria|calisto|centaur|century|constantia|copperplate|didot|goudy|palatino|perpetua|roman|schoolbook|sitka|stix|trajan|vladimir/.test(name)) {
    return "serif";
  }
  if (/sans|arial|helvetica|roboto|open sans|lato|montserrat|poppins|nunito|raleway|inter|segoe|calibri|verdana|tahoma|aptos|bahnschrift|candara|corbel|futura|franklin|gill|gill sans|trebuchet|tw cen|univers|system|modern|aerial|nirmala|leelawadee/.test(name)) {
    return "sans-serif";
  }
  return "other";
}

export default function FontTypesPage() {
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [text, setText] = useState("Font Preview");
  const [fontSize, setFontSize] = useState(32);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fonts")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Gagal mengambil daftar font (${response.status})`);
        return response.json();
      })
      .then((data: { fonts?: FontItem[]; error?: string }) => {
        if (data.error) setError(data.error);
        setFonts(data.fonts || []);

        data.fonts?.forEach((font) => {
          new FontFace(
            font.name,
            `url(/api/font-file/${encodeURIComponent(font.file)})`
          )
            .load()
            .then((loaded) => document.fonts.add(loaded))
            .catch(() => undefined);
        });
      })
      .catch((fetchError) => setError(String(fetchError)));
  }, []);

  const categorizedFonts = useMemo(
    () => fonts.map((font) => ({ ...font, category: getCategory(font.name) })),
    [fonts]
  );

  const visibleFonts = categorizedFonts.filter(
    (font) => activeCategory === "all" || font.category === activeCategory
  );

  return (
    <main className="min-h-screen bg-white px-6 py-8 font-sans text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Jenis Font</h1>
            <p className="text-sm text-neutral-600">
              Pilih kategori untuk melihat font yang sesuai.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Kembali ke preview
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                activeCategory === category.id
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span className="block text-sm font-semibold">{category.label}</span>
              <span className="mt-1 block text-xs opacity-70">{category.description}</span>
            </button>
          ))}
        </div>

        <div className="mb-8 grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-neutral-700">
            Teks preview
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2.5 text-base text-neutral-950 outline-none focus:border-neutral-700"
            />
          </label>
          <label className="flex max-w-xs flex-col gap-2 text-sm text-neutral-700">
            Ukuran: {fontSize}px
            <input
              type="range"
              min={12}
              max={80}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          </label>
        </div>

        <p className="mb-4 text-sm text-neutral-600">
          {visibleFonts.length} font dalam kategori {categories.find((category) => category.id === activeCategory)?.label}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleFonts.map((font) => (
            <article key={font.file} className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
              <p className="mb-2 text-xs text-neutral-600">{font.name}</p>
              <p
                className="break-words leading-snug text-neutral-950"
                style={{ fontFamily: `"${font.name}", sans-serif`, fontSize }}
              >
                {text || "Font Preview"}
              </p>
            </article>
          ))}
        </div>

        {visibleFonts.length === 0 && !error && (
          <p className="text-sm text-neutral-600">Belum ada font dalam kategori ini.</p>
        )}
      </div>
    </main>
  );
}
