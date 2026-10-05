// Firma logoları (mockup). Firma adına göre ilgili logo çizilir:
//   Brisa A.Ş.             → yeşil daire, beyaz halka, çizgisel "B" (verilen örnek logoya göre)
//   Ankara Lastik Bayi     → turuncu lastik: dişli halka içinde "A"
//   Çankaya Oto Servis     → mor daire içinde anahtar (servis)
// Tanınmayan bir ad için baş harf + renkli kutu kullanılır.
// tone="light": koyu / renkli zeminlerde logonun etrafına ince beyaz çerçeve çizer.

function BrisaMark() {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill="#4F9B7C" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#FFFFFF" strokeWidth="3.2" />
      {/* çizgisel B: dış hat + iç gövde çizgisi */}
      <path
        d="M36.5 26 H48 A10.5 10.5 0 0 1 48 47 H51.5 A13.5 13.5 0 0 1 51.5 74 H36.5 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M43 31.5 V74" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function AnkaraMark() {
  // lastik dişleri: halkada 12 kısa çentik
  const treads = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI * 2) / 12;
    return (
      <line
        key={i}
        x1={(50 + Math.cos(a) * 33).toFixed(1)}
        y1={(50 + Math.sin(a) * 33).toFixed(1)}
        x2={(50 + Math.cos(a) * 41).toFixed(1)}
        y2={(50 + Math.sin(a) * 41).toFixed(1)}
        stroke="#C2630F"
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  });
  return (
    <>
      <rect width="100" height="100" rx="24" fill="#C2630F" />
      <circle cx="50" cy="50" r="37" fill="#FFFFFF" />
      {treads}
      <circle cx="50" cy="50" r="27" fill="#C2630F" />
      <path d="M39.5 64 L50 35 L60.5 64 M43.5 54 H56.5" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function CankayaMark() {
  return (
    <>
      <circle cx="50" cy="50" r="50" fill="#6B2E8F" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#F5C243" strokeWidth="2.5" strokeDasharray="5 4" />
      {/* anahtar (servis) */}
      <g transform="translate(23 23) scale(2.25)">
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}

function variantFor(name) {
  const n = name.toLocaleLowerCase("tr-TR");
  if (n.startsWith("brisa")) return "brisa";
  if (n.startsWith("ankara")) return "ankara";
  if (n.startsWith("çankaya")) return "cankaya";
  return null;
}

export default function CompanyLogo({ name = "Brisa A.Ş.", color = "#0C34E7", size = 40, tone = "brand", className = "" }) {
  const variant = variantFor(name);
  const ring = tone === "light";

  if (variant) {
    const round = variant !== "ankara";
    return (
      <svg width={size} height={size} viewBox="-3 -3 106 106" className={className} role="img" aria-label={`${name} logosu`}>
        {ring &&
          (round ? (
            <circle cx="50" cy="50" r="52.5" fill="#FFFFFF" />
          ) : (
            <rect x="-2.5" y="-2.5" width="105" height="105" rx="26.5" fill="#FFFFFF" />
          ))}
        {variant === "brisa" && <BrisaMark />}
        {variant === "ankara" && <AnkaraMark />}
        {variant === "cankaya" && <CankayaMark />}
      </svg>
    );
  }

  // yedek: baş harf + renkli kutu
  const initial = name.trim().charAt(0).toLocaleUpperCase("tr-TR");
  const box = ring ? "#FFFFFF" : color;
  const ink = ring ? color : "#FFFFFF";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} role="img" aria-label={`${name} logosu`}>
      <rect width="40" height="40" rx="10" fill={box} />
      <text x="20" y="26" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="19" fill={ink}>
        {initial}
      </text>
    </svg>
  );
}
