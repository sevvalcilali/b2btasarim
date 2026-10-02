import { useState } from "react";
import Layout from "@/components/Layout";
import { PageHeader, InfoNote, Button } from "@/components/ui";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { iptalIadeTalepleri } from "@/lib/mockData";

const TABS = ["Onayda", "Onaylandı", "Reddedildi", "Üst Onaya İletildi"];

export default function IptalIadeOnay() {
  const [tab, setTab] = useState("Onayda");
  const rows = iptalIadeTalepleri.filter((t) => t.durum === tab);

  const columns = [
    { key: "id", label: "Talep No" },
    { key: "islemId", label: "İşlem No" },
    { key: "tarih", label: "Tarih" },
    { key: "talepEden", label: "Talep Eden" },
    { key: "tur", label: "Tür", render: (r) => <Badge>{r.tur}</Badge> },
    { key: "tutar", label: "Tutar", align: "right" },
    { key: "aciklama", label: "Açıklama" },
    {
      key: "aksiyon",
      label: "İşlem",
      render: (r) =>
        r.durum === "Onayda" ? (
          <div className="flex gap-2">
            <Button variant="accent" icon="check" className="!px-2.5 !py-1 text-xs">
              Onayla
            </Button>
            <Button variant="danger" icon="x" className="!px-2.5 !py-1 text-xs">
              Reddet
            </Button>
          </div>
        ) : (
          <Badge>{r.durum}</Badge>
        ),
    },
  ];

  return (
    <Layout title="İptal / İade Onay">
      <PageHeader
        title="İptal / İade Onay"
        subtitle="Bayi ve alt bayilerden gelen iptal/iade taleplerini onaylayın"
      />
      <InfoNote>
        Onaya düşen talepler e-posta ile bildirilir. Onaylandığında ilgili bayi/alt bayi
        bilgilendirilir.
      </InfoNote>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = iptalIadeTalepleri.filter((x) => x.durum === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                tab === t
                  ? "bg-navy-800 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                  tab === t ? "bg-white/20" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable columns={columns} rows={rows} empty="Bu durumda talep bulunmuyor." />
    </Layout>
  );
}
