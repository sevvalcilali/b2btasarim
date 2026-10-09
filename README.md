# N Kolay Bayim — B2B Panel

pay'n kolay **N Kolay Bayim** B2B ödeme paneli. Seçilen tasarım: **Bento (Tasarım 03)**.
Next.js (Pages Router) + Tailwind CSS + React Query. Ekranlar veriyi `/api/v1` uç noktalarından
HTTP ile alır; şimdilik bu istekleri tarayıcıdaki **sahte backend** (MSW, `mocks/`) örnek veriyle cevaplar.
Sözleşme: [`docs/api/openapi.yaml`](docs/api/openapi.yaml) · özet: [`docs/api/README.md`](docs/api/README.md).
Sonra bakılacak tasarım fikirleri: [`docs/backlog.md`](docs/backlog.md).

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
```

Ana adres (`/`) Bento panelini açar (`/designs/bento` ile aynı sayfa).

### Veri kaynağı

| Ortam | Ayar (`.env.local`, bkz. `.env.example`) | Sonuç |
| --- | --- | --- |
| Geliştirme / demo (öntanımlı) | `NEXT_PUBLIC_API_MOCK=true` | Sahte backend `/api/v1` adresine cevap verir; veri sekme oturumu boyunca kalıcıdır |
| Backend entegrasyonu | `NEXT_PUBLIC_API_MOCK=false` · `NEXT_PUBLIC_API_URL=https://…/api/v1` | Gerçek backend; ekran kodu değişmez |

Kullanıcı menüsündeki **Demo verisini sıfırla** sahte backend'i başlangıç verisine döndürür.
Üst bardaki rol değiştirici isteklere `Authorization: Bearer demo-<ROL>` yazar; gerçek ortamda gizlenir.

## Özellikler

- **Rol değiştirici** (Ana Firma / Bayi / Alt Bayi): menü ve rakamlar role göre değişir.
- **Açık / koyu mod**; tercih tarayıcıda hatırlanır.
- **Giriş ekranı**: "Çıkış Yap" ile açılır, "Giriş Yap" panele döndürür.
- **Komut paleti**: `⌘K` / `Ctrl+K` ya da `/` ile açılır. Ekran adı, işlem (no, unvan, cari, vergi no, kart son 4) ve
  bayi araması; işlem seçilince İşlem Detayları o aramayla (`?ara=`), bayi seçilince Bayi Liste detay paneliyle (`?detay=`)
  açılır, `Ctrl+Enter` bayiden ödeme alır. Tema, panel tipi ve çıkış da buradan.
- **Telefonda kart görünümü**: 768px altında tablolar kart listesine dönüşür (`TABLE_CSS`, hücrelerde `data-label` /
  `data-card`). Kalabalık filtreler (İşlem Detayları, Bayi Özet, Bayi Fatura Özet) alttan açılan çekmeceye taşınır.
- **Ödeme sonucu**: animasyonlu onay işareti, sayarak gelen tutar, dekont kartı; dekont PNG olarak indirilir,
  paylaşılır (cihazın paylaşım menüsü, yoksa panoya kopyalanır) ya da yazdırılır. Link ile ödemede WhatsApp / e-posta paylaşımı.
- Bağlantıyla durum zorlama: `?theme=dark`, `?view=giris`, `?menu=closed`, `?role=ana|bayi|altbayi`.

## Yapı

```
pages/
  index.js              → Bento paneli
  designs/bento.js      panel kabuğu: rol, tema, giriş, ekranlar arası geçiş (?sayfa=)
components/
  DesignIcons.js        ikon seti
  CompanyLogo.js        firma logoları
  RoleContext.js        seçili rol
  bento/
    theme.js            renk değişkenleri (açık / koyu), animasyonlar, ortak sınıflar
    routes.js           hazır ekranların adresleri (?sayfa=<anahtar> ↔ menü href)
    helpers.js          tutar / tarih biçimleri, sayaç, eğri, durum renkleri
    shared.js           Breadcrumb, Modal, Drawer, BottomSheet, Notice, form alanları, müşteri seçici, kopyala
    CommandPalette.js   ⌘K komut paleti ve üst bardaki arama düğmesi
    PaymentSuccess.js   ödeme sonucu: sonuç işareti, dekont kartı, dekont indirme / paylaşma
    payment.js          manuel ve link ile ödemenin ortak müşteri bölümü, ödeme koşulları
    Shell.js            logo, sol menü, kullanıcı menüsü
    Login.js            giriş ekranı
    screens/            Dashboard, TransactionDetails, ManualPayment, LinkPayment,
                        CancelRefund, DealerDefinition, InvoiceUpload
lib/
  api/                  uç nokta fonksiyonları (client.js tek fetch noktası, error.js ApiError, session.js …)
  queries/              React Query kancaları (keys.js önbellek anahtarları, provider.js QueryClient)
  format.js             kuruş → ₺, ISO → tarih; labels.js kod → ekran etiketi
  roles.js              3 rol (rol değiştirici etiketleri)
  nav.js                role göre menü (şartname s.2)
mocks/
  start.js              MSW servis çalışanını başlatır (yalnızca tarayıcı, NEXT_PUBLIC_API_MOCK=true)
  db/seed.js             başlangıç verisi, ham biçim (kuruş, ISO, kod) · db/store.js bellek içi tablolar + sessionStorage
  rules.js              sunucu kuralları: oturum, rol kapsamı, sayfalama
  handlers/             uç nokta cevapları (lib/api ile aynı dosya adları)
docs/api/               openapi.yaml (sözleşme) · README.md (özet, uç nokta durumu)
docs/backlog.md         yapılabilirler listesi (sonra bakılacak tasarım fikirleri)
public/mockServiceWorker.js   MSW servis çalışanı (üretilmiş dosya, elle değiştirilmez)
styles/globals.css      Tailwind + yazı tipi
archive/                seçilmeyen tasarımlar ve galeri — yorum satırında, derlemeye dahil değil
```

Yeni bir ekran eklemek için: `components/bento/screens/` altına ekranı yazın, `routes.js`'teki
`ROUTES` tablosuna adresini ekleyin ve `pages/designs/bento.js`'te ilgili koşulda çizdirin.
Menüdeki öğe kendiliğinden tıklanabilir olur.

Ekranın verisi için sıra: `docs/api/openapi.yaml`'a uç noktayı yaz → `lib/api/<kaynak>.js` fonksiyonu →
`lib/queries/<kaynak>.js` kancası → `mocks/handlers/<kaynak>.js` cevabı. Ekran yalnızca kancayı çağırır;
yükleniyor / hata / boş durumları `components/bento/states.js`'ten gelir.

## Notlar

- Tüm ekranlar `/api/v1` uç noktalarıyla çalışır; örnek veri yalnızca sahte backend'in tohumunda (`mocks/db/seed.js`) bulunur,
  ekranlar ona hiç erişmez. Hazır olmayan menü öğeleri henüz bir ekrana gitmez.
- Ekran içerikleri ve kuralları N Kolay Bayim şartnamesine (10 sayfalık PDF) göredir.
- Arşivdeki bir tasarımı geri almak için satır başlarındaki `// ` (boş satırlarda `//`) kaldırılıp
  dosya eski yerine (dosyanın ilk satırlarında yazar) taşınmalı.
- Next.js sürümü 14.2.35. `npm audit`, self-hosted üretim sunucularını ilgilendiren ve bu
  mockup'ta kullanılmayan özelliklere dair uyarılar gösterebilir.
