// Ayarlar › Kullanıcı Tanım — şartname s.3: her firma kendi kullanıcılarını Yönetici / Ödeme / Raporlama yetkisiyle
// tanımlar; yalnız Yönetici ekler ve düzenler. Veri: GET/POST /kullanicilar, PUT /kullanicilar/{kullaniciId}
import { useCallback, useState } from "react";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { formatNumber, formatDateTime } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useUpdateUser, useCreateUser, useUsers } from "@/lib/queries/users";
import { EmptyState, ErrorBox, Loading } from "../states";
import { errorHandler } from "../payment";
import { Field, Notice, Breadcrumb, Modal, inputCls, AuditNote } from "../shared";
import { HOME } from "../routes";
import { SortableHeader, useSorting } from "../table";
import { CARD, FOCUS } from "../theme";
import { figures, useDebounced } from "../helpers";

const PERMISSIONS = ["YONETICI", "ODEME", "RAPORLAMA"];
const PERMISSION_TONE = {
  YONETICI: "bg-[var(--brand-soft)] text-[var(--brand-text)]",
  ODEME: "bg-[var(--success-soft)] text-[var(--success-text)]",
  RAPORLAMA: "bg-[var(--soft-2)] text-[var(--fg-2)]",
};
const USER_COLUMNS = { adSoyad: (k) => k.adSoyad, yetki: (k) => ["YONETICI", "ODEME", "RAPORLAMA"].indexOf(k.yetki), sonGiris: (k) => k.sonGiris, durum: (k) => k.durum };
const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toLocaleUpperCase("tr-TR");

