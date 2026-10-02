import Layout from "@/components/Layout";
import { PageHeader, FilterBar, Field, Input, Select, Button } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { iptalIadeTalepleri } from "@/lib/mockData";

export default function IptalIadeTakip() {
  const columns = [
    { key: "id", label: "Talep No" },
    { key: "islemId", label: "İşlem No" },
    { key: "tarih", label: "Tarih" },
    { key: "talepEden", label: "Talep Eden" },
    { key: "tur", label: "Tür", render: (r) => <Badge>{r.tur}</Badge> },
    { key: "tutar", label: "Tutar", align: "right" },
    { key: "aciklama", label: "Açıklama" },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
  ];

  return (
    <Layout title="İptal / İade Takip">
      <PageHeader
        title="İptal / İade Takip"
        subtitle="Tüm iptal ve iade taleplerinizin durumunu izleyin"
        actions={<Button variant="accent" icon="plus">Yeni Talep</Button>}
      />

      <FilterBar>
        <Field label="Talep No / İşlem No">
          <Input placeholder="TLP- veya TRX-" />
        </Field>
        <Field label="Tür">
          <Select>
            <option>Tümü</option>
            <option>İptal</option>
            <option>İade</option>
          </Select>
        </Field>
        <Field label="Durum">
          <Select>
            <option>Tümü</option>
            <option>Onayda</option>
            <option>Onaylandı</option>
            <option>Reddedildi</option>
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

      <DataTable columns={columns} rows={iptalIadeTalepleri} />
    </Layout>
  );
}
