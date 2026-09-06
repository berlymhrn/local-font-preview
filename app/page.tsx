"use client";

import { useEffect, useState } from "react";

type FontItem = {
  name: string;
  file: string;
};

type LoadStatus = "loading" | "loaded" | "error";

export default function FontPreviewPage() {
  const [text, setText] = useState("Coming Soon");
  const [fontSize, setFontSize] = useState(32);
  const [searchQuery, setSearchQuery] = useState("");
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, LoadStatus>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fonts")
      .then(async (res) => {
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("application/json")) {
          const raw = await res.text();
          throw new Error(
            `API /api/fonts tidak mengembalikan JSON (status ${res.status}). ` +
              `Cek terminal dev server untuk error detail. Cuplikan respons: ${raw.slice(0, 120)}`
          );
        }
        return res.json();
      })
      .then((data: { fonts: FontItem[]; error?: string }) => {
        if (data.error) setFetchError(data.error);
        setFonts(data.fonts || []);

        data.fonts?.forEach((font) => {
          setStatusMap((prev) => ({ ...prev, [font.name]: "loading" }));

          const fontFace = new FontFace(
            font.name,
            `url(/api/font-file/${encodeURIComponent(font.file)})`
          );

          fontFace
            .load()
            .then((loaded) => {
              document.fonts.add(loaded);
              setStatusMap((prev) => ({ ...prev, [font.name]: "loaded" }));
            })
            .catch(() => {
              setStatusMap((prev) => ({ ...prev, [font.name]: "error" }));
            });
        });
      })
      .catch((err) => setFetchError(String(err)));
  }, []);

  const filteredFonts = fonts.filter((font) => {
    const query = searchQuery.trim().toLowerCase();
    return (
      !query ||
      font.name.toLowerCase().includes(query) ||
      font.file.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-black px-6 py-10 font-sans text-neutral-950">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Font Preview</h1>

        {fetchError && (
          <p className="text-sm text-red-600 mb-4">{fetchError}</p>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8 p-5 bg-white rounded-xl border border-neutral-200">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="font-search" className="text-sm text-neutral-700">
              Cari font
            </label>
            <input
              id="font-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Contoh: Poppins"
              className="bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-neutral-950 text-base outline-none focus:border-neutral-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-700">Teks preview</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis teks di sini..."
              className="bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-neutral-950 text-base outline-none focus:border-neutral-600"
            />
          </div>

          <div className="flex flex-col gap-1.5 max-w-56">
            <label className="text-sm text-neutral-700">
              Ukuran: {fontSize}px
            </label>
            <input
              type="range"
              min={12}
              max={80}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>
        </div>

        <p className="text-sm text-neutral-600 mb-4">
          {filteredFonts.length} font ditemukan
        </p>

        {/* Font preview list */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredFonts.map((font) => {
            const status = statusMap[font.name] || "loading";
            return (
              <div
                key={font.file}
                className="bg-white border border-neutral-200 rounded-xl px-5 py-4"
              >
                <div className="text-xs text-neutral-600 mb-2 font-sans flex justify-between">
                  <span>{font.name}</span>
                  {status === "loading" && (
                    <span className="text-yellow-700">memuat...</span>
                  )}
                  {status === "error" && (
                    <span className="text-red-600">gagal dimuat</span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily:
                      status === "loaded" ? `"${font.name}", sans-serif` : "sans-serif",
                    fontSize: fontSize,
                  }}
                  className={`break-words leading-snug ${
                    status === "loaded" ? "text-neutral-950 opacity-100" : "text-neutral-400 opacity-60"
                  }`}
                >
                  {text || "Coming Soon"}
                </div>
              </div>
            );
          })}
        </div>

        {filteredFonts.length === 0 && !fetchError && (
          <p className="text-neutral-600 text-sm">
            {searchQuery.trim()
              ? `Tidak ada font yang cocok dengan "${searchQuery}".`
              : "Tidak ada font ditemukan di folder."}
          </p>
        )}
      </div>
    </div>
  );
}
