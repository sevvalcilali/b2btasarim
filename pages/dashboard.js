import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { Card, Button, Select, Field } from "@/components/ui";
import Icon from "@/components/Icons";
import { useRole } from "@/components/RoleContext";
import { ROLES, ROLE_META } from "@/lib/roles";
import { kpis, islemler, bakiyeOzet } from "@/lib/mockData";

const WEEK = [
  { d: "Pzt", v: 62 }, { d: "Sal", v: 78 }, { d: "Çar", v: 54 },
  { d: "Per", v: 91 }, { d: "Cum", v: 100 }, { d: "Cmt", v: 40 }, { d: "Paz", v: 28 },
];

export default function Dashboard() {
  const { role } = useRole();
  const meta = ROLE_META[role];
  const stats = kpis[role];
  const bakiye = bakiyeOzet[role];

  const columns = [
    { key: "id", label: "İşlem No" },
    { key: "tarih", label: "Tarih" },
    { key: "musteri", label: "Müşteri" },
    { key: "tutar", label: "Tutar", align: "right" },
    { key: "taksit", label: "Taksit" },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
  ];

  return (
    <Layout title="Ana Sayfa">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Ana Sayfa</h1>
          <p className="mt-1 text-sm text-slate-500">
            {meta.company} · Bugünkü işlem özeti
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Role-specific "cari seçimi" per the spec */}
          {role === ROLES.BAYI && (
            <Field label="" className="w-56">
              <Select defaultValue="">
                <option value="">Ana Firma Cari Seçimi</option>
                <option>Brisa A.Ş. — 320.00.001</option>
                <option>Brisa Perakende — 320.00.002</option>
              </Select>
            </Field>
          )}
          {role === ROLES.ALT_BAYI && (
            <Field label="" className="w-56">
              <Select defaultValue="">
                <option value="">Bayi Cari Seçimi</option>
                <option>Ankara Lastik Bayi — 320.01.001</option>
              </Select>
            </Field>
          )}
          <Select defaultValue="Bugün" className="w-32">
            <option>Bugün</option>
            <option>Bu Hafta</option>
            <option>Bu Ay</option>
          </Select>
          <Button icon="download" variant="ghost">Dışa Aktar</Button>
        </div>
      </div>

      {/* KPI cards — Başarılı / Başarısız / İptal / İade / Toplam */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ key, ...s }) => (
          <StatCard key={key} {...s} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly volume */}
        <Card title="Haftalık İşlem Hacmi" subtitle="Son 7 gün" className="lg:col-span-2">
          <div className="flex h-52 items-end gap-3">
            {WEEK.map((w) => (
              <div key={w.d} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end justify-center" style={{ height: "160px" }}>
                  <div
                    className="w-full max-w-[42px] rounded-t-md bg-gradient-to-t from-navy-800 to-brand-blue transition-all"
                    style={{ height: `${w.v}%` }}
                    title={`%${w.v}`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{w.d}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Balance / debt panel — per role (Bakiye ve Borç Görüntüleme) */}
        <Card title="Bakiye ve Borç" subtitle={role === ROLES.ANA_FIRMA ? "Firma limiti" : "Üst cari görünümü"}>
          <div className="space-y-4">
            <div className="rounded-lg bg-navy-50 p-4">
              <p className="text-xs font-medium text-navy-800/70">Kullanılabilir Bakiye</p>
              <p className="mt-1 text-2xl font-extrabold text-navy-900">{bakiye.bakiye}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Güncel Borç</span>
              <span className="font-semibold text-accent-red">{bakiye.borc}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ödeme Limiti</span>
              <span className="font-semibold text-navy-900">{bakiye.limit}</span>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Limit Kullanımı</span>
                <span>%{bakiye.kullanim}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-blue" style={{ width: `${bakiye.kullanim}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900">
            <Icon name="report" size={20} /> Son İşlemler
          </h2>
          <Button variant="subtle" icon="chevron">Tümünü Gör</Button>
        </div>
        <DataTable columns={columns} rows={islemler.slice(0, 6)} />
      </div>
    </Layout>
  );
}
