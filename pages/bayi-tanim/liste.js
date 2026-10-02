import Link from "next/link";
import Layout from "@/components/Layout";
import { PageHeader, FilterBar, Field, Input, Select, Button } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Icon from "@/components/Icons";
import { useRole } from "@/components/RoleContext";
import { ROLES } from "@/lib/roles";
import { bayiler, altBayiler } from "@/lib/mockData";

export default function BayiListe() {
  const { role } = useRole();
  const isAnaFirma = role === ROLES.ANA_FIRMA;
  const entity = isAnaFirma ? "Bayi" : "Alt Bayi";
  const rows = isAnaFirma ? bayiler : altBayiler;

  const columns = [
    { key: "unvan", label: "Ünvan", render: (r) => <span className="font-medium text-navy-900">{r.unvan}</span> },
    { key: "cari", label: "Cari No" },
    { key: "vergiNo", label: "Vergi No" },
    { key: "telefon", label: "Telefon" },
    { key: "ciro", label: "Ciro", align: "right" },
    ...(isAnaFirma ? [{ key: "altBayi", label: "Alt Bayi", align: "right" }] : []),
    { key: "vadeProfil", label: "Vade Profili", render: (r) => <Badge tone="blue">{r.vadeProfil}</Badge> },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
    {
      key: "aksiyon",
      label: "İşlem",
      render: () => (
        <div className="flex items-center gap-3">
          <button className="text-sm font-semibold text-brand-blue hover:underline" title="Cari kartından ödeme al">
            Cari Ödeme
          </button>
          <button className="text-slate-400 hover:text-navy-800" title="Düzenle">
            <Icon name="settings" size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title={`${entity} Liste`}>
      <PageHeader
        title={`${entity} Listesi`}
        subtitle={`Tanımlı ${entity.toLowerCase()} kayıtları ve cari işlemleri`}
        actions={
          <>
            <Button variant="ghost" icon="excel">Toplu Bakiye / Borç Yükle</Button>
            <Button variant="ghost" icon="upload">Excel ile Toplu Ekle</Button>
            <Link href="/bayi-tanim/tanimlama">
              <Button variant="accent" icon="plus">Yeni {entity}</Button>
            </Link>
          </>
        }
      />

      <FilterBar>
        <Field label="Ünvan / Cari No">
          <Input placeholder="Ara..." />
        </Field>
        <Field label="Vade Profili">
          <Select>
            <option>Tümü</option>
            <option>Profil 1</option>
            <option>Profil 2</option>
            <option>Profil 3</option>
          </Select>
        </Field>
        <Field label="Durum">
          <Select>
            <option>Tümü</option>
            <option>Aktif</option>
            <option>Pasif</option>
          </Select>
        </Field>
        <Button icon="filter" className="mb-[1px]">Filtrele</Button>
      </FilterBar>

      <DataTable columns={columns} rows={rows} />
    </Layout>
  );
}
