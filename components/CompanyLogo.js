// Örnek firma logosu — yer tutucudur, gerçek logo dosyalarıyla değiştirilecek.
// Firma adının baş harfini ve firmaya özel rengi kullanır.
// tone="brand": renkli kutu / beyaz harf (açık zeminler için)
// tone="light": beyaz kutu / renkli harf (renkli ve koyu zeminler için)
export default function CompanyLogo({ name = "Brisa A.Ş.", color = "#0C34E7", size = 40, tone = "brand", className = "" }) {
  const initial = name.trim().charAt(0).toLocaleUpperCase("tr-TR");
  const box = tone === "light" ? "#FFFFFF" : color;
  const ink = tone === "light" ? color : "#FFFFFF";
  const soft = tone === "light" ? color : "#FFFFFF";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} role="img" aria-label={`${name} logosu`}>
      <rect width="40" height="40" rx="10" fill={box} />
      {/* lastik izi motifi */}
      <path d="M9 30.5h22" stroke={soft} strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2.5" />
      <text x="20" y="24.5" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="19" fill={ink}>
        {initial}
      </text>
    </svg>
  );
}
