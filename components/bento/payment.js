// Manuel ödeme ve link ile ödemenin ortak müşteri bölümü (şartname s.6). Veri: GET /bayiler, GET /musteriler,
// GET /tahsilat-carileri, GET /firma. Taksit, limit ve vade farkı ekranların kendi isteğiyle (/odeme/taksit-secenekleri) gelir.
import { useEffect, useRef, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { labelOf } from "@/lib/labels";
import { useDealers } from "@/lib/queries/dealers";
import { useCustomers, useCollectionAccounts } from "@/lib/queries/payment";
import { useSession } from "@/lib/queries/session";
import { useCompany } from "@/lib/queries/definitions";
import { inputCls, Field, CustomerPicker } from "./shared";
import { FOCUS } from "./theme";
import { figures } from "./helpers";

// Rolün seçebildiği müşteri türleri (şartname s.6)
const CUSTOMER_OPTIONS = {
  [ROLES.ANA_FIRMA]: ["BAYI", "DUZENLI_MUSTERI", "DUZENSIZ_MUSTERI"],
  [ROLES.BAYI]: ["ALT_BAYI", "DUZENLI_MUSTERI", "DUZENSIZ_MUSTERI", "KENDI_KARTI"],
  [ROLES.ALT_BAYI]: ["MUSTERI_KARTI", "KENDI_KARTI"],
};

// tanımlı (listeden seçilen) müşteri türleri
export const LISTELI = new Set(["BAYI", "ALT_BAYI", "DUZENLI_MUSTERI"]);

const EMPTY_PERSON = { ad: "", kimlikNo: "", tel: "", email: "" };

// onerilenCari: listeden "Ödeme Al" ile gelindiğinde müşteri türü ve müşteri hazır seçili gelir
export function useCustomerSelection(role, suggestedAccount) {
  const kinds = CUSTOMER_OPTIONS[role];
  const dealerKind = kinds.find((t) => t === "BAYI" || t === "ALT_BAYI");
  const dealers = useDealers({ tur: dealerKind, durum: "AKTIF" }, { enabled: !!dealerKind });
  const customers = useCustomers({}, { enabled: kinds.includes("DUZENLI_MUSTERI") });
  const accounts = useCollectionAccounts();
  const company = useCompany();
  const session = useSession();

  const [kind, setKindStatus] = useState(kinds[0]);
  const [selected, setSelected] = useState(null);
  const [own, setOwn] = useState("");
  const [person, setPerson] = useState(EMPTY_PERSON);
  const [account, setAccount] = useState("");

  const lists = {
    BAYI: dealers.data?.kayitlar,
    ALT_BAYI: dealers.data?.kayitlar,
    DUZENLI_MUSTERI: customers.data?.kayitlar,
  };
  const options = lists[kind] || [];
  const listLoading = LISTELI.has(kind) && (kind === "DUZENLI_MUSTERI" ? customers.isPending : dealers.isPending);

  // önerilen cari listelerden birinde bulununca o türe geçilir ve seçilir (bir kez)
  const applied = useRef(false);
  useEffect(() => {
    if (!suggestedAccount || applied.current) return;
    for (const t of kinds) {
      const record = lists[t]?.find((x) => x.cariNo === suggestedAccount);
      if (record) {
        applied.current = true;
        setKindStatus(t);
        setSelected(record);
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedAccount, dealers.data, customers.data]);

  // tahsilat carisi: oturumdaki cari seçimi (ana sayfa / Bayi Carisi Seçimi) listedeyse o, değilse ilk kayıt
  useEffect(() => {
    const list = accounts.data?.kayitlar;
    if (account || !list?.length || session.isPending) return;
    const active = session.data?.aktifUyeIsyeri?.cariNo;
    setAccount(list.some((c) => c.cariNo === active) ? active : list[0].cariNo);
  }, [accounts.data, account, session.data, session.isPending]);

  const ownCard = kind === "KENDI_KARTI";
  const ownOptions = company.data ? [{ ad: company.data.unvan, rol: "Firma unvanı" }, ...(company.data.ortaklar || []).map((o) => ({ ad: o, rol: "Ortak" }))] : [];

  // ekran tarafı doğrulama; anahtarlar sunucu cevabındaki alan adlarıyla aynı
  const errors = {};
  if (LISTELI.has(kind) && !selected) errors.musteriCariNo = "Listeden bir müşteri seçin.";
  if (kind === "DUZENSIZ_MUSTERI" || kind === "MUSTERI_KARTI") {
    if (!person.ad.trim()) errors.musteriUnvan = "Ad soyad ya da unvan girin.";
    if (figures(person.tel).length < 10) errors.musteriTelefon = "Geçerli bir telefon numarası girin.";
  }
  if (kind === "DUZENSIZ_MUSTERI" && ![10, 11].includes(figures(person.kimlikNo).length)) errors.musteriKimlikNo = "10 haneli VKN ya da 11 haneli TCKN girin.";
  if (ownCard && !own) errors.kartSahibi = "Kartın kime ait olduğunu seçin.";
  if (!account) errors.tahsilatCariNo = "Tahsilat carisi seçin.";

  const accountName = accounts.data?.kayitlar.find((c) => c.cariNo === account) || null;

  return {
    kinds,
    tur: kind,
    selected,
    setSelected,
    kendi: own,
    setOwn,
    person,
    setPerson,
    account,
    setAccount,
    accounts: accounts.data?.kayitlar || [],
    accountLabel: accounts.data?.etiket || "Tahsilat carisi",
    secenekler: options,
    listLoading,
    ownOptions,
    ownCard,
    firma: company.data || null,
    hatalar: errors,
    loading: accounts.isPending || company.isPending,
    hata: accounts.error || company.error || dealers.error || customers.error || null,
    ad: LISTELI.has(kind) ? selected?.unvan : ownCard ? own : person.ad.trim(),
    // link gönderiminde öneri olarak kullanılan iletişim bilgisi
    contact: LISTELI.has(kind)
      ? { tel: selected?.telefon || "", email: selected?.email || "" }
      : ownCard
        ? { tel: company.data?.telefon || "", email: company.data?.email || "" }
        : { tel: person.tel, email: person.email },
    accountName,
    // ödeme / link isteğinin müşteri kısmı (sözleşme: OdemeGirdisi)
    body: () => ({
      musteriTuru: kind,
      musteri: LISTELI.has(kind)
        ? { cariNo: selected?.cariNo }
        : ownCard
          ? undefined
          : { unvan: person.ad.trim(), kimlikNo: figures(person.kimlikNo) || undefined, telefon: person.tel.trim(), email: person.email.trim() || undefined },
      kartSahibi: ownCard ? own : undefined,
      tahsilatCariNo: account,
    }),
    setKind: (t) => {
      setKindStatus(t);
      setSelected(null);
      setOwn("");
    },
    sifirla: () => {
      setKindStatus(kinds[0]);
      setSelected(null);
      setOwn("");
      setPerson(EMPTY_PERSON);
    },
  };
}

export function CustomerSection({ role, m, h }) {
  const { kinds, tur: kind, setKind, secenekler: options, listLoading, selected, setSelected, person, setPerson, ownCard, ownOptions, kendi: own, setOwn, accounts, accountLabel, account, setAccount } = m;
  return (
    <>
      <div role="radiogroup" aria-label="Müşteri türü" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
        {kinds.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={kind === t}
            onClick={() => setKind(t)}
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-[12.5px] transition ${
              kind === t ? "bg-[var(--brand)] font-bold text-white" : "bg-[var(--soft)] font-semibold text-[var(--fg-2)] hover:text-[var(--brand-text)]"
            } ${FOCUS}`}
          >
            {labelOf("customerKind", t)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LISTELI.has(kind) && (
          <Field
            id="bn-musteri"
            label={kind === "DUZENLI_MUSTERI" ? "Tanımlı müşteri" : labelOf("customerKind", kind)}
            error={h("musteriCariNo")}
            hint={listLoading ? "Liste yükleniyor…" : undefined}
            className="sm:col-span-2"
          >
            <CustomerPicker key={kind} id="bn-musteri" options={options} selected={selected} onSelect={setSelected} error={h("musteriCariNo")} />
          </Field>
        )}

        {LISTELI.has(kind) && selected && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[var(--soft)] p-3 text-[12px] sm:col-span-2 sm:grid-cols-4">
            {[
              ["Cari No", selected.cariNo],
              ["Vergi No", selected.vergiNo],
              ["Telefon", selected.telefon],
              ["E-posta", selected.email],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[11px] text-[var(--muted)]">{k}</dt>
                <dd className="truncate font-semibold tabular-nums text-[var(--fg)]">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {(kind === "DUZENSIZ_MUSTERI" || kind === "MUSTERI_KARTI") && (
          <>
            <Field id="bn-ad" label="Ad soyad / Unvan" error={h("musteriUnvan")}>
              <input id="bn-ad" value={person.ad} onChange={(e) => setPerson({ ...person, ad: e.target.value })} aria-invalid={h("musteriUnvan") ? true : undefined} autoComplete="name" className={inputCls(h("musteriUnvan"))} />
            </Field>
            {kind === "DUZENSIZ_MUSTERI" && (
              <Field id="bn-vkn" label="TCKN / VKN" error={h("musteriKimlikNo")}>
                <input
                  id="bn-vkn"
                  inputMode="numeric"
                  maxLength={11}
                  value={person.kimlikNo}
                  onChange={(e) => setPerson({ ...person, kimlikNo: figures(e.target.value) })}
                  aria-invalid={h("musteriKimlikNo") ? true : undefined}
                  className={`${inputCls(h("musteriKimlikNo"))} tabular-nums`}
                />
              </Field>
            )}
            <Field id="bn-tel" label="Telefon" error={h("musteriTelefon")}>
              <input
                id="bn-tel"
                type="tel"
                inputMode="tel"
                placeholder="05XX XXX XX XX"
                value={person.tel}
                onChange={(e) => setPerson({ ...person, tel: e.target.value })}
                aria-invalid={h("musteriTelefon") ? true : undefined}
                autoComplete="tel"
                className={`${inputCls(h("musteriTelefon"))} tabular-nums`}
              />
            </Field>
            <Field id="bn-eposta" label="E-posta (isteğe bağlı)">
              <input id="bn-eposta" type="email" value={person.email} onChange={(e) => setPerson({ ...person, email: e.target.value })} autoComplete="email" className={inputCls()} />
            </Field>
            {kind === "DUZENSIZ_MUSTERI" && (
              <p className="flex items-start gap-1.5 text-[11.5px] text-[var(--muted)] sm:col-span-2">
                <I name="info" size={13} className="mt-px shrink-0" />
                Düzensiz müşteride bilgiler bu alanlarla sınırlıdır; müşteri tanımı oluşturulmaz.
              </p>
            )}
          </>
        )}

        {ownCard && (
          <fieldset className="sm:col-span-2" aria-describedby={h("kartSahibi") ? "bn-kendi-hata" : undefined}>
            <legend className="mb-1 block text-[12px] font-semibold text-[var(--fg-2)]">Kart sahibi</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {ownOptions.map((o) => (
                <label
                  key={o.ad}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                    own === o.ad ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border-strong)] hover:border-[var(--brand)]"
                  }`}
                >
                  <input type="radio" name="bn-kendi" value={o.ad} checked={own === o.ad} onChange={() => setOwn(o.ad)} aria-invalid={h("kartSahibi") ? true : undefined} className="h-4 w-4 accent-[var(--brand)]" />
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[12.5px] font-bold text-[var(--fg)]">{o.ad}</span>
                    <span className="block text-[11px] text-[var(--muted)]">{o.rol}</span>
                  </span>
                </label>
              ))}
            </div>
            {h("kartSahibi") && (
              <p id="bn-kendi-hata" className="mt-1 text-[11.5px] font-semibold text-[var(--danger-text)]">
                {h("kartSahibi")}
              </p>
            )}
          </fieldset>
        )}

        <Field id="bn-cari" label={accountLabel} error={h("tahsilatCariNo")} hint={role === ROLES.ANA_FIRMA ? "Ödemenin alınacağı üye işyeri." : "Ödemenin aktarılacağı cari."} className="sm:col-span-2">
          <select id="bn-cari" value={account} onChange={(e) => setAccount(e.target.value)} aria-invalid={h("tahsilatCariNo") ? true : undefined} className={inputCls(h("tahsilatCariNo"))}>
            {accounts.length === 0 && <option value="">Yükleniyor…</option>}
            {accounts.map((c) => (
              <option key={c.cariNo} value={c.cariNo}>
                {c.ad} — {c.cariNo}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </>
  );
}

/** Sunucudan dönen alan hatalarını (ApiHatasi.alanlar) forma bağlayan yardımcı: h(k) → ekran ya da sunucu hatası */
export function errorHandler(attempted, errors, serverErrors) {
  return (k) => serverErrors[k] || (attempted ? errors[k] : undefined);
}
