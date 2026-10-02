const TONE = {
  navy: { bar: "bg-navy-800", text: "text-navy-800", soft: "bg-navy-50" },
  green: { bar: "bg-green-500", text: "text-green-600", soft: "bg-green-50" },
  red: { bar: "bg-red-500", text: "text-red-600", soft: "bg-red-50" },
  amber: { bar: "bg-amber-500", text: "text-amber-600", soft: "bg-amber-50" },
};

export default function StatCard({ label, value, count, tone = "navy" }) {
  const t = TONE[tone] || TONE.navy;
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
      <span className={`absolute inset-y-0 left-0 w-1 ${t.bar}`} />
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {typeof count === "number" && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.soft} ${t.text}`}>
            {count} adet
          </span>
        )}
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${t.text}`}>{value}</p>
    </div>
  );
}
