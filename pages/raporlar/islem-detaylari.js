import Layout from "@/components/Layout";
import { PageHeader, FilterBar, Field, Input, Select, Button } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import StatCard from "@/components/StatCard";
import { islemler } from "@/lib/mockData";

export default function IslemDetaylari() {
  const columns = [
    { key: "id", label: "İşlem No" },
    { key: "tarih", label: "Tarih" },
    { key: "musteri", label: "Ünvan" },
    { key: "cari", label: "Cari No" },
    { key: "tip", label: "Tip", render: (r) => <Badge tone="blue">{r.tip}</Badge> },
    { key: "kart", label: "Kart" },
    { key: "taksit", label: "Taksit" },
    { key: "tutar", label: "Tutar", align: "right" },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
  ];

  return (
    <Layout title="İşlem Detayları">
      <PageHeader
        title="İşlem Detayları"
        subtitle="Tüm ödeme işlemlerinin detaylı raporu"
        actions={
          <>
            <Button variant="ghost" icon="excel">Excel</Button>
            <Button variant="ghost" icon="download">PDF</Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Toplam İşlem" value="1.284" tone="navy" />
        <StatCard label="Toplam Ciro" value="₺ 4.28M" tone="green" />
        <StatCard label="Ort. Sepet" value="₺ 3.337" tone="navy" />
        <StatCard label="Vade Farkı" value="₺ 96.4K" tone="amber" />
      </div>

      <FilterBar>
        <Field label="İşlem No">
          <Input placeholder="TRX-" />
        </Field>
        <Field label="Müşteri Türü">
          <Select>
            <option>Tümü</option>
            <option>Bayi</option>
            <option>Alt Bayi</option>
            <option>Müşteri</option>
          </Select>
        </Field>
        <Field label="Cari No">
          <Input placeholder="120.01.___" />
        </Field>
        <Field label="Vergi No">
          <Input placeholder="__________" />
        </Field>
        <Field label="Durum">
          <Select>
            <option>Tümü</option>
            <option>Başarılı</option>
            <option>Başarısız</option>
            <option>İptal</option>
            <option>İade</option>
          </Select>
        </Field>
        <Field label="Başlangıç">
          <Input type="date" />
        </Field>
        <Field label="Bitiş">
          <Input type="date" />
        </Field>
        <Button icon="filter" className="mb-[1px]">Filtrele</Button>
      </FilterBar>

      <DataTable columns={columns} rows={islemler} />
    </Layout>
  );
}
