import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { PageHeader, Card, Field, Input, Select, Button, InfoNote } from "@/components/ui";
import Icon from "@/components/Icons";
import { useRole } from "@/components/RoleContext";
import { ROLES } from "@/lib/roles";
import { cariler } from "@/lib/mockData";

// Müşteri türü options differ by role (spec: Tahsilat Ekranları).
function musteriTurleri(role) {
  if (role === ROLES.ANA_FIRMA)
    return ["Bayi", "Tanımlı Müşteri", "Düzensiz Müşteri", "Kendi Kartı"];
  if (role === ROLES.BAYI)
    return ["Alt Bayi", "Tanımlı Müşteri", "Düzensiz Müşteri", "Kendi Kartı"];
  return ["Müşteri Kartı", "Kendi Kartı"]; // Alt Bayi
}

const TAKSITLER = ["Tek Çekim", "2", "3", "6", "9", "12"]; // limited by vade profili

export default function ManuelOdeme() {
  const { role } = useRole();
  const turler = musteriTurleri(role);
  const [tur, setTur] = useState(turler[0]);
  const [tutar, setTutar] = useState("");
  const [taksit, setTaksit] = useState("Tek Çekim");

  const vadeFarki = useMemo(() => {
    const n = parseFloat(String(tutar).replace(/[^\d]/g, "")) || 0;
    if (taksit === "Tek Çekim") return { oran: 0, tutar: 0, toplam: n };
    const oran = { "2": 1.89, "3": 2.45, "6": 2.9, "9": 3.25, "12": 3.8 }[taksit] || 0;
    const fark = Math.round(n * (oran / 100));
    return { oran, tutar: fark, toplam: n + fark };
  }, [tutar, taksit]);

  const fmt = (n) => "₺ " + n.toLocaleString("tr-TR");
  const isDuzensiz = tur === "Düzensiz Müşteri";
  const isKendi = tur === "Kendi Kartı";

  return (
    <Layout title="Manuel Ödeme">
      <PageHeader
        title="Manuel Ödeme"
        subtitle="Kart bilgilerini girerek tahsilat oluşturun"
        actions={<Button variant="ghost" icon="exchange">USD / Euro ile Al</Button>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: payment + customer */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Müşteri Bilgileri">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Müşteri Türü">
                <Select value={tur} onChange={(e) => setTur(e.target.value)}>
                  {turler.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>

              {isKendi ? (
                <Field label="Kart Sahibi / Ortak" hint="Kendi kartı seçildiğinde otomatik gelir, değişmez.">
                  <Select>
                    <option>Firma Ünvanı — Brisa A.Ş.</option>
                    <option>Ortak — Mehmet Yılmaz</option>
                  </Select>
                </Field>
              ) : isDuzensiz ? (
                <Field label="Müşteri Ünvanı">
                  <Input placeholder="Ünvan girin" />
                </Field>
              ) : (
                <Field label="Cari Seçimi">
                  <Select defaultValue="">
                    <option value="" disabled>
                      Cari seçin...
                    </option>
                    {cariler.map((c) => (
                      <option key={c.cari}>
                        {c.unvan} — {c.cari}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              <Field label="Vergi / TC No">
                <Input placeholder="1234567890" disabled={!isDuzensiz && !isKendi} />
              </Field>
              <Field label="Telefon">
                <Input placeholder="0___ ___ __ __" disabled={!isDuzensiz} />
              </Field>
            </div>
            {isDuzensiz && (
              <InfoNote>
                Düzensiz müşteri bilgileri ödeme ekranındaki bilgilerle sınırlı olarak girilir.
              </InfoNote>
            )}
          </Card>

          <Card title="Kart Bilgileri">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Kart Numarası" className="sm:col-span-2">
                <Input placeholder="0000 0000 0000 0000" maxLength={19} />
              </Field>
              <Field label="Kart Üzerindeki İsim" className="sm:col-span-2">
                <Input placeholder="Ad Soyad" />
              </Field>
              <Field label="Son Kullanma">
                <Input placeholder="AA / YY" />
              </Field>
              <Field label="CVV">
                <Input placeholder="000" maxLength={4} />
              </Field>
            </div>
          </Card>
        </div>

        {/* Right: amount + summary */}
        <div className="space-y-6">
          <Card title="Tutar & Taksit">
            <Field label="İşlem Tutarı (₺)">
              <Input
                inputMode="numeric"
                value={tutar}
                onChange={(e) => setTutar(e.target.value)}
                placeholder="0,00"
              />
            </Field>
            <div className="mt-4">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Taksit Seçimi</span>
              <div className="grid grid-cols-3 gap-2">
                {TAKSITLER.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTaksit(t)}
                    className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                      taksit === t
                        ? "border-brand-blue bg-brand-sky text-brand-blue"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Taksit seçenekleri bayi vade profiline göre sınırlıdır.
              </p>
            </div>
          </Card>

          <Card title="Ödeme Özeti">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">İşlem Tutarı</dt>
                <dd className="font-semibold text-navy-900">{fmt(vadeFarki.toplam - vadeFarki.tutar)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Vade Farkı ({vadeFarki.oran}%)</dt>
                <dd className="font-semibold text-accent-amber">{fmt(vadeFarki.tutar)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Taksit</dt>
                <dd className="font-semibold text-navy-900">{taksit}</dd>
              </div>
              <div className="my-2 border-t border-dashed border-slate-200" />
              <div className="flex items-baseline justify-between">
                <dt className="font-semibold text-navy-900">Genel Toplam</dt>
                <dd className="text-xl font-extrabold text-brand-blue">{fmt(vadeFarki.toplam)}</dd>
              </div>
            </dl>
            <Button variant="accent" icon="check" className="mt-5 w-full justify-center">
              Ödemeyi Al
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Icon name="settings" size={13} /> 256-bit SSL ile güvenli ödeme
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
