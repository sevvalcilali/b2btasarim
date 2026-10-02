import { useState } from "react";
import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Select, Button, InfoNote } from "@/components/ui";
import { useRole } from "@/components/RoleContext";
import { ROLES } from "@/lib/roles";

const ALL_TAKSIT = ["Tek Çekim", "2", "3", "6", "9", "12"];

export default function Tanimlama() {
  const { role } = useRole();
  const isAnaFirma = role === ROLES.ANA_FIRMA;
  const entity = isAnaFirma ? "Bayi" : "Alt Bayi";

  const [taksitler, setTaksitler] = useState(["Tek Çekim", "3", "6"]);
  const [altBayiYetki, setAltBayiYetki] = useState(true);

  const toggleTaksit = (t) =>
    setTaksitler((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <Layout title={`${entity} Tanımlama`}>
      <PageHeader
        title={`${entity} Tanımlama`}
        subtitle={`Yeni ${entity.toLowerCase()} kaydı oluşturun`}
        actions={
          <>
            <Button variant="ghost" icon="excel">Excel ile Toplu Ekle</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Firma Bilgileri">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ünvan" className="sm:col-span-2">
                <Input placeholder={`${entity} ünvanı`} />
              </Field>
              <Field label="Cari No">
                <Input placeholder="320.01.___" />
              </Field>
              <Field label="Vergi No">
                <Input placeholder="__________" />
              </Field>
              <Field label="Telefon">
                <Input placeholder="0___ ___ __ __" />
              </Field>
              <Field label="E-posta">
                <Input placeholder="ornek@firma.com" />
              </Field>
              <Field label="Adres" className="sm:col-span-2">
                <Input placeholder="Açık adres" />
              </Field>
            </div>
          </Card>

          <Card title="Taksit & Vade Ayarları">
            <Field label="Vade Farkı Profili" className="mb-4 max-w-xs">
              <Select>
                <option>Profil 1 — 1,89%</option>
                <option>Profil 2 — 2,45%</option>
                <option>Profil 3 — 2,90%</option>
                <option>Profil 4 — 3,25%</option>
                <option>Profil 5 — 3,80%</option>
              </Select>
            </Field>

            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Görünecek Taksit Seçenekleri
            </span>
            <p className="mb-2 text-xs text-slate-400">
              Seçilmeyen taksitler ödeme ekranında gösterilmez (örn. sadece 2 ve 7).
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAKSIT.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTaksit(t)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                    taksitler.includes(t)
                      ? "border-brand-blue bg-brand-sky text-brand-blue"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Yetki & Limit">
            <Field label="Müşteri Türü" className="mb-4">
              <Select>
                <option>{entity}</option>
                <option>Müşteri</option>
              </Select>
            </Field>
            <Field label="İşlem Bazlı Ödeme Limiti (₺)" className="mb-4">
              <Input placeholder="0,00" inputMode="numeric" />
            </Field>

            {isAnaFirma && (
              <label className="mb-4 flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={altBayiYetki}
                  onChange={(e) => setAltBayiYetki(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-semibold">Alt bayi tanımlayabilir</span>
                  <br />
                  <span className="text-xs text-slate-400">
                    Aktif ise bu bayi kendi alt bayilerini tanımlayabilir.
                  </span>
                </span>
              </label>
            )}

            <Field label="Ana Firma Alt Üye İşyerleri">
              <Select multiple className="!h-28">
                <option>Brisa İş Makinası Lastik</option>
                <option>Brisa Perakende Lastik</option>
                <option>Brisa Filo Çözümleri</option>
              </Select>
            </Field>
          </Card>

          <InfoNote>
            Tek çekim dahil kaldırılan taksitler gösterilmez. {entity} bazında seçilen vade profili
            işlemlerde uygulanır.
          </InfoNote>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 justify-center">İptal</Button>
            <Button variant="accent" icon="check" className="flex-1 justify-center">
              Kaydet
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
