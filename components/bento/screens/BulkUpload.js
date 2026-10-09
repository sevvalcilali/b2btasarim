// Bayi Tanım › Excel ile Toplu Bayi / Alt Bayi Ekleme · Toplu Bakiye ve Borç Yükleme — şartname s.2, s.10.
// Akış: şablonu indir → dosyayı seç → önizle (sunucu satır satır doğrular, yazmaz) → geçerli satırları kaydet.
// Veri: POST /bayiler/toplu(/onizleme), POST /bakiye/toplu(/onizleme) — multipart; sözleşme docs/api/openapi.yaml
import { useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { formatNumber, tl } from "@/lib/format";
import { downloadCsv } from "@/lib/export";
import { labelOf } from "@/lib/labels";
import { usePreviewBalanceBulk, useUploadBalanceBulk } from "@/lib/queries/balance";
import { useAddDealerBulk, usePreviewDealerBulk } from "@/lib/queries/dealers";
import { EmptyState } from "../states";
import { Breadcrumb } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";

const Step = ({ no, title, description, children, i }) => (
  <section style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby={`bn-toplu-${no}`}>
    <div className="mb-3 flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[12px] font-extrabold text-white">{no}</span>
      <div>
        <h2 id={`bn-toplu-${no}`} className="text-sm font-bold text-[var(--fg)]">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

/**
 * Ortak toplu yükleme ekranı.
 * @param {object} p
 * @param {string[]} p.yol             konum satırı
 * @param {{ dosyaAdi, basliklar, ornekler }} p.sablon
 * @param {string[]} p.sutunlar        önizleme tablosu başlıkları
 * @param {(satir) => any[]} p.hucreler  önizleme satırı → hücreler
 * @param {object} p.onizle / p.kaydet  useMutation sonuçları (dosya alır)
 * @param {(sonuc) => string} p.sonucMetni
 * @param {{ label, href }} [p.sonrakiAdim]
 */
function BulkUpload({ meta, onNavigate, path, description, template, columns, cells, preview, save, saveLabel, resultText, nextStep, notes }) {
  const [file, setFile] = useState(null);
  const [previewResult, setPreview] = useState(null); // sunucu doğrulaması
  const [result, setResult] = useState(null); // kaydet cevabı
  const [error, setError] = useState(null);
  const title = path[path.length - 1];
  const busy = preview.isPending || save.isPending;

  const selectFile = (f) => {
    setFile(f);
    setPreview(null);
    setResult(null);
    setError(null);
  };
  const run = async (mutation, after) => {
    setError(null);
    try {
      after(await mutation.mutateAsync(file));
    } catch (err) {
      setError(err instanceof ApiError && err.alanlar.dosya ? err.alanlar.dosya : err?.message || "İşlem yapılamadı.");
    }
  };
  const th = "whitespace-nowrap px-3 py-2";
  const td = "px-3 py-2 align-top";
  const rows = (result || previewResult)?.satirlar || [];

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Breadcrumb onHome={() => onNavigate(HOME)} path={path} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">{title}</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · {description}
        </p>
      </div>

      <div className="flex max-w-5xl flex-col gap-3">
        <Step no={1} i={0} title="Şablonu indirin" description="Sütun adlarını değiştirmeden doldurun; Excel'de açıp CSV (noktalı virgül) olarak kaydedin.">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-1" aria-label="Sütunlar">
              {template.basliklar.map((b) => (
                <li key={b} className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--fg-2)]">
                  {b}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => downloadCsv(template.dosyaAdi, template.basliklar, template.samples)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
            >
              <I name="download" size={14} />
              Şablonu İndir
            </button>
          </div>
          {notes && (
            <ul className="mt-3 list-disc space-y-0.5 pl-5 text-[11.5px] text-[var(--muted)]">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </Step>

        <Step no={2} i={1} title="Dosyayı seçin ve önizleyin" description="Önizleme her satırı sunucuda doğrular; bu adımda hiçbir kayıt yazılmaz.">
          <label htmlFor="bn-toplu-dosya" className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--ring)] hover:border-[var(--brand)] hover:bg-[var(--soft)] ${error ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <I name={file ? "check" : "download"} size={18} />
            </span>
            <span className="text-[13px] font-bold text-[var(--fg)]">{file ? file.name : "Excel ya da CSV dosyasını seçin"}</span>
            <span className="text-[11.5px] text-[var(--muted)]">{file ? `${Math.max(1, Math.round(file.size / 1024)).toLocaleString("tr-TR")} KB · değiştirmek için tıklayın` : ".xlsx ya da .csv · en fazla 2 MB"}</span>
            <input id="bn-toplu-dosya" type="file" accept=".csv,.xlsx,.xls" onChange={(e) => selectFile(e.target.files?.[0] || null)} aria-invalid={error ? true : undefined} aria-describedby={error ? "bn-toplu-hata" : undefined} className="sr-only" />
          </label>
          {error && (
            <p id="bn-toplu-hata" role="alert" className="mt-2 rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
              {error}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={!file || busy}
              onClick={() => run(preview, (o) => { setPreview(o); setResult(null); })}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
            >
              <I name="search" size={15} strokeWidth={2.2} />
              {preview.isPending ? "Doğrulanıyor…" : "Önizle"}
            </button>
          </div>
        </Step>

        {(previewResult || result) && (
          <Step no={3} i={2} title={result ? "Sonuç" : "Önizleme"} description={result ? resultText(result) : `${formatNumber(previewResult.gecerli)} geçerli · ${formatNumber(previewResult.hatali)} hatalı satır. Hatalı satırlar atlanır; düzeltip dosyayı yeniden seçebilirsiniz.`}>
            {rows.length === 0 ? (
              <EmptyState title="Dosyada kayıt yok" />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="bn-rtable min-w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      <th scope="col" className={th}>Satır</th>
                      {columns.map((s) => (
                        <th key={s} scope="col" className={th}>
                          {s}
                        </th>
                      ))}
                      <th scope="col" className={th}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((s, i) => (
                      <tr key={s.sira} className={`${i > 0 ? "border-t border-[var(--border)]" : ""} ${s.gecerli ? "" : "bg-[var(--danger-soft)]/40"}`}>
                        <td data-label="Satır" data-card="sub" className={`${td} tabular-nums text-[var(--muted)]`}>{s.sira}</td>
                        {cells(s).map((h, j) => (
                          <td data-label={columns[j]} key={j} className={`${td} whitespace-nowrap ${j === 0 ? "font-semibold text-[var(--fg)]" : "text-[var(--fg-2)]"}`}>
                            {h ?? "—"}
                          </td>
                        ))}
                        <td data-label="Durum" data-card="full" className={`${td} min-w-[220px]`}>
                          {s.gecerli ? (
                            <span className="inline-flex rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--success-text)]">{result ? (result.eklenen != null ? "Eklendi" : "Güncellendi") : "Geçerli"}</span>
                          ) : (
                            <ul className="space-y-0.5 text-[11.5px] font-semibold text-[var(--danger-text)]">
                              {Object.entries(s.hatalar).map(([k, m]) => (
                                <li key={k}>{m}</li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {result ? (
                nextStep && (
                  <button type="button" onClick={() => onNavigate(nextStep.href)} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
                    {nextStep.label}
                    <I name="chevronRight" size={14} />
                  </button>
                )
              ) : (
                <button
                  type="button"
                  disabled={previewResult.gecerli === 0 || busy}
                  onClick={() => run(save, setResult)}
                  className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                >
                  <I name="check" size={15} strokeWidth={2.2} />
                  {save.isPending ? "Kaydediliyor…" : saveLabel(previewResult.gecerli)}
                </button>
              )}
            </div>
          </Step>
        )}
      </div>
    </>
  );
}

// ───────────────────────── Excel ile Toplu Bayi / Alt Bayi Ekleme ─────────────────────────
export function BulkDealerAdd({ role, meta, onNavigate }) {
  const isSub = role === ROLES.BAYI;
  const name = isSub ? "alt bayi" : "bayi";
  const headers = ["unvan", "cariNo", "vergiNo", "telefon", "email", "adres", "vadeProfilId", "taksitler", "islemLimitiTL", ...(isSub ? [] : ["altBayiYetkisi"]), "durum"];
  const sample = (legalName, account, taxId, tel, mail, address) => [legalName, account, taxId, tel, mail, address, "", "", "", ...(isSub ? [] : ["Hayır"]), "AKTIF"];
  const samples = isSub
    ? [sample("Etimesgut Lastik", "540.02.021", "5566778899", "0312 244 10 20", "info@etimesgutlastik.com", "Etimesgut / Ankara")]
    : [sample("Adana Lastik Merkezi", "320.01.021", "5566778899", "0322 455 10 20", "info@adanalastik.com", "Seyhan / Adana"), sample("Trabzon Oto Lastik", "320.01.022", "6677889900", "0462 321 44 55", "info@trabzonoto.com", "Ortahisar / Trabzon")];
  return (
    <BulkUpload
      meta={meta}
      onNavigate={onNavigate}
      path={[isSub ? "Alt Bayi Tanım" : "Bayi Tanım", `Excel ile Toplu ${isSub ? "Alt Bayi" : "Bayi"} Ekleme`]}
      description={`Birden çok ${name}yi tek dosyayla tanımlayın; kurallar tekil tanımla aynıdır`}
      template={{ dosyaAdi: isSub ? "alt-bayi-sablonu" : "bayi-sablonu", basliklar: headers, samples }}
      notes={[
        "vadeProfilId, taksitler (örn. 1,2,3,6) ve islemLimitiTL boş bırakılırsa kendi tanımınızdaki sınırlar uygulanır; üye işyerleri size açık olanların tümüdür.",
        "cariNo 000.00.000 biçiminde ve ağda tek olmalı; vergiNo 10 hane.",
        "Hatalı satırlar kaydedilmez; önizlemede nedenini görüp dosyayı düzeltebilirsiniz.",
      ]}
      columns={["Unvan", "Cari No", "Vergi No", "Telefon", "E-posta", "Vade profili", "Taksitler", "Limit"]}
      cells={(s) => [s.girdi.unvan, s.girdi.cariNo, s.girdi.vergiNo, s.girdi.telefon, s.girdi.email, s.girdi.vadeProfilId ? `Profil ${s.girdi.vadeProfilId}` : null, s.girdi.taksitler?.join(", "), s.girdi.islemLimitiKurus ? tl(s.girdi.islemLimitiKurus) : null]}
      preview={usePreviewDealerBulk()}
      save={useAddDealerBulk()}
      saveLabel={(n) => `${formatNumber(n)} ${name} ekle`}
      resultText={(r) => `${formatNumber(r.eklenen)} ${name} eklendi${r.atlanan ? `, ${formatNumber(r.atlanan)} hatalı satır atlandı` : ""}.`}
      nextStep={{ label: isSub ? "Alt Bayi Listesine git" : "Bayi Listesine git", href: "/bayi-tanim/liste" }}
    />
  );
}

// ───────────────────────── Toplu Bakiye ve Borç Yükleme ─────────────────────────
export function BulkBalanceUpload({ role, meta, onNavigate }) {
  const isSub = role === ROLES.BAYI;
  const name = isSub ? "alt bayi" : "bayi";
  return (
    <BulkUpload
      meta={meta}
      onNavigate={onNavigate}
      path={[isSub ? "Alt Bayi Tanım" : "Bayi Tanım", "Toplu Bakiye ve Borç Yükleme"]}
      description={`${isSub ? "Alt bayilerinizin" : "Bayilerinizin"} bakiye, borç ve limitini tek dosyayla güncelleyin; borç artışı ekstreye hareket olarak düşer`}
      template={{
        dosyaAdi: "bakiye-borc-sablonu",
        basliklar: ["cariNo", "bakiyeTL", "borcTL", "limitTL", "aciklama"],
        samples: isSub ? [["540.02.011", "38.900,00", "15.100,00", "100.000,00", "Ekim sevkiyatı"]] : [["320.01.001", "184.200,00", "52.300,00", "400.000,00", "Ekim sevkiyatı — fatura BRS-2026-1003"], ["320.01.002", "", "61.000,00", "", "Ekim sevkiyatı"]],
      }}
      notes={["Boş bırakılan tutar değişmez; tutarlar TL, ondalık virgülle (12.500,00).", `cariNo yönettiğiniz bir ${name}ye ait olmalı; borç limiti aşamaz.`]}
      columns={["Firma", "Cari No", "Bakiye", "Borç", "Limit", "Açıklama"]}
      cells={(s) => {
        const difference = (draft, old) => (s.eski && draft !== old ? <span className="block text-[10.5px] text-[var(--muted)]">önce {tl(old)}</span> : null);
        return [
          s.girdi.unvan,
          s.girdi.cariNo,
          <>
            {Number.isInteger(s.girdi.bakiyeKurus) ? tl(s.girdi.bakiyeKurus) : "—"}
            {difference(s.girdi.bakiyeKurus, s.eski?.bakiyeKurus)}
          </>,
          <>
            {Number.isInteger(s.girdi.borcKurus) ? tl(s.girdi.borcKurus) : "—"}
            {difference(s.girdi.borcKurus, s.eski?.borcKurus)}
          </>,
          <>
            {Number.isInteger(s.girdi.limitKurus) ? tl(s.girdi.limitKurus) : "—"}
            {difference(s.girdi.limitKurus, s.eski?.limitKurus)}
          </>,
          s.girdi.aciklama || null,
        ];
      }}
      preview={usePreviewBalanceBulk()}
      save={useUploadBalanceBulk()}
      saveLabel={(n) => `${formatNumber(n)} ${name} için yükle`}
      resultText={(r) => `${formatNumber(r.guncellenen)} ${name} güncellendi${r.atlanan ? `, ${formatNumber(r.atlanan)} hatalı satır atlandı` : ""}.`}
      nextStep={{ label: isSub ? "Alt Bayi Listesine git" : "Bayi Listesine git", href: "/bayi-tanim/liste" }}
    />
  );
}
