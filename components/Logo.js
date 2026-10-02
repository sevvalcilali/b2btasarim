// Text-based rendition of the pay'n kolay / N Kolay Bayim brand lockup.
export default function Logo({ variant = "light", showSub = true }) {
  const isLight = variant === "light";
  const main = isLight ? "text-white" : "text-navy-800";
  const accent = "text-brand-blue";
  return (
    <div className="flex flex-col leading-none">
      {showSub && (
        <span className={`text-[10px] font-semibold tracking-[0.2em] ${isLight ? "text-brand-sky" : "text-brand-blue"}`}>
          N KOLAY BAYİM
        </span>
      )}
      <span className={`mt-1 text-xl font-extrabold tracking-tight ${main}`}>
        pay<span className={accent}>'n</span>kolay
      </span>
    </div>
  );
}
