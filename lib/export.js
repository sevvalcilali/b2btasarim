// Tablo → CSV indirme (Excel Türkçe: noktalı virgül ayırıcı, UTF-8 BOM). Yalnızca ekranda yüklü satırları yazar.

/** Kuruş → "1234,56" (Excel'de sayı olarak açılır) */
export const csvTutar = (kurus) => (Number(kurus ?? 0) / 100).toFixed(2).replace(".", ",");

const hucre = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+@]/.test(s) || /^-(?!\d)/.test(s)) s = `'${s}`; // Excel'de formül olarak çalışmasın (CSV enjeksiyonu)
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * @param {string} dosyaAdi   uzantısız; tarih eklenir → islem-detaylari-2026-10-08.csv
 * @param {string[]} basliklar
 * @param {any[][]} satirlar
 */
export function csvIndir(dosyaAdi, basliklar, satirlar) {
  const icerik = [basliklar, ...satirlar].map((r) => r.map(hucre).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + icerik], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dosyaAdi}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
