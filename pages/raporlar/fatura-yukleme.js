import Layout from "@/components/Layout";
import { PageHeader, FilterBar, Field, Input, Select, Button, InfoNote } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import Icon from "@/components/Icons";
import { faturaYuklemeleri } from "@/lib/mockData";

export default function FaturaYukleme() {
  const columns = [
    { key: "id", label: "Fatura No" },
    { key: "islemId", label: "İşlem No" },
    { key: "musteri", label: "Müşteri" },
    { key: "tutar", label: "Tutar", align: "right" },
    { key: "tarih", label: "Tarih" },
    { key: "dosya", label: "Dosya" },
    { key: "durum", label: "Durum", render: (r) => <Badge>{r.durum}</Badge> },
    {
      key: "aksiyon",
      label: "İşlem",
      render: (r) =>
        r.durum === "Yüklendi" ? (
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline">
            <Icon name="download" size={15} /> İndir
          </button>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-navy-800 hover:underline">
            <Icon name="upload" size={15} /> Yükle
            <input type="file" className="hidden" />
          </label>
        ),
    },
  ];

  const yuklenen = faturaYuklemeleri.filter((f) => f.durum === "Yüklendi").length;
  const bekleyen = faturaYuklemeleri.filter((f) => f.durum === "Bekliyor").length;

  return (
    <Layout title="Fatura Yükleme Detay">
      <PageHeader
        title="Fatura Yükleme Detay"
        subtitle="Yüklenen ve yüklenmemiş faturaların takibi"
        actions={
          <>
            <Button variant="ghost" icon="link">Yükleme Linki Oluştur</Button>
            <Button variant="accent" icon="upload">Fatura Yükle</Button>
          </>
        }
      />

      <InfoNote>
        Yüklenen faturalar şeklen kontrol edilerek içeri alınır; uygun olmayanlar reddedilir. Müşteri
        kartı ile yapılan işlemlerde "beyan" tıklanır.
      </InfoNote>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          {yuklenen} Yüklendi
        </div>
        <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          {bekleyen} Bekliyor
        </div>
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          1 Reddedildi
        </div>
      </div>

      <FilterBar>
        <Field label="İşlem No">
          <Input placeholder="TRX-" />
        </Field>
        <Field label="Durum">
          <Select>
            <option>Tümü</option>
            <option>Yüklendi</option>
            <option>Bekliyor</option>
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

      <DataTable columns={columns} rows={faturaYuklemeleri} />
    </Layout>
  );
}