export function UserDefinition({ meta, onNavigate }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const q = useDebounced(search.trim());
  const query = useUsers({ durum: status || undefined, q: q || undefined });
  const data = query.data;
  const rows = data?.kayitlar || [];
  const editable = data?.duzenlenebilir ?? false;
  const { sorted, sorting, sort } = useSorting(rows, USER_COLUMNS);
  const [editingItem, setEditingItem] = useState(null); // null: kapalı · "yeni" · kullanıcı kaydı
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);
  const saved = (k, isNew) => {
    setEditingItem(null);
    setNotice(isNew ? `${k.adSoyad} eklendi; şifre belirleme bağlantısı e-postasına gönderilecek.` : `${k.adSoyad} kaydedildi.`);
  };
  const th = "whitespace-nowrap px-4 py-2";
  const td = "whitespace-nowrap px-4 py-2.5 align-top";

  return (
    <>
      <div className="bn-rise mb-4 flex flex-col gap-3 px-1 md:flex-row md:items-end md:justify-between">
        <div>
          <Breadcrumb onHome={() => onNavigate(HOME)} path={["Ayarlar", "Kullanıcı Tanım"]} />
          <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Kullanıcı Tanım</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            {meta.company} · {data ? `${formatNumber(data.sayaclar.TUMU)} kullanıcı` : "Yükleniyor…"}
            {data && !editable ? " · Kullanıcı eklemek ve düzenlemek için Yönetici yetkisi gerekir" : ""}
          </p>
        </div>
        {editable && (
          <button
            type="button"
            onClick={() => setEditingItem("yeni")}
            className={`inline-flex h-9 items-center gap-1.5 self-start rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition [box-shadow:0_8px_18px_-10px_rgba(12,52,231,0.8)] hover:brightness-110 md:self-auto ${FOCUS}`}
          >
            <I name="plus" size={14} />
            Yeni Kullanıcı
          </button>
        )}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {PERMISSIONS.map((y, i) => (
          <div key={y} style={{ "--i": i }} className="bn-rise flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
            <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${PERMISSION_TONE[y]}`}>{labelOf("permission", y)}</span>
            <span className="text-[11.5px] leading-snug text-[var(--muted)]">{labelOf("permissionDescription", y)}</span>
          </div>
        ))}
      </div>

      <section style={{ "--i": 3 }} className={`bn-rise overflow-hidden ${CARD} hover:!translate-y-0`} aria-label="Kullanıcılar" aria-busy={query.isFetching}>
        <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Durum" className="flex gap-1">
            {[
              ["", "Tümü", "TUMU"],
              ["AKTIF", "Aktif", "AKTIF"],
              ["PASIF", "Pasif", "PASIF"],
            ].map(([value, name, counterKey]) => (
              <button
                key={name}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] transition ${
                  status === value ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
                } ${FOCUS}`}
              >
                {name}
                <span className={`rounded-full px-1.5 text-[10.5px] font-bold tabular-nums ${status === value ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--muted)]"}`}>
                  {data?.sayaclar?.[counterKey] ?? "–"}
                </span>
              </button>
            ))}
          </div>
          <label className="relative block md:w-72">
            <span className="sr-only">Ara</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <I name="search" size={14} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ad soyad, e-posta"
              className="h-9 w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-8 pr-3 text-[12.5px] text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
            />
          </label>
        </div>

        {query.isPending ? (
          <Loading row={4} title={false} />
        ) : query.isError ? (
          <ErrorBox error={query.error} onRetry={() => query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="Kullanıcı bulunamadı" description={q || status ? "Arama ya da durum filtresine uyan kullanıcı yok." : undefined} actions={(q || status) && [{ etiket: "Filtreleri temizle", onClick: () => { setSearch(""); setStatus(""); } }]} />
        ) : (
          <div className={`overflow-x-auto transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>
            <table className="min-w-full text-[12.5px]">
              <thead>
                <tr className="border-y border-[var(--border)] bg-[var(--soft)] text-left text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <SortableHeader field="adSoyad" sorting={sorting} onSort={sort} className={th}>Kullanıcı</SortableHeader>
                  <th scope="col" className={th}>Telefon</th>
                  <SortableHeader field="yetki" sorting={sorting} onSort={sort} className={th}>Yetki</SortableHeader>
                  <SortableHeader field="sonGiris" sorting={sorting} onSort={sort} className={th}>Son Giriş</SortableHeader>
                  <SortableHeader field="durum" sorting={sorting} onSort={sort} className={th}>Durum</SortableHeader>
                  {editable && <th scope="col" className={`${th} text-right`}>İşlem</th>}
                </tr>
              </thead>
              <tbody>
                {sorted.map((k, i) => (
                  <tr key={k.kullaniciId} className={`transition-colors hover:bg-[var(--soft)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                    <td className={td}>
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[11px] font-extrabold text-[var(--brand-text)]" aria-hidden="true">
                          {initials(k.adSoyad)}
                        </span>
                        <span>
                          <span className="block font-semibold text-[var(--fg)]">
                            {k.adSoyad}
                            {k.kendisi && <span className="ml-1.5 rounded-full bg-[var(--soft-2)] px-1.5 py-px text-[10px] font-bold text-[var(--fg-2)]">Siz</span>}
                          </span>
                          <span className="block text-[11px] text-[var(--muted)]">{k.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{k.telefon || "—"}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${PERMISSION_TONE[k.yetki] || ""}`}>{labelOf("permission", k.yetki)}</span>
                    </td>
                    <td className={`${td} tabular-nums text-[var(--fg-2)]`}>{k.sonGiris ? formatDateTime(k.sonGiris) : <span className="text-[var(--muted)]">Henüz girmedi</span>}</td>
                    <td className={td}>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(k.durum)}`}>{labelOf("recordStatus", k.durum)}</span>
                    </td>
                    {editable && (
                      <td className={`${td} text-right`}>
                        <button
                          type="button"
                          onClick={() => setEditingItem(k)}
                          className={`inline-flex h-8 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}
                        >
                          <I name="edit" size={13} />
                          Düzenle
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingItem && <UserForm existing={editingItem === "yeni" ? null : editingItem} onClose={() => setEditingItem(null)} onSaved={saved} />}
      {notice && <Notice text={notice} onDone={noticeDone} />}
    </>
  );
}

function UserForm({ existing, onClose, onSaved }) {
  const self = !!existing?.kendisi;
  const [f, setF] = useState({
    adSoyad: existing?.adSoyad || "",
    email: existing?.email || "",
    telefon: existing?.telefon || "",
    yetki: existing?.yetki || "ODEME",
    durum: existing?.durum || "AKTIF",
  });
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const create = useCreateUser();
  const update = useUpdateUser();
  const sending = create.isPending || update.isPending;

  // ekran tarafı doğrulama; sunucu aynı kuralları ve e-posta tekliği / son yönetici kurallarını uygular
  const errors = {};
  if (!f.adSoyad.trim()) errors.adSoyad = "Ad soyad girin.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = "Geçerli bir e-posta girin.";
  if (f.telefon.trim() && figures(f.telefon).length < 10) errors.telefon = "Geçerli bir telefon girin.";
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
      requestAnimationFrame(() => document.querySelector('#bn-kullanici-form [aria-invalid="true"]')?.focus());
      return;
    }
    const body = { adSoyad: f.adSoyad.trim(), email: f.email.trim(), telefon: f.telefon.trim(), yetki: f.yetki, durum: f.durum };
    try {
      onSaved(existing ? await update.mutateAsync({ kullaniciId: existing.kullaniciId, body }) : await create.mutateAsync(body), !existing);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) {
        setServerErrors(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-kullanici-form [aria-invalid="true"]')?.focus());
      } else {
        setServerMessage(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  return (
    <Modal
      title={existing ? `${existing.adSoyad} kaydını düzenle` : "Yeni kullanıcı"}
      subtitle={existing ? (self ? "Kendi yetkinizi ve durumunuzu değiştiremezsiniz." : "Yetki değişikliği bir sonraki girişte geçerli olur.") : "Kullanıcı şifresini e-postasına gelen bağlantıyla belirler."}
      onClose={onClose}
      width="max-w-lg"
    >
      <form id="bn-kullanici-form" noValidate onSubmit={save} className="flex flex-col gap-3" aria-busy={sending}>
        {existing && <AuditNote record={existing} />}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="bn-k-ad" label="Ad soyad" error={h("adSoyad")} className="sm:col-span-2">
            <input id="bn-k-ad" value={f.adSoyad} onChange={(e) => change({ ...f, adSoyad: e.target.value })} aria-invalid={h("adSoyad") ? true : undefined} className={inputCls(h("adSoyad"))} />
          </Field>
          <Field id="bn-k-eposta" label="E-posta" error={h("email")} hint={existing ? undefined : "Giriş adı olarak kullanılır."}>
            <input id="bn-k-eposta" type="email" value={f.email} onChange={(e) => change({ ...f, email: e.target.value })} aria-invalid={h("email") ? true : undefined} className={inputCls(h("email"))} />
          </Field>
          <Field id="bn-k-tel" label="Telefon" error={h("telefon")}>
            <input id="bn-k-tel" type="tel" value={f.telefon} onChange={(e) => change({ ...f, telefon: e.target.value })} aria-invalid={h("telefon") ? true : undefined} className={`${inputCls(h("telefon"))} tabular-nums`} />
          </Field>
        </div>

        <fieldset aria-describedby={h("yetki") ? "bn-k-yetki-hata" : undefined}>
          <legend className="mb-1.5 text-[12px] font-semibold text-[var(--fg-2)]">Yetki</legend>
          <div role="radiogroup" aria-label="Yetki" className="grid grid-cols-1 gap-2">
            {PERMISSIONS.map((y) => {
              const selected = f.yetki === y;
              return (
                <button
                  key={y}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={self}
                  onClick={() => change({ ...f, yetki: y })}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                  } ${FOCUS}`}
                >
                  <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${selected ? "border-[var(--brand)] bg-[var(--brand)]" : "border-[var(--border-strong)]"}`} aria-hidden="true">
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span className="leading-snug">
                    <span className="block text-[12.5px] font-bold text-[var(--fg)]">{labelOf("permission", y)}</span>
                    <span className="block text-[11.5px] text-[var(--muted)]">{labelOf("permissionDescription", y)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {h("yetki") && (
            <p id="bn-k-yetki-hata" role="alert" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
              {h("yetki")}
            </p>
          )}
        </fieldset>

        <label className={`flex items-start gap-3 rounded-xl border p-3 ${self ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${h("durum") ? "border-[var(--danger)]" : "border-[var(--border-strong)]"}`}>
          <input type="checkbox" role="switch" disabled={self} checked={f.durum === "AKTIF"} onChange={(e) => change({ ...f, durum: e.target.checked ? "AKTIF" : "PASIF" })} aria-invalid={h("durum") ? true : undefined} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
          <span className="leading-snug">
            <span className="block text-[12.5px] font-bold text-[var(--fg)]">Aktif</span>
            <span className="block text-[11.5px] text-[var(--muted)]">Pasif kullanıcı panele giremez; firmanın en az bir aktif Yöneticisi olmalıdır.</span>
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
