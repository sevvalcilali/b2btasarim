import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Button, InfoNote } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Icon from "@/components/Icons";
import { vadeFarkiProfilleri } from "@/lib/mockData";

export default function VadeFarki() {
  const columns = [
    { key: "ad", label: "Profil Adı", render: (r) => <span className="font-medium text-navy-900">{r.ad}</span> },
    { key: "oran", label: "Vade Farkı Oranı", render: (r) => <Badge tone="navy">{r.oran}</Badge> },
    { key: "aciklama", label: "Açıklama" },
    { key: "bayiSayisi", label: "Bağlı Bayi", align: "right" },
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
    <Layout title="Vade Farkı Profili">
      <PageHeader title="Vade Farkı Profili" subtitle="En fazla 5 vade farkı profili tanımlanabilir" />

      <InfoNote>
        Vade farkı oluşturulabilen ekranlarda tek bir vade farkı girilir; farklı oranlar Profil 1-2-3-4-5
        olarak kaydedilir. Bayi bazında seçilen profil işlemlerde uygulanır.
      </InfoNote>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Yeni / Düzenle Profil" className="lg:col-span-1">
          <div className="space-y-4">
            <Field label="Profil Adı">
              <Input placeholder="Vade Farkı Profil 5" />
            </Field>
            <Field label="Vade Farkı Oranı (%)" hint="Örn. 2,45">
              <Input placeholder="0,00" inputMode="decimal" />
            </Field>
            <Field label="Açıklama">
              <Input placeholder="Kısa açıklama" />
            </Field>
            <div className="flex items-center gap-3 rounded-lg bg-brand-sky/50 p-3 text-sm text-navy-800">
              <Icon name="report" size={16} />
              <span>
                <strong>{vadeFarkiProfilleri.length}/5</strong> profil tanımlı
              </span>
            </div>
            <Button variant="accent" icon="check" className="w-full justify-center">
              Profili Kaydet
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <h3 className="mb-3 font-semibold text-navy-900">Tanımlı Profiller</h3>
          <DataTable columns={columns} rows={vadeFarkiProfilleri} />
        </div>
      </div>
    </Layout>
  );
}
