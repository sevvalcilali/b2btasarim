// Sahte backend için CSV okuma: Excel Türkçe (;) ve standart (,) ayırıcı, UTF-8 BOM, tırnaklı hücreler.
// Gerçek backend .xlsx da okur; demo yalnız CSV kabul eder (toplu yükleme ekranları).

function splitRows(row, separator) {
  const h = [];
  let cur = "";
  let quote = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (quote) {
      if (c === '"' && row[i + 1] === '"') (cur += '"'), i++;
      else if (c === '"') quote = false;
      else cur += c;
    } else if (c === '"') quote = true;
    else if (c === separator) h.push(cur), (cur = "");
    else cur += c;
  }
  h.push(cur);
  return h.map((x) => x.trim());
}

/** @returns {{ basliklar: string[], satirlar: Record<string,string>[] }} başlıklar ASCII küçük harfe çevrilir */
export function parseCsv(text) {
  const rows = String(text || "")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((s) => s.trim() !== "");
  if (!rows.length) return { basliklar: [], satirlar: [] };
  const separator = (rows[0].match(/;/g) || []).length >= (rows[0].match(/,/g) || []).length ? ";" : ",";
  // başlıklar ASCII küçük harfe: "vadeProfilId" → "vadeprofilid" (tr-TR küçültme I→ı yapar, eşleşmezdi)
  const headers = splitRows(rows[0], separator).map((b) => b.toLowerCase());
  return { basliklar: headers, satirlar: rows.slice(1).map((s) => Object.fromEntries(splitRows(s, separator).map((v, i) => [headers[i] || `sutun${i + 1}`, v]))) };
}

/** Yüklenen dosyayı okur; .xlsx için demo sınırı mesajı */
export async function csvFromFile(fd) {
  const file = fd.get("dosya");
  if (!file || typeof file === "string") return { hata: "Dosya seçin." };
  if (file.size > 2 * 1024 * 1024) return { hata: "Dosya 2 MB'ı aşamaz." };
  const name = String(file.name || "").toLocaleLowerCase("tr-TR");
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return { hata: "Örnek sunucu yalnız CSV okur; şablonu CSV olarak kaydedin. Gerçek backend .xlsx da kabul edecek." };
  if (!name.endsWith(".csv")) return { hata: "CSV ya da Excel (.xlsx) dosyası seçin." };
  const { basliklar: headers, satirlar: rows } = parseCsv(await file.text());
  if (!rows.length) return { hata: "Dosyada başlık satırından sonra kayıt yok." };
  return { basliklar: headers, satirlar: rows };
}

/** "12.500,50" / "12500.5" → kuruş; boş → null; geçersiz → NaN */
export function parseTl(text) {
  const s = String(text ?? "").trim().replace(/\s|₺/g, "");
  if (!s) return null;
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}
