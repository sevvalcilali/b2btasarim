// Status pill. Maps common Turkish statuses to a tone automatically.
const TONES = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-brand-sky text-brand-blue ring-brand-blue/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
  navy: "bg-navy-50 text-navy-800 ring-navy-800/20",
};

const STATUS_TONE = {
  Başarılı: "green",
  Aktif: "green",
  Onaylandı: "green",
  Yüklendi: "green",
  Yayında: "green",
  Başarısız: "red",
  Reddedildi: "red",
  Pasif: "gray",
  Arşiv: "gray",
  İptal: "amber",
  İade: "amber",
  Bekliyor: "amber",
  Onayda: "amber",
  "Üst Onaya İletildi": "blue",
};

export default function Badge({ children, tone }) {
  const t = tone || STATUS_TONE[children] || "gray";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[t]}`}
    >
      {children}
    </span>
  );
}
