// Örnek ana firma logosu — yer tutucudur, gerçek logo dosyasıyla değiştirilecek.
// tone="brand": mavi kutu / beyaz işaret (açık zeminler için)
// tone="light": beyaz kutu / mavi işaret (mavi ve koyu zeminler için)
export default function CompanyLogo({ size = 40, tone = "brand", className = "", title = "Brisa A.Ş. logosu" }) {
  const box = tone === "light" ? "#FFFFFF" : "#0C34E7";
  const ink = tone === "light" ? "#0C34E7" : "#FFFFFF";
  const soft = tone === "light" ? "#D4D1FC" : "rgba(255,255,255,0.45)";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} role="img" aria-label={title}>
      <rect width="40" height="40" rx="10" fill={box} />
      {/* lastik izi motifi */}
      <path d="M9 30.5h22" stroke={soft} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2.5" />
      <text
        x="20"
        y="24.5"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="19"
        fill={ink}
      >
        B
      </text>
    </svg>
  );
}
