import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Icon from "./Icons";
import Logo from "./Logo";
import { getNav } from "@/lib/nav";
import { useRole } from "./RoleContext";
import { ROLE_META } from "@/lib/roles";

function isActive(pathname, href) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ open, onClose }) {
  const { role } = useRole();
  const router = useRouter();
  const nav = getNav(role);
  const meta = ROLE_META[role];

  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-navy-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy-900 text-slate-200 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo variant="light" />
          <button onClick={onClose} className="rounded-md p-1 text-slate-300 hover:bg-white/10 lg:hidden">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* active company card */}
        <div className="mx-4 mb-3 rounded-xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
          <p className="text-[10px] uppercase tracking-wider text-brand-sky/70">{meta.label} Paneli</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">{meta.company}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {nav.map((entry) =>
            entry.items ? (
              <NavGroup key={entry.label} entry={entry} pathname={router.pathname} />
            ) : (
              <NavLink key={entry.href} item={entry} active={isActive(router.pathname, entry.href)} onNavigate={onClose} />
            )
          )}
        </nav>
      </aside>
    </>
  );
}

function NavLink({ item, active, onNavigate, nested }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-brand-blue text-white shadow-sm"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      } ${nested ? "pl-11 text-[13px]" : ""}`}
    >
      {item.icon && <Icon name={item.icon} size={18} />}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavGroup({ entry, pathname }) {
  const groupActive = entry.items.some((i) => isActive(pathname, i.href));
  const [open, setOpen] = useState(groupActive);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          groupActive ? "text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon name={entry.icon} size={18} />
        <span className="flex-1 text-left">{entry.label}</span>
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>
          <Icon name="chevron" size={14} />
        </span>
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {entry.items.map((i) => (
            <NavLink key={i.href} item={i} active={isActive(pathname, i.href)} nested />
          ))}
        </div>
      )}
    </div>
  );
}
