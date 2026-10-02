import Layout from "@/components/Layout";
import { PageHeader, FilterBar, Field, Input, Select, Button } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { useRole } from "@/components/RoleContext";
import { ROLES } from "@/lib/roles";
import { bayiler, altBayiler } from "@/lib/mockData";

export default function BayiOzet() {
  const { role } = useRole();
  // Ana Firma → Bayi Özet, Bayi → Alt Bayi Özet
  const isAnaFirma = role === ROLES.ANA_FIRMA;
  const source = isAnaFirma ? bayiler : altBayiler;
  const title = isAnaFirma ? "Bayi Özet" : "Alt Bayi Özet";
  const nameCol = isAnaFirma ? "Bayi Ünvanı" : "Alt Bayi Ünvanı";

  // Build summary rows (ad / ciro basis per spec)
  const rows = source.map((b, i) => ({
    id: b.id,
    unvan: b.unvan,
    cari: b.cari,
    adet: [268, 412, 190, 96, 61][i % 5],
    ciro: b.ciro,
    vadeFarki: ["₺ 21.4K", "₺ 30.2K", "₺ 12.8K", "₺ 6.1K", "₺ 3.9K"][i % 5],
    hesaba: b.ciro,
    durum: b.durum,
  }));

  const columns = [
    { key: "unvan", label: nameCol },
    { key: "cari", label: "Cari No" },
    { key: "adet", label: "İşlem Adet", align: "right" },
    { key: "ciro", label: "Ciro", align: "right" },
    { key: "vadeFarki", label: "Vade Farkı", align: "right" },
    { key: "hesaba", label: "Hesaba Geçen", align: "right" },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
  ];

  return (
    <Layout title={title}>
      <PageHeader
        title={title}
        subtitle={`${isAnaFirma ? "Bayi" : "Alt bayi"} bazlı işlem adedi ve ciro özeti`}
        actions={<Button variant="ghost" icon="excel">Excel'e Aktar</Button>}
      />

      <FilterBar>
        <Field label={nameCol}>
          <Input placeholder="Ünvan ara..." />
        </Field>
        <Field label="Müşteri Türü">
          <Select>
            <option>Tümü</option>
            <option>{isAnaFirma ? "Bayi" : "Alt Bayi"}</option>
            <option>Müşteri</option>
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

      <DataTable columns={columns} rows={rows} />
    </Layout>
  );
}
