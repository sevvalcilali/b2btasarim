import { useRouter } from "next/router";
import Icon from "./Icons";
import { useRole } from "./RoleContext";
import { ROLE_META, ROLE_ORDER } from "@/lib/roles";

export default function Topbar({ onMenu }) {
  const { role, setRole } = useRole();
  const router = useRouter();
  const meta = ROLE_META[role];

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-navy-800 hover:bg-slate-100 lg:hidden">
        <Icon name="home" size={20} />
      </button>

      {/* search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon name="search" size={18} />
        </span>
        <input
          placeholder="İşlem, cari veya müşteri ara..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Role switcher — mockup helper to preview all three panels */}
        <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
          {ROLE_ORDER.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                role === r ? "bg-navy-800 text-white shadow-sm" : "text-slate-500 hover:text-navy-800"
              }`}
              title={`${ROLE_META[r].label} paneline geç`}
            >
              {ROLE_META[r].label}
            </button>
          ))}
        </div>

        <button className="relative rounded-lg p-2 text-navy-800 hover:bg-slate-100">
          <Icon name="bell" size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-red ring-2 ring-white" />
        </button>

        {/* user */}
        <div className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1 sm:pr-2 hover:bg-slate-100">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-800 text-sm font-bold text-white">
            {meta.short}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold text-navy-900">{meta.user}</span>
            <span className="block text-xs text-slate-400">{meta.company}</span>
          </span>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-accent-red"
          title="Çıkış"
        >
          <Icon name="logout" size={19} />
        </button>
      </div>
    </header>
  );
}
