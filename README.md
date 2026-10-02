# N Kolay Bayim — B2B Panel UI Tasarımları

pay'n kolay **N Kolay Bayim** B2B ödeme paneli için hazırlanmış **6 tasarım yönü**.
Next.js (Pages Router) + Tailwind CSS. Yalnızca ön yüz: servis / API çağrısı **yok**, tüm veriler
`lib/mockData.js` içinde örnek veridir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
```

Ana adres (`/`) tasarım galerisini açar; her kart ilgili tasarıma götürür.

## Tasarımlar

| # | Adres | Özet |
|---|-------|------|
| 01 | `/designs/atlas` | Marka mavisi, açılır kapanır sol menü, ince üst bar, ölçekli çubuk grafik |
| 02 | `/designs/horizon` | Beyaz sol menü, mavi hero bandı ve alan grafiği, hızlı işlemler |
| 03 | `/designs/bento` | Lavanta zeminde yüzen paneller, renkli KPI blokları, animasyonlar |
| 04 | `/designs/nova` | Mavi tonlu kartlar, daraltılabilir menü, karşılama bandı, etkileşimli grafik |
| 05 | `/designs/klasik` | Lacivert menü, renkli KPI rakamları, banka kartı görünümlü bakiye |
| 06 | `/designs/kagit` | Broadsheet editoryal: serif tipografi, yan menü + üst kısayol menüsü |

Her tasarımda:

- **Rol değiştirici** (Ana Firma / Bayi / Alt Bayi): menü ve rakamlar role göre değişir.
- **Açık / koyu mod**; tercih tarayıcıda hatırlanır.
- **Giriş ekranı**: "Çıkış Yap" ile açılır, "Giriş Yap" panele döndürür.
- Bağlantıyla durum zorlama: `?theme=dark`, `?view=giris`, `?menu=closed` (Nova ve Klasik'te `?menu=rail`).

## Yapı

```
components/   DesignIcons.js, Icons.js (ikon setleri), RoleContext.js (seçili rol)
lib/          roles.js (3 rol), nav.js (role göre menü), mockData.js (örnek veri)
pages/        index.js (galeri), designs/ (galeri + 6 tasarım)
styles/       globals.css (Tailwind + yazı tipleri)
```

## Notlar

- Bu bir mockup'tır; düğmeler ve menü öğeleri servis çağrısı yapmaz, sayfa değiştirmez.
- Next.js sürümü 14.2.35. `npm audit`, self-hosted üretim sunucularını ilgilendiren ve bu
  mockup'ta kullanılmayan özelliklere dair uyarılar gösterebilir.
