import Icon from "./Icons";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Button({ children, variant = "primary", icon, className = "", ...props }) {
  const variants = {
    primary: "bg-navy-800 text-white hover:bg-navy-700 shadow-sm",
    accent: "bg-brand-blue text-white hover:bg-brand-light shadow-sm",
    ghost: "bg-white text-navy-800 ring-1 ring-slate-200 hover:bg-slate-50",
    subtle: "bg-brand-sky text-brand-blue hover:bg-brand-sky/70",
    danger: "bg-white text-accent-red ring-1 ring-red-200 hover:bg-red-50",
  };
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function Card({ title, subtitle, children, className = "", footer }) {
  return (
    <div className={`rounded-xl bg-white shadow-card ring-1 ring-slate-200/70 ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-slate-100 px-5 py-4">
          {title && <h3 className="font-semibold text-navy-900">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && <div className="border-t border-slate-100 px-5 py-3">{footer}</div>}
    </div>
  );
}

export function Field({ label, children, hint, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

export function Input(props) {
  return <input className={inputBase} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={`${inputBase} appearance-none bg-[right_0.75rem_center] pr-9`} {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className={`${inputBase} min-h-[90px] resize-y`} {...props} />;
}

export function FilterBar({ children }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-card ring-1 ring-slate-200/70">
      {children}
    </div>
  );
}

export function InfoNote({ children }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand-sky/60 px-4 py-3 text-sm text-navy-800 ring-1 ring-brand-blue/10">
      <span className="mt-0.5 text-brand-blue">
        <Icon name="report" size={16} />
      </span>
      <span>{children}</span>
    </div>
  );
}
