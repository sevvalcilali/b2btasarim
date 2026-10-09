// Ayarlar › Vade Farkı Profil Tanım — şartname s.4: ana firma en çok 5 vade farkı profili tanımlar; her bayi / alt bayi
// bir profile bağlanır. Veri: GET/POST /vade-farki-profilleri, PUT /vade-farki-profilleri/{id}
import { useCallback, useState } from "react";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { formatNumber, tl, formatPercent } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useMaturityProfiles, useUpdateMaturityProfile, useCreateMaturityProfile } from "@/lib/queries/definitions";
import { EmptyState, ErrorBox, LoadingBox } from "../states";
import { errorHandler } from "../payment";
import { Field, Notice, Breadcrumb, Modal, inputCls, AuditNote } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";

const shortName = (name) => name.replace("Vade Farkı ", "");
const parseRate = (s) => Number(String(s).trim().replace(",", "."));

export function MaturityProfileDefinition({ meta, onNavigate }) {
  const query = useMaturityProfiles();
  const profiles = query.data?.kayitlar || [];
  const limit = query.data?.sinir ?? 5;
  const isFull = profiles.length >= limit;
  const [editingItem, setEditingItem] = useState(null); // null: kapalı · "yeni" · profil kaydı
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);
  const saved = (p) => {
    setEditingItem(null);
    setNotice(`${shortName(p.ad)} kaydedildi.`);
  };

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={() => onNavigate(HOME)} path={["Ayarlar", "Vade Farkı Profil Tanım"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Vade Farkı Profil Tanım</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {query.data ? `${formatNumber(profiles.length)} / ${formatNumber(limit)} profil tanımlı` : "Yükleniyor…"} · Her bayi bir profile bağlanır, oran taksitli ödemelere uygulanır
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 md:items-end">
          <button
            type="button"
            disabled={!query.data || isFull}
            onClick={() => setEditingItem("yeni")}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
          >
            <I name="plus" size={14} strokeWidth={2.4} />
            Yeni Profil
          </button>
          {isFull && <span className="text-[11px] text-[var(--muted)]">En çok {limit} profil tanımlanabilir; yenisi için mevcut bir profili düzenleyin.</span>}
        </div>
      </div>

      {query.isPending ? (
        <LoadingBox />
      ) : query.isError ? (
        <ErrorBox error={query.error} onRetry={() => query.refetch()} />
      ) : profiles.length === 0 ? (
        <EmptyState title="Henüz profil yok" description="Her bayi bir vade farkı profiline bağlanır; önce profili tanımlayın." icon="percent" actions={[{ etiket: "Yeni Profil", icon: "plus", primary: true, onClick: () => setEditingItem("yeni") }]} />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Vade farkı profilleri">
          {profiles.map((p, i) => (
            <li key={p.id} style={{ "--i": i }} className={`bn-rise flex flex-col p-4 sm:p-5 ${CARD}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[13px] font-extrabold tabular-nums text-[var(--brand-text)]">P{p.id}</span>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--fg)]">{shortName(p.ad)}</h2>
                    <p className="text-[11.5px] text-[var(--muted)]">{p.aciklama || "Açıklama yok"}</p>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(p.durum)}`}>{labelOf("recordStatus", p.durum)}</span>
              </div>

              <p className="mt-4 text-[26px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--fg)]">
                {formatPercent(p.oranYuzde, 2)}
                <span className="ml-1 text-[12px] font-semibold text-[var(--muted)]">/ ay</span>
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3 text-[12px]">
                <dt className="text-[var(--muted)]">Kullanan bayi</dt>
                <dd className="text-right font-bold tabular-nums text-[var(--fg)]">{formatNumber(p.kullananBayiSayisi)}</dd>
                <dt className="text-[var(--muted)]">
                  Örnek · {tl(p.ornek.tutarKurus)}, {p.ornek.taksit} taksit
                </dt>
                <dd className="text-right font-bold tabular-nums text-[var(--fg)]">+{tl(p.ornek.vadeFarkiKurus)}</dd>
              </dl>

              <AuditNote record={p} className="mt-3" />
              <button
                type="button"
                onClick={() => setEditingItem(p)}
                className={`mt-4 inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full border border-[var(--border-strong)] px-3.5 text-[12.5px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
              >
                <I name="edit" size={14} />
                Düzenle
              </button>
            </li>
          ))}
        </ul>
      )}

      {editingItem && <ProfileForm existing={editingItem === "yeni" ? null : editingItem} onClose={() => setEditingItem(null)} onSaved={saved} />}
      {notice && <Notice text={notice} onDone={noticeDone} />}
    </>
  );
}

function ProfileForm({ existing, onClose, onSaved }) {
  const [f, setF] = useState({
    ad: existing?.ad || "",
    rate: existing ? String(existing.oranYuzde).replace(".", ",") : "",
    aciklama: existing?.aciklama || "",
    durum: existing?.durum || "AKTIF",
  });
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const create = useCreateMaturityProfile();
  const update = useUpdateMaturityProfile();
  const sending = create.isPending || update.isPending;

  // ekran tarafı doğrulama; sunucu aynı kuralları uygular (ad çakışması, kullanılan profili pasife alma)
  const rate = parseRate(f.rate);
  const errors = {};
  if (!f.ad.trim()) errors.ad = "Profil adı girin.";
  if (f.rate.trim() === "" || !Number.isFinite(rate) || rate < 0 || rate > 10) errors.oranYuzde = "Aylık oran %0 ile %10 arasında olmalı.";
  const h = errorHandler(attempted, errors, serverErrors);
  const change = (draft) => {
    setF(draft);
    if (Object.keys(serverErrors).length) setServerErrors({});
  };

  const save = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setServerMessage(null);
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => document.querySelector('#bn-profil-form [aria-invalid="true"]')?.focus());
      return;
    }
    const body = { ad: f.ad.trim(), oranYuzde: Math.round(rate * 100) / 100, aciklama: f.aciklama.trim(), durum: f.durum };
    try {
      onSaved(existing ? await update.mutateAsync({ id: existing.id, body }) : await create.mutateAsync(body));
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) {
        setServerErrors(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-profil-form [aria-invalid="true"]')?.focus());
      } else {
        setServerMessage(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  const preview = Number.isFinite(rate) && f.rate.trim() !== "" ? Math.round((1000000 * rate * 5) / 100) : null; // ₺10.000 · 6 taksit, sunucudaki örnekle aynı

  return (
    <Modal title={existing ? `${shortName(existing.ad)} profilini düzenle` : "Yeni vade farkı profili"} subtitle="Oran aylıktır; taksitli ödemelerde vade farkı bu orandan hesaplanır." onClose={onClose} width="max-w-md">
      <form id="bn-profil-form" noValidate onSubmit={save} className="flex flex-col gap-3" aria-busy={sending}>
        <Field id="bn-p-ad" label="Profil adı" error={h("ad")}>
          <input id="bn-p-ad" value={f.ad} onChange={(e) => change({ ...f, ad: e.target.value })} placeholder="Vade Farkı Profil 6" aria-invalid={h("ad") ? true : undefined} className={inputCls(h("ad"))} />
        </Field>
        <Field id="bn-p-oran" label="Aylık oran" error={h("oranYuzde")} hint={preview !== null ? `Örnek: ${tl(1000000)}, 6 taksit → +${tl(preview)} vade farkı` : "Örn. 2,45"}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[var(--muted)]">%</span>
            <input
              id="bn-p-oran"
              inputMode="decimal"
              value={f.rate}
              onChange={(e) => change({ ...f, rate: e.target.value.replace(/[^\d.,]/g, "") })}
              aria-invalid={h("oranYuzde") ? true : undefined}
              className={`${inputCls(h("oranYuzde"))} pl-7 font-bold tabular-nums`}
            />
          </div>
        </Field>
        <Field id="bn-p-aciklama" label="Açıklama" error={h("aciklama")}>
          <textarea id="bn-p-aciklama" rows={2} value={f.aciklama} onChange={(e) => change({ ...f, aciklama: e.target.value })} placeholder="Hangi bayiler için kullanılacağı" className={`${inputCls(h("aciklama"))} h-auto py-2`} />
        </Field>
        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${h("durum") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
          <input type="checkbox" role="switch" checked={f.durum === "AKTIF"} onChange={(e) => change({ ...f, durum: e.target.checked ? "AKTIF" : "PASIF" })} aria-invalid={h("durum") ? true : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
          <span className="leading-snug">
            <span className="block text-[12.5px] font-bold text-[var(--fg)]">Aktif</span>
            <span className="block text-[11.5px] text-[var(--muted)]">Pasif profil yeni bayi tanımında seçilemez; kullanan aktif bayi varsa pasife alınamaz.</span>
          </span>
        </label>
        {h("durum") && (
          <p role="alert" className="-mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
            {h("durum")}
          </p>
        )}
        {serverMessage && (
          <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
            {serverMessage}
          </p>
        )}
        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
            Vazgeç
          </button>
          <button type="submit" disabled={sending} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            {sending ? "Kaydediliyor…" : existing ? "Değişiklikleri Kaydet" : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
