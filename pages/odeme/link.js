import { useState } from "react";
import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Select, Textarea, Button, InfoNote } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Icon from "@/components/Icons";
import { useRole } from "@/components/RoleContext";
import { ROLES } from "@/lib/roles";
import { cariler } from "@/lib/mockData";

const links = [
  { id: "LNK-7781", musteri: "Yılmaz Otomotiv", tutar: "₺ 12.400", olusturma: "30.09.2026", gecerlilik: "03.10.2026", durum: "Bekliyor" },
  { id: "LNK-7778", musteri: "Demir Ticaret", tutar: "₺ 3.200", olusturma: "29.09.2026", gecerlilik: "02.10.2026", durum: "Başarılı" },
  { id: "LNK-7770", musteri: "Kaya Lastik", tutar: "₺ 8.750", olusturma: "28.09.2026", gecerlilik: "30.09.2026", durum: "İptal" },
];

function musteriTurleri(role) {
  if (role === ROLES.ANA_FIRMA) return ["Bayi", "Tanımlı Müşteri", "Düzensiz Müşteri", "Kendi Kartı"];
  if (role === ROLES.BAYI) return ["Alt Bayi", "Tanımlı Müşteri", "Düzensiz Müşteri", "Kendi Kartı"];
  return ["Müşteri Kartı", "Kendi Kartı"];
}

export default function LinkOdeme() {
  const { role } = useRole();
  const turler = musteriTurleri(role);
  const [tur, setTur] = useState(turler[0]);
  const isDuzensiz = tur === "Düzensiz Müşteri";

  const columns = [
    { key: "id", label: "Link No" },
    { key: "musteri", label: "Müşteri" },
    { key: "tutar", label: "Tutar", align: "right" },
    { key: "olusturma", label: "Oluşturma" },
    { key: "gecerlilik", label: "Geçerlilik" },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
    {
      key: "aksiyon",
      label: "",
      render: () => (
        <button className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline">
          <Icon name="link" size={15} /> Kopyala
        </button>
      ),
    },
  ];

  return (
    <Layout title="Link ile Ödeme">
      <PageHeader title="Link ile Ödeme" subtitle="Ödeme linki oluşturup müşteriye iletin" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Yeni Ödeme Linki" className="lg:col-span-1">
          <div className="space-y-4">
            <Field label="Müşteri Türü">
              <Select value={tur} onChange={(e) => setTur(e.target.value)}>
                {turler.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            {isDuzensiz ? (
              <Field label="Müşteri Ünvanı">
                <Input placeholder="Ünvan girin" />
              </Field>
            ) : (
              <Field label="Cari / Müşteri">
                <Select defaultValue="">
                  <option value="" disabled>
                    Seçin...
                  </option>
                  {cariler.map((c) => (
                    <option key={c.cari}>{c.unvan}</option>
                  ))}
                </Select>
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tutar (₺)">
                <Input placeholder="0,00" inputMode="numeric" />
              </Field>
              <Field label="Max. Taksit">
                <Select>
                  <option>Tek Çekim</option>
                  <option>3</option>
                  <option>6</option>
                  <option>9</option>
                </Select>
              </Field>
            </div>
            <Field label="Geçerlilik Süresi">
              <Select>
                <option>24 saat</option>
                <option>3 gün</option>
                <option>7 gün</option>
              </Select>
            </Field>
            <Field label="E-posta / SMS ile gönder">
              <Input placeholder="ornek@firma.com" />
            </Field>
            <Field label="Açıklama">
              <Textarea placeholder="Ödeme açıklaması (opsiyonel)" />
            </Field>
            <Button variant="accent" icon="link" className="w-full justify-center">
              Link Oluştur
            </Button>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <InfoNote>
            Oluşturulan linkler müşteriye e-posta veya SMS ile iletilir. Ödeme tamamlandığında işlem
            raporlarda otomatik görünür.
          </InfoNote>
          <div>
            <h3 className="mb-3 font-semibold text-navy-900">Oluşturulan Linkler</h3>
            <DataTable columns={columns} rows={links} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
