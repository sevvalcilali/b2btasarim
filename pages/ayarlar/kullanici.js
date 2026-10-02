import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Select, Button } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Icon from "@/components/Icons";
import { kullanicilar } from "@/lib/mockData";

const YETKILER = [
  { key: "yonetici", label: "Yönetici", desc: "Tüm ekranlar, iptal/iade giriş ve onayı dahil" },
  { key: "odeme", label: "Ödeme", desc: "Ödeme ekranları, raporlar, ödeme bildirimi" },
  { key: "raporlama", label: "Raporlama", desc: "Sadece raporlar" },
];

export default function KullaniciTanim() {
  const columns = [
    { key: "ad", label: "Ad Soyad", render: (r) => <span className="font-medium text-navy-900">{r.ad}</span> },
    { key: "email", label: "E-posta" },
    { key: "rol", label: "Rol", render: (r) => <Badge tone="blue">{r.rol}</Badge> },
    { key: "yetki", label: "Yetki Seti" },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
    {
      key: "aksiyon",
      label: "",
      render: () => (
        <button className="text-slate-400 hover:text-navy-800">
          <Icon name="settings" size={16} />
        </button>
      ),
    },
  ];

  return (
    <Layout title="Kullanıcı Tanım">
      <PageHeader title="Kullanıcı Tanım" subtitle="Panel kullanıcıları ve yetkilendirme" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Yeni Kullanıcı" className="lg:col-span-1">
          <div className="space-y-4">
            <Field label="Ad Soyad">
              <Input placeholder="Ad Soyad" />
            </Field>
            <Field label="E-posta">
              <Input placeholder="ornek@firma.com" />
            </Field>
            <Field label="Yetki Seti">
              <Select>
                {YETKILER.map((y) => (
                  <option key={y.key}>{y.label}</option>
                ))}
              </Select>
            </Field>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Yetki Tanımları
              </p>
              <ul className="space-y-2">
                {YETKILER.map((y) => (
                  <li key={y.key} className="text-sm">
                    <span className="font-semibold text-navy-900">{y.label}</span>
                    <span className="block text-xs text-slate-400">{y.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
              Ödeme bildirimi (e-posta) kısıtla
            </label>
            <Button variant="accent" icon="plus" className="w-full justify-center">
              Kullanıcı Ekle
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <h3 className="mb-3 font-semibold text-navy-900">Tanımlı Kullanıcılar</h3>
          <DataTable columns={columns} rows={kullanicilar} />
        </div>
      </div>
    </Layout>
  );
}
