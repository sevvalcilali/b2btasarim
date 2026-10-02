import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Select, Button } from "@/components/ui";
import Icon from "@/components/Icons";
import { kurBilgisi } from "@/lib/mockData";

export default function Kur() {
  return (
    <Layout title="USD / Euro Kur Bilgisi">
      <PageHeader
        title="USD / Euro Kur Bilgisi"
        subtitle="Güncel döviz kurları ile döviz cinsinden tahsilat"
        actions={<span className="text-xs text-slate-400">Son güncelleme: 30.09.2026 14:30</span>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kurBilgisi.map((k) => (
          <Card key={k.code}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-50 font-bold text-navy-800">
                  {k.code}
                </span>
                <div>
                  <p className="font-semibold text-navy-900">{k.name}</p>
                  <p className="text-xs text-slate-400">1 {k.code}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  k.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}
              >
                {k.change}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Alış</p>
                <p className="mt-0.5 text-lg font-bold text-navy-900">₺ {k.alis}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Satış</p>
                <p className="mt-0.5 text-lg font-bold text-navy-900">₺ {k.satis}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 max-w-xl">
        <Card title="Döviz Çevirici" subtitle="Tahsilat öncesi tutar hesaplama">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <Field label="Tutar">
              <Input placeholder="100" inputMode="numeric" />
            </Field>
            <div className="hidden pb-2 text-slate-300 sm:block">
              <Icon name="exchange" size={22} />
            </div>
            <Field label="Para Birimi">
              <Select>
                <option>USD → TL</option>
                <option>EUR → TL</option>
                <option>TL → USD</option>
              </Select>
            </Field>
          </div>
          <div className="mt-4 rounded-lg bg-navy-50 p-4">
            <p className="text-xs text-navy-800/70">Yaklaşık Tutar</p>
            <p className="mt-0.5 text-2xl font-extrabold text-navy-900">₺ 3.428,00</p>
          </div>
          <Button variant="accent" className="mt-4 w-full justify-center" icon="wallet">
            Bu Tutarla Ödeme Al
          </Button>
        </Card>
      </div>
    </Layout>
  );
}
