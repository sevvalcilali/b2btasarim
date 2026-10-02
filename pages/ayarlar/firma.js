import { useState } from "react";
import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Button } from "@/components/ui";
import Icon from "@/components/Icons";
import { useRole } from "@/components/RoleContext";
import { ROLE_META } from "@/lib/roles";

export default function FirmaBilgileri() {
  const { role } = useRole();
  const meta = ROLE_META[role];
  const [mails, setMails] = useState(["muhasebe@firma.com", "bilgi@firma.com"]);
  const [yeniMail, setYeniMail] = useState("");

  const addMail = () => {
    if (yeniMail.trim()) {
      setMails((m) => [...m, yeniMail.trim()]);
      setYeniMail("");
    }
  };

  return (
    <Layout title="Firma Bilgileri">
      <PageHeader title="Firma Bilgileri" subtitle="Kendi firma ve iletişim bilgilerinizi görüntüleyin ve düzenleyin" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Firma Kartı" className="lg:col-span-1">
          <div className="flex flex-col items-center py-2 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-navy-800 text-2xl font-bold text-white">
              {meta.short}
            </span>
            <p className="mt-3 font-semibold text-navy-900">{meta.company}</p>
            <p className="text-sm text-slate-400">{meta.label} Paneli</p>
            <Button variant="ghost" icon="upload" className="mt-4">
              Logo Yükle
            </Button>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Firma & Ortak Bilgileri">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ünvan" className="sm:col-span-2">
                <Input defaultValue={meta.company} />
              </Field>
              <Field label="Vergi Dairesi">
                <Input defaultValue="Büyük Mükellefler V.D." />
              </Field>
              <Field label="Vergi No">
                <Input defaultValue="1234567890" />
              </Field>
              <Field label="Yetkili / Ortak">
                <Input defaultValue="Mehmet Yılmaz" />
              </Field>
              <Field label="Telefon">
                <Input defaultValue="0312 555 12 34" />
              </Field>
              <Field label="Adres" className="sm:col-span-2">
                <Input defaultValue="Çankaya, Ankara" />
              </Field>
            </div>
          </Card>

          <Card title="Bildirim E-posta Adresleri" subtitle="İşlem ve onay bildirimleri bu adreslere gönderilir">
            <div className="space-y-2">
              {mails.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <Icon name="user" size={16} className="text-slate-400" />
                    {m}
                  </span>
                  <button
                    onClick={() => setMails((arr) => arr.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-accent-red"
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="yeni@firma.com"
                value={yeniMail}
                onChange={(e) => setYeniMail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMail()}
              />
              <Button variant="accent" icon="plus" onClick={addMail}>
                Ekle
              </Button>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="primary" icon="check">Değişiklikleri Kaydet</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
