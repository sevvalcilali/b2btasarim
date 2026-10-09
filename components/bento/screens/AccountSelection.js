// Cari seçimi — şartname s.1–2: ana firmanın altında birden çok üye işyeri vardır; bayi ana sayfada "Ana Firma Cari
// Seçimi", alt bayi menüden "Bayi Carisi Seçimi" ile tahsilatın işleneceği üye işyerini seçer. Seçim oturumda tutulur.
// Veri: GET /uye-isyerleri, GET /oturum (aktifUyeIsyeri), PUT /oturum/aktif-uye-isyeri
import { useCallback, useState } from "react";
import { ROLES } from "@/lib/roles";
import I from "@/components/DesignIcons";
import { useSelectActiveMerchant, useSession } from "@/lib/queries/session";
import { useMerchants } from "@/lib/queries/definitions";
import { EmptyState, ErrorBox, LoadingBox } from "../states";
import { Notice, Breadcrumb } from "../shared";
import { HOME } from "../routes";
import { CARD, FOCUS } from "../theme";

/** Ana sayfadaki açılır seçim (bayi ve alt bayi) */
export function AccountPicker({ role }) {
  const session = useSession();
  const merchants = useMerchants();
  const select = useSelectActiveMerchant();
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);
  const [chosen, setChosen] = useState(null); // sunucu cevabı gelene kadar seçim ekranda kalsın
  const label = role === ROLES.ALT_BAYI ? "Bayi cari seçimi" : "Ana firma cari seçimi";
  const active = chosen ?? (session.data?.aktifUyeIsyeri?.cariNo || "");
  const options = merchants.data?.kayitlar || [];

  const change = async (accountNo) => {
    setChosen(accountNo);
    try {
      const u = await select.mutateAsync(accountNo);
      setNotice(`Tahsilat carisi ${u.ad} (${u.cariNo}) olarak seçildi.`);
    } catch (err) {
      setNotice(err?.message || "Cari seçilemedi.");
    } finally {
      setChosen(null); // önbellek güncellendi (ya da hata: eski değere dön)
    }
  };

  return (
    <>
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <select
          aria-label={label}
          value={active}
          disabled={!session.data || options.length === 0 || select.isPending}
          onChange={(e) => change(e.target.value)}
          className={`h-9 max-w-[260px] rounded-full border border-[var(--border-strong)] bg-[var(--surface)] pl-3 pr-8 text-[12.5px] font-medium text-[var(--fg-2)] transition hover:border-[var(--brand)] disabled:opacity-60 ${FOCUS}`}
        >
          {!active && <option value="">{label}</option>}
          {active && !options.some((u) => u.cariNo === active) && (
            <option value={active} disabled>
              {session.data.aktifUyeIsyeri.ad} — artık size açık değil
            </option>
          )}
          {options.map((u) => (
            <option key={u.cariNo} value={u.cariNo}>
              {u.ad} — {u.cariNo}
            </option>
          ))}
        </select>
      </label>
      {notice && <Notice text={notice} onDone={noticeDone} />}
    </>
  );
}

/** Ödeme ekranı alt başlığına eklenen not: " · Tahsilat carisi: Brisa Perakende (320.00.002)" */
export function ActiveAccountNote() {
  const session = useSession();
  const u = session.data?.aktifUyeIsyeri;
  if (!u || session.data.rol === "ANA_FIRMA") return null; // ana firmanın seçim ekranı yok; formdaki üye işyeri yeterli
  return (
    <>
      {" · Tahsilat carisi: "}
      <span className="font-semibold text-[var(--fg-2)]">
        {u.ad} <span className="tabular-nums">({u.cariNo})</span>
      </span>
    </>
  );
}

/** Alt bayi menüsü › Bayi Carisi Seçimi: kart listesinden seçim */
export function DealerAccountSelection({ meta, onNavigate }) {
  const session = useSession();
  const merchants = useMerchants();
  const select = useSelectActiveMerchant();
  const [notice, setNotice] = useState(null);
  const noticeDone = useCallback(() => setNotice(null), []);
  const active = session.data?.aktifUyeIsyeri?.cariNo;
  const options = merchants.data?.kayitlar || [];

  const makeSelection = async (u) => {
    try {
      await select.mutateAsync(u.cariNo);
      setNotice(`${u.ad} seçildi; sonraki ödemeler bu cariye işlenir.`);
    } catch (err) {
      setNotice(err?.message || "Cari seçilemedi.");
    }
  };

  return (
    <>
      <div className="bn-rise mb-4 px-1">
        <Breadcrumb onHome={() => onNavigate(HOME)} path={["Ödeme Al", "Bayi Carisi Seçimi"]} />
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">Bayi Carisi Seçimi</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
          {meta.company} · Bayinizin size açtığı üye işyerlerinden tahsilatın işleneceği cariyi seçin; seçim ödeme ekranlarında görünür
        </p>
      </div>

      {merchants.isPending || session.isPending ? (
        <LoadingBox />
      ) : merchants.isError ? (
        <ErrorBox error={merchants.error} onRetry={() => merchants.refetch()} />
      ) : options.length === 0 ? (
        <EmptyState title="Size açık üye işyeri yok" description="Bayinizin alt bayi tanımınızda en az bir üye işyeri açması gerekir." />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Üye işyerleri">
          {options.map((u, i) => {
            const selected = u.cariNo === active;
            return (
              <li key={u.cariNo} style={{ "--i": i }} className={`bn-rise flex items-center gap-3 p-4 sm:p-5 ${CARD} ${selected ? "!border-[var(--brand)]" : ""}`} aria-current={selected ? "true" : undefined}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-[12px] font-extrabold ${selected ? "bg-[var(--brand)] text-white" : "bg-[var(--brand-soft)] text-[var(--brand-text)]"}`} aria-hidden="true">
                  <I name="building" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-[var(--fg)]">{u.ad}</h2>
                  <p className="text-[11.5px] tabular-nums text-[var(--muted)]">Cari no {u.cariNo}</p>
                </div>
                {selected ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--success-text)]">
                    <I name="check" size={12} strokeWidth={2.4} />
                    Seçili
                  </span>
                ) : (
                  <button type="button" onClick={() => makeSelection(u)} disabled={select.isPending} className={`inline-flex h-9 shrink-0 items-center rounded-full bg-[var(--brand)] px-4 text-[12.5px] font-bold text-white transition hover:brightness-110 disabled:opacity-60 ${FOCUS}`}>
                    Seç
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {notice && <Notice text={notice} onDone={noticeDone} />}
    </>
  );
}
