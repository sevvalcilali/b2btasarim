# N Kolay Bayim — B2B Ödeme Paneli (Frontend Mockup)

pay'n kolay **N Kolay Bayim** B2B panelinin **frontend-only** mockup'ı.
Next.js (Pages Router) + Tailwind CSS. Backend / servis **yok** — tüm veriler `lib/mockData.js` içinde statiktir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
```

Giriş ekranında herhangi bir bilgiyle "Giriş Yap" → panele geçilir.

## Rol Değiştirici

Üst bardaki **Ana Firma / Bayi / Alt Bayi** düğmeleri ile üç panel tipi arasında geçiş yapılır.
Menüler ve ekranlar seçili role göre değişir (spec'teki "Panel Menüleri" yapısına uygun).

## Ekranlar

| Modül | Ekranlar |
|-------|----------|
| Ana Sayfa | KPI kartları (Başarılı/Başarısız/İptal/İade/Toplam), hacim grafiği, bakiye & borç, son işlemler |
| Ödeme Al | Manuel Ödeme, Link ile Ödeme, USD/Euro Kur Bilgisi |
| İptal / İade | Onay (onay/red), Takip |
| Raporlar | İşlem Detayları, Bayi/Alt Bayi Özet, Fatura Yükleme Detay |
| Bayi Tanım | Tanımlama (vade profili, taksit sınırı, limit, yetki), Liste |
| Ayarlar | Kullanıcı Tanım, Vade Farkı Profili (max 5), Firma Bilgileri |
| Duyuru | Bayi/Alt bayi ekranına pop-up duyuru (yalnız Ana Firma) |

## Yapı

```
components/   Layout, Sidebar, Topbar, DataTable, StatCard, Badge, ui.js, Icons.js
lib/          roles.js (3 rol), nav.js (role-aware menü), mockData.js (statik veri)
pages/        route bazlı ekranlar (Pages Router)
styles/       globals.css (Tailwind)
```

## Notlar

- Bu bir mockup'tır; form gönderimleri ve butonlar servis çağrısı yapmaz.
- Tasarım detayları (renk, tipografi, düzen) sonradan iyileştirilecek şekilde token'lar
  `tailwind.config.js` içinde tanımlıdır.
- Next.js sürümü 14.2.35 (yamalı). `npm audit`, self-hosted üretim sunucularını ilgilendiren
  ve bu mockup'ta kullanılmayan özelliklere dair uyarılar gösterebilir; temiz çözüm Next 16'ya
  geçiştir (breaking change).
