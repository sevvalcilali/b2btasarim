// Ayarlar › Firma Bilgileri — şartname s.10: bayi / alt bayi kendi kimlik, iletişim, ödeme koşulları ve ortaklarını görür;
// iletişim bilgisini Yönetici günceller, tanım alanları üst firmada kalır. Veri: GET /firma, PUT /firma/iletisim,
// GET /uye-isyerleri, GET /oturum (yetki)
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { ApiError } from "@/lib/api/error";
import { formatNumber, tl, formatPercent } from "@/lib/format";
import { statusTone, labelOf } from "@/lib/labels";
import { useSession } from "@/lib/queries/session";
import { useCompany, useUpdateCompanyContact, useMerchants } from "@/lib/queries/definitions";
import { ErrorBox, Loading } from "../states";
import { errorHandler } from "../payment";
import { Field, Notice, Breadcrumb, Modal, inputCls, AuditNote } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";
import { figures } from "../helpers";

const installmentSummary = (l) => l.map((n) => (n === 1 ? "Tek" : n)).join(", ");

function Row({ name, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-0.5 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4 ${className}`}>
      <dt className="shrink-0 text-[12px] text-[var(--muted)] sm:w-40">{name}</dt>
      <dd className="text-[12.5px] font-semibold text-[var(--fg)] sm:text-right">{children}</dd>
    </div>
  );
}

function Card({ no, title, description, i, action, children }) {
  return (
    <section style={{ "--i": i }} className={`bn-rise p-4 sm:p-5 ${CARD} hover:!translate-y-0`} aria-labelledby={`bn-firma-${no}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 id={`bn-firma-${no}`} className="text-sm font-bold text-[var(--fg)]">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CompanyInfo({ role, meta, onNavigate }) {
  const query = useCompany();
  const merchants = useMerchants();
  const session = useSession();
  const f = query.data;
  const editable = session.data?.kullanici.yetki === "YONETICI";
  const parentName = role === ROLES.ALT_BAYI ? "bayiniz" : "ana firma";
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);
  const merchantName = (accountNo) => merchants.data?.kayitlar.find((u) => u.cariNo === accountNo)?.ad || accountNo;

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Breadcrumb onHome={() => onNavigate(HOME)} path={["Ayarlar", "Firma Bilgileri"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Firma Bilgileri</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · {f ? `${labelOf("companyKind", f.tur)} · ${f.bagli ? `${f.bagli.unvan} ağında` : ""}` : "Yükleniyor…"}
        </p>
      </div>

      {query.isPending ? (
        <Loading row={6} />
      ) : query.isError ? (
        <ErrorBox error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card no={1} i={0} title="Kimlik" description={`Tanımı ${parentName} yapar; değişiklik için ${parentName === "bayiniz" ? "bayinize" : "ana firmaya"} başvurun.`}>
            <dl className="divide-y divide-[var(--border)]">
              <Row name="Unvan">{f.unvan}</Row>
              <Row name="Cari No"><span className="tabular-nums">{f.cariNo}</span></Row>
              <Row name="Vergi No"><span className="tabular-nums">{f.vergiNo}</span></Row>
              <Row name="Tür">{labelOf("companyKind", f.tur)}</Row>
              <Row name="Bağlı olduğu firma">{f.bagli ? `${f.bagli.unvan} (${labelOf("companyKind", f.bagli.tur)})` : "—"}</Row>
              <Row name="Durum">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone(f.durum)}`}>{labelOf("recordStatus", f.durum)}</span>
              </Row>
            </dl>
          </Card>

          <Card
            no={2}
            i={1}
            title="İletişim"
            description={editable ? "Ödeme linkleri ve bildirimler bu bilgilerle gönderilir." : "Güncellemek için Yönetici yetkisi gerekir."}
            action={
              editable && (
                <button type="button" onClick={() => setEditing(true)} className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[var(--border-strong)] px-3 text-[12px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] ${FOCUS}`}>
                  <I name="edit" size={13} />
                  Düzenle
                </button>
              )
            }
          >
            <dl className="divide-y divide-[var(--border)]">
              <Row name="Telefon"><span className="tabular-nums">{f.telefon}</span></Row>
              <Row name="E-posta">{f.email}</Row>
              <Row name="Adres"><span className="block sm:max-w-xs">{f.adres}</span></Row>
            </dl>
            <AuditNote record={f} className="mt-2" />
          </Card>

          <Card no={3} i={2} title="Ödeme Koşulları" description={`${parentName === "bayiniz" ? "Bayinizin" : "Ana firmanın"} bayi tanımında belirlenir; ödeme ekranları bu sınırlarla çalışır.`}>
            <dl className="divide-y divide-[var(--border)]">
              <Row name="Vade farkı profili">{f.vadeProfil ? `${f.vadeProfil.ad.replace("Vade Farkı ", "")} · ${formatPercent(f.vadeProfil.oranYuzde, 2)} / ay` : "—"}</Row>
              <Row name="Açık taksitler"><span className="tabular-nums">{f.taksitler.length ? installmentSummary(f.taksitler) : "—"}</span></Row>
              <Row name="İşlem bazlı ödeme limiti"><span className="tabular-nums">{f.islemLimitiKurus ? tl(f.islemLimitiKurus) : "—"}</span></Row>
              {f.tur === "BAYI" && (
                <>
                  <Row name="Alt bayi tanımlayabilir">{f.altBayiYetkisi ? "Evet" : "Hayır"}</Row>
                  <Row name="Alt bayi sayısı"><span className="tabular-nums">{formatNumber(f.altBayiSayisi)}</span></Row>
                </>
              )}
              <Row name="Üye işyerleri">
                <span className="flex flex-wrap gap-1 sm:justify-end">
                  {f.uyeIsyerleri.length ? f.uyeIsyerleri.map((c) => (
                    <span key={c} className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-2)]">
                      {merchantName(c)}
                    </span>
                  )) : "—"}
                </span>
              </Row>
            </dl>
          </Card>

          <Card no={4} i={3} title="Ortaklar" description="Şirket ortakları; ödeme ekranında kendi kartı seçeneğinde listelenir.">
            {f.ortaklar.length === 0 ? (
              <p className="text-[12.5px] text-[var(--muted)]">Tanımlı ortak yok.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {f.ortaklar.map((name) => (
                  <li key={name} className="flex items-center gap-2.5 py-2 text-[12.5px] font-semibold text-[var(--fg)]">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[10.5px] font-extrabold text-[var(--brand-text)]" aria-hidden="true">
                      {name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")
                        .toLocaleUpperCase("tr-TR")}
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {editing && f && (
        <ContactForm
          existing={f}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setNotice("İletişim bilgileri kaydedildi.");
          }}
        />
      )}
      {notice && <Notice text={notice} onDone={noticeDone} />}
    </>
  );
}

function ContactForm({ existing, onClose, onSaved }) {
  const [f, setF] = useState({ telefon: existing.telefon || "", email: existing.email || "", adres: existing.adres || "" });
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const update = useUpdateCompanyContact();

  const errors = {};
  if (figures(f.telefon).length < 10) errors.telefon = "Geçerli bir telefon girin.";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = "Geçerli bir e-posta girin.";
  if (!f.adres.trim()) errors.adres = "Adres girin.";
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
      requestAnimationFrame(() => document.querySelector('#bn-iletisim-form [aria-invalid="true"]')?.focus());
      return;
    }
    try {
      await update.mutateAsync({ telefon: f.telefon.trim(), email: f.email.trim(), adres: f.adres.trim() });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.alanlar).length) {
        setServerErrors(err.alanlar);
        requestAnimationFrame(() => document.querySelector('#bn-iletisim-form [aria-invalid="true"]')?.focus());
      } else {
        setServerMessage(err?.message || "Kayıt yapılamadı.");
      }
    }
  };

  return (
    <Modal title="İletişim bilgilerini düzenle" subtitle={existing.unvan} onClose={onClose} width="max-w-md">
      <form id="bn-iletisim-form" noValidate onSubmit={save} className="flex flex-col gap-3" aria-busy={update.isPending}>
        <Field id="bn-f-tel" label="Telefon" error={h("telefon")}>
          <input id="bn-f-tel" type="tel" value={f.telefon} onChange={(e) => change({ ...f, telefon: e.target.value })} aria-invalid={h("telefon") ? true : undefined} className={`${inputCls(h("telefon"))} tabular-nums`} />
        </Field>
        <Field id="bn-f-eposta" label="E-posta" error={h("email")}>
          <input id="bn-f-eposta" type="email" value={f.email} onChange={(e) => change({ ...f, email: e.target.value })} aria-invalid={h("email") ? true : undefined} className={inputCls(h("email"))} />
        </Field>
        <Field id="bn-f-adres" label="Adres" error={h("adres")}>
          <textarea id="bn-f-adres" rows={3} value={f.adres} onChange={(e) => change({ ...f, adres: e.target.value })} aria-invalid={h("adres") ? true : undefined} className={`${inputCls(h("adres"))} h-auto py-2`} />
        </Field>
        {serverMessage && (
          <p role="alert" className="rounded-xl bg-[var(--danger-soft)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--danger-text)]">
            {serverMessage}
          </p>
        )}
        <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`inline-flex h-10 items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-[13px] font-semibold text-[var(--fg-2)] hover:border-[var(--brand)] ${FOCUS}`}>
            Vazgeç
          </button>
          <button type="submit" disabled={update.isPending} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[var(--brand)] px-6 text-[13px] font-bold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70 ${FOCUS}`}>
            <I name="check" size={15} strokeWidth={2.2} />
            {update.isPending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
