import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Select, Textarea, Button } from "@/components/ui";
import Badge from "@/components/Badge";
import Icon from "@/components/Icons";
import { duyurular } from "@/lib/mockData";

export default function Duyuru() {
  return (
    <Layout title="Duyuru">
      <PageHeader
        title="Duyuru Yönetimi"
        subtitle="Bayi ve alt bayi ekranlarına pop-up mesaj gönderin"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Yeni Duyuru" className="lg:col-span-1">
          <div className="space-y-4">
            <Field label="Başlık">
              <Input placeholder="Örn. +3 Taksit Kampanyası" />
            </Field>
            <Field label="Hedef Kitle">
              <Select>
                <option>Bayi + Alt Bayi</option>
                <option>Sadece Bayi</option>
                <option>Sadece Alt Bayi</option>
                <option>Tüm Paneller</option>
              </Select>
            </Field>
            <Field label="Yayın Bitiş Tarihi">
              <Input type="date" />
            </Field>
            <Field label="Mesaj">
              <Textarea placeholder="Duyuru metni..." />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
              Giriş sonrası pop-up olarak göster
            </label>
            <Button variant="accent" icon="megaphone" className="w-full justify-center">
              Duyuru Yayınla
            </Button>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-navy-900">Yayınlanan Duyurular</h3>
          {duyurular.map((d) => (
            <div key={d.id} className="rounded-xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-sky text-brand-blue">
                    <Icon name="megaphone" size={18} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-navy-900">{d.baslik}</h4>
                      <Badge>{d.durum}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{d.icerik}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Icon name="dealer" size={13} /> {d.hedef}
                      </span>
                      <span>Yayın: {d.tarih}</span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-accent-red">
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
