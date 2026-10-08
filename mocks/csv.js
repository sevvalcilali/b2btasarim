// Sahte backend için CSV okuma: Excel Türkçe (;) ve standart (,) ayırıcı, UTF-8 BOM, tırnaklı hücreler.
// Gerçek backend .xlsx da okur; demo yalnız CSV kabul eder (toplu yükleme ekranları).

function satirAyir(satir, ayirici) {
  const h = [];
  let cur = "";
  let tirnak = false;
  for (let i = 0; i < satir.length; i++) {
    const c = satir[i];
    if (tirnak) {
      if (c === '"' && satir[i + 1] === '"') (cur += '"'), i++;
      else if (c === '"') tirnak = false;
      else cur += c;
    } else if (c === '"') tirnak = true;
    else if (c === ayirici) h.push(cur), (cur = "");
    else cur += c;
  }
  h.push(cur);
  return h.map((x) => x.trim());
}

/** @returns {{ basliklar: string[], satirlar: Record<string,string>[] }} başlıklar ASCII küçük harfe çevrilir */
export function csvCoz(metin) {
  const satirlar = String(metin || "")
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .filter((s) => s.trim() !== "");
  if (!satirlar.length) return { basliklar: [], satirlar: [] };
  const ayirici = (satirlar[0].match(/;/g) || []).length >= (satirlar[0].match(/,/g) || []).length ? ";" : ",";
  // başlıklar ASCII küçük harfe: "vadeProfilId" → "vadeprofilid" (tr-TR küçültme I→ı yapar, eşleşmezdi)
  const basliklar = satirAyir(satirlar[0], ayirici).map((b) => b.toLowerCase());
  return { basliklar, satirlar: satirlar.slice(1).map((s) => Object.fromEntries(satirAyir(s, ayirici).map((v, i) => [basliklar[i] || `sutun${i + 1}`, v]))) };
}

/** Yüklenen dosyayı okur; .xlsx için demo sınırı mesajı */
export async function dosyadanCsv(fd) {
  const dosya = fd.get("dosya");
  if (!dosya || typeof dosya === "string") return { hata: "Dosya seçin." };
  if (dosya.size > 2 * 1024 * 1024) return { hata: "Dosya 2 MB'ı aşamaz." };
  const ad = String(dosya.name || "").toLocaleLowerCase("tr-TR");
  if (ad.endsWith(".xlsx") || ad.endsWith(".xls")) return { hata: "Örnek sunucu yalnız CSV okur; şablonu CSV olarak kaydedin. Gerçek backend .xlsx da kabul edecek." };
  if (!ad.endsWith(".csv")) return { hata: "CSV ya da Excel (.xlsx) dosyası seçin." };
  const { basliklar, satirlar } = csvCoz(await dosya.text());
  if (!satirlar.length) return { hata: "Dosyada başlık satırından sonra kayıt yok." };
  return { basliklar, satirlar };
}

/** "12.500,50" / "12500.5" → kuruş; boş → null; geçersiz → NaN */
export function tlCoz(metin) {
  const s = String(metin ?? "").trim().replace(/\s|₺/g, "");
  if (!s) return null;
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}
