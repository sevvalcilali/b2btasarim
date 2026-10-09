// Duyuru — şartname s.2: ana firma duyuru girer (DuyuruYonetimi, /duyuru); bayi ve alt bayi ekranlarına pop-up düşer
// (DuyuruPopup, ana sayfa); üst bardaki zil tüm duyuruları açar (DuyuruPenceresi).
// Veri: GET/POST /duyurular, PUT /duyurular/{id}, POST /duyurular/{id}/okundu
import { useCallback, useState } from "react";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { formatNumber, formatDate } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useUpdateAnnouncement, useMarkAnnouncementRead, useCreateAnnouncement, useAnnouncements } from "@/lib/queries/announcements";
import { EmptyState, ErrorBox, Loading } from "../states";
import { errorHandler } from "../payment";
import { Field, Notice, Breadcrumb, Modal, inputCls, ConfirmModal, AuditNote } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";

const TARGETS = ["BAYI", "ALT_BAYI"];

const TargetBadges = ({ target }) => (
  <span className="flex flex-wrap gap-1">
    {target.map((r) => (
      <span key={r} className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-2)]">
        {labelOf("companyKind", r)}
      </span>
    ))}
  </span>
);

// ───────────────────────── Ana firma: Duyuru yönetimi ─────────────────────────
export function AnnouncementManagement({ meta, onNavigate }) {
  const query = useAnnouncements();
  const records = query.data?.kayitlar || [];
  const editable = query.data?.duzenlenebilir ?? false;
  const update = useUpdateAnnouncement();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const q = search.trim().toLocaleLowerCase("tr-TR");
  const visible = records.filter((d) => (!statusFilter || d.durum === statusFilter) && (!q || `${d.baslik} ${d.icerik}`.toLocaleLowerCase("tr-TR").includes(q)));
  const [editingItem, setEditingItem] = useState(null); // null · "yeni" · kayıt
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);
  const published = records.filter((d) => d.durum === "YAYINDA").length;

  const [toArchive, setToArchive] = useState(null); // onay bekleyen arşivleme
  const changeStatus = async (d) => {
    const status = d.durum === "YAYINDA" ? "ARSIV" : "YAYINDA";
    try {
      await update.mutateAsync({ duyuruId: d.duyuruId, body: { baslik: d.baslik, icerik: d.icerik, hedef: d.hedef, durum: status } });
      // arşivleme geri alınabilir: bildirimdeki "Geri al" duyuruyu yeniden yayına alır
      setNotice(status === "YAYINDA" ? { text: `"${d.baslik}" yeniden yayında.` } : { text: `"${d.baslik}" arşivlendi.`, action: { etiket: "Geri al", onClick: () => changeStatus({ ...d, durum: "ARSIV" }) } });
    } catch (err) {
      setNotice({ text: err?.message || "Güncellenemedi." });
    } finally {
      setToArchive(null);
    }
  };
  const th = "whitespace-nowrap px-4 py-2";
  const td = "px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={() => onNavigate(HOME)} path={["Duyuru"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Duyuru</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {query.data ? `${formatNumber(published)} yayında · ${formatNumber(records.length - published)} arşiv` : "Yükleniyor…"} · Yayındaki duyuru bayi ve alt bayi ekranlarına pop-up olarak düşer
          </p>
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => setEditingItem("yeni")}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Yeni Duyuru
          </button>
        )}
      </div>

      <section style={{ "--i": 1 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Duyurular" aria-busy={query.isFetching || update.isPending}>
        <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Durum" className="flex gap-1">
            {[
              ["", "Tümü", records.length],
              ["YAYINDA", "Yayında", published],
              ["ARSIV", "Arşiv", records.length - published],
            ].map(([value, name, count]) => (
              <button key={name} type="button" onClick={() => setStatusFilter(value)} aria-pressed={statusFilter === value} className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${statusFilter === value ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}>
                {name}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${statusFilter === value ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>{query.data ? count : "–"}</span>
              </button>
            ))}
          </div>
          <label className="relative block md:w-64">
            <span className="sr-only">Duyuru ara</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <I name="search" size={14} />
            </span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Başlık ya da metin" className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]" />
          </label>
        </div>
        {query.isPending ? (
          <Loading row={3} title={false} />
        ) : query.isError ? (
          <ErrorBox error={query.error} onRetry={() => query.refetch()} />
        ) : records.length > 0 && visible.length === 0 ? (
          <EmptyState title="Filtreye uyan duyuru yok" actions={[{ etiket: "Filtreleri temizle", onClick: () => { setSearch(""); setStatusFilter(""); } }]} />
        ) : records.length === 0 ? (
          <EmptyState title="Henüz duyuru yok" description="Yayınladığınız duyuru bayi ve alt bayi ekranlarına pop-up olarak düşer." icon="megaphone" actions={editable && [{ etiket: "Yeni Duyuru", icon: "plus", primary: true, onClick: () => setEditingItem("yeni") }]} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th scope="col" className={`${th} min-w-[280px]`}>Duyuru</th>
                  <th scope="col" className={th}>Hedef</th>
                  <th scope="col" className={th}>Tarih</th>
                  <th scope="col" className={th}>Okunma</th>
                  <th scope="col" className={th}>Durum</th>
                  {editable && <th scope="col" className={`${th} text-right`}>İşlem</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map((d, i) => (
                  <tr key={d.duyuruId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""} ${d.durum === "ARSIV" ? "opacity-70" : ""}`}>
                    <td className={td}>
                      <span className="block font-semibold text-[var(--fg)]">{d.baslik}</span>
                      <span className="mt-0.5 block max-w-md text-[11.5px] leading-snug text-[var(--muted)]">{d.icerik}</span>
                      <AuditNote record={d} className="mt-1" />
                    </td>
                    <td className={`${td} whitespace-nowrap`}><TargetBadges target={d.hedef} /></td>
                    <td className={`${td} whitespace-nowrap tabular-nums text-[var(--fg-2)]`}>{formatDate(d.tarih)}</td>
                    <td className={`${td} whitespace-nowrap tabular-nums text-[var(--fg-2)]`}>
                      {formatNumber(d.okunma.okuyanAdet)} / {formatNumber(d.okunma.hedefAdet)} kullanıcı
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(d.durum)}`}>{labelOf("announcementStatus", d.durum)}</span>
                    </td>
                    {editable && (
                      <td className={`${td} whitespace-nowrap text-right`}>
                        <span className="inline-flex gap-1">
                          <button type="button" onClick={() => setEditingItem(d)} className={`inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}>
                            <I name="edit" size={13} />
                            Düzenle
                          </button>
                          <button type="button" onClick={() => (d.durum === "YAYINDA" ? setToArchive(d) : changeStatus(d))} disabled={update.isPending} className={`inline-flex h-8 items-center rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:opacity-60 ${FOCUS}`}>
                            {d.durum === "YAYINDA" ? "Arşivle" : "Yayına Al"}
                          </button>
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingItem && (
        <AnnouncementForm
          existing={editingItem === "yeni" ? null : editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={(d, isNew) => {
            setEditingItem(null);
            setNotice({ text: isNew ? (d.durum === "YAYINDA" ? `"${d.baslik}" yayınlandı; hedef ekranlarda pop-up olarak görünecek.` : `"${d.baslik}" arşive kaydedildi.`) : `"${d.baslik}" kaydedildi.` });
          }}
        />
      )}
      {toArchive && (
        <ConfirmModal
          title={`"${toArchive.baslik}" arşivlensin mi?`}
          message="Arşivlenen duyuru bayi ekranlarından kalkar; okunmamış olanlara pop-up açılmaz. Daha sonra yeniden yayına alabilirsiniz."
          confirmLabel="Arşivle"
          busy={update.isPending}
          onApprove={() => changeStatus(toArchive)}
          onClose={() => setToArchive(null)}
        />
      )}
      {notice && <Notice text={notice.text} action={notice.action} onDone={noticeDone} />}
    </>
  );
}

function AnnouncementForm({ existing, onClose, onSaved }) {
  const [f, setF] = useState({ baslik: existing?.baslik || "", icerik: existing?.icerik || "", hedef: existing?.hedef || [...TARGETS], durum: existing?.durum || "YAYINDA" });
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const sending = create.isPending || update.isPending;

  const errors = {};
  if (!f.baslik.trim()) errors.baslik = "Başlık girin.";
  if (!f.icerik.trim()) errors.icerik = "Duyuru metnini girin.";
  if (f.hedef.length === 0) errors.hedef = "En az bir hedef seçin.";
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
      requestAnimationFrame(() => document.querySelector('#bn-duyuru-form [aria-invalid="true"]')?.focus());
      return;
    }
    const body = { baslik: f.baslik.trim(), icerik: f.icerik.trim(), hedef: f.hedef, durum: f.durum };
    try {
      onSaved(existing ? await update.mutateAsync({ duyuruId: existing.duyuruId, body }) : await create.mutateAsync(body), !existing);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) {
        setServerErrors(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-duyuru-form [aria-invalid="true"]')?.focus());
      } else {
        setServerMessage(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  return (
    <Modal title={existing ? "Duyuruyu düzenle" : "Yeni duyuru"} subtitle="Yayındaki duyuru hedef rollerin ana sayfasında pop-up olarak açılır; her kullanıcı bir kez okur." onClose={onClose} width="max-w-lg">
      <form id="bn-duyuru-form" noValidate onSubmit={save} className="flex flex-col gap-3" aria-busy={sending}>
        <Field id="bn-d-baslik" label="Başlık" error={h("baslik")}>
          <input id="bn-d-baslik" value={f.baslik} onChange={(e) => change({ ...f, baslik: e.target.value })} aria-invalid={h("baslik") ? true : undefined} className={inputCls(h("baslik"))} />
        </Field>
        <Field id="bn-d-icerik" label="Duyuru metni" error={h("icerik")}>
          <textarea id="bn-d-icerik" rows={4} value={f.icerik} onChange={(e) => change({ ...f, icerik: e.target.value })} aria-invalid={h("icerik") ? true : undefined} className={`${inputCls(h("icerik"))} h-auto py-2`} />
        </Field>
        <fieldset aria-describedby={h("hedef") ? "bn-d-hedef-hata" : undefined}>
          <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Hedef</legend>
          <div className="flex gap-1">
            {TARGETS.map((r) => {
              const selected = f.hedef.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => change({ ...f, hedef: selected ? f.hedef.filter((x) => x !== r) : [...f.hedef, r] })}
                  className={`inline-flex h-9 items-center rounded-full px-3.5 text-[12.5px] transition ${selected ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"} ${FOCUS}`}
                >
                  {labelOf("companyKind", r)}
                </button>
              );
            })}
          </div>
          {h("hedef") && (
            <p id="bn-d-hedef-hata" role="alert" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
              {h("hedef")}
            </p>
          )}
        </fieldset>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border-strong)] p-3">
          <input type="checkbox" role="switch" checked={f.durum === "YAYINDA"} onChange={(e) => change({ ...f, durum: e.target.checked ? "YAYINDA" : "ARSIV" })} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
          <span className="leading-snug">
            <span className="block text-[12.5px] font-bold text-[var(--fg)]">Yayında</span>
            <span className="block text-[11.5px] text-[var(--muted)]">Kapalıysa duyuru arşivde kalır, bayilere gösterilmez.</span>
          </span>
        </label>
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
            {sending ? "Kaydediliyor…" : existing ? "Değişiklikleri Kaydet" : f.durum === "YAYINDA" ? "Yayınla" : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ───────────────────────── Bayi / alt bayi: pop-up ve zil penceresi ─────────────────────────

// Ana sayfada okunmamış duyuruları sırayla açar; "Okudum" sunucuya yazılır (şartname s.2 pop-up)
export function AnnouncementPopup() {
  const query = useAnnouncements();
  const read = useMarkAnnouncementRead();
  const [closing, setClosing] = useState(() => new Set()); // bu oturumda kapatılanlar (sunucu cevabı gelene kadar)
  const unread = (query.data?.kayitlar || []).filter((d) => !d.okundu && !closing.has(d.duyuruId));
  const d = unread[0];
  if (!d) return null;
  const close = () => {
    setClosing((s) => new Set(s).add(d.duyuruId));
    read.mutate(d.duyuruId);
  };
  return (
    <Modal key={d.duyuruId} title={d.baslik} subtitle={`Ana firma duyurusu · ${formatDate(d.tarih)}`} onClose={close} width="max-w-md">
      <p className="whitespace-pre-line text-[13px] leading-relaxed text-[var(--fg)]">{d.icerik}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[11.5px] text-[var(--muted)]">{unread.length > 1 ? `${unread.length} okunmamış duyuru` : "Son okunmamış duyuru"}</span>
        <button type="button" onClick={close} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 ${FOCUS}`}>
          <I name="check" size={15} strokeWidth={2.2} />
          Okudum
        </button>
      </div>
    </Modal>
  );
}

// Üst bardaki zil: rolün görebildiği tüm duyurular (ana firma: yönetim listesine kısayol)
export function AnnouncementModal({ role, onClose }) {
  const query = useAnnouncements();
  const read = useMarkAnnouncementRead();
  const records = (query.data?.kayitlar || []).filter((d) => d.durum === "YAYINDA");
  const isMain = role === "ANA_FIRMA";
  return (
    <Modal title="Duyurular" subtitle={isMain ? "Yayındaki duyurular; düzenlemek için menüden Duyuru ekranını açın." : "Ana firmanın yayındaki duyuruları"} onClose={onClose} width="max-w-lg">
      {query.isPending ? (
        <Loading row={3} title={false} />
      ) : query.isError ? (
        <ErrorBox error={query.error} onRetry={() => query.refetch()} />
      ) : records.length === 0 ? (
        <EmptyState title="Yayında duyuru yok" icon="megaphone" />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {records.map((d) => (
            <li key={d.duyuruId} className="flex items-start gap-3 py-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!isMain && !d.okundu ? "bg-[var(--brand)]" : "bg-transparent"}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-[13px] font-bold text-[var(--fg)]">{d.baslik}</h3>
                  <span className="text-[11px] tabular-nums text-[var(--muted)]">{formatDate(d.tarih)}</span>
                  {!isMain && !d.okundu && <span className="rounded-full bg-[var(--brand-soft)] px-1.5 py-px text-[10px] font-bold text-[var(--brand-text)]">Yeni</span>}
                </div>
                <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-[var(--fg-2)]">{d.icerik}</p>
                {isMain ? (
                  <div className="mt-1.5"><TargetBadges target={d.hedef} /></div>
                ) : (
                  !d.okundu && (
                    <button type="button" onClick={() => read.mutate(d.duyuruId)} disabled={read.isPending} className={`mt-2 inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:opacity-60 ${FOCUS}`}>
                      <I name="check" size={13} />
                      Okudum
                    </button>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
