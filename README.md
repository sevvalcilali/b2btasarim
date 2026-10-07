# N Kolay Bayim — B2B Panel

pay'n kolay **N Kolay Bayim** B2B ödeme paneli. Seçilen tasarım: **Bento (Tasarım 03)**.
Next.js (Pages Router) + Tailwind CSS. Yalnızca ön yüz: servis / API çağrısı **yok**, tüm veriler
`lib/mockData.js` içinde örnek veridir.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
```

Ana adres (`/`) Bento panelini açar (`/designs/bento` ile aynı sayfa).

## Özellikler

- **Rol değiştirici** (Ana Firma / Bayi / Alt Bayi): menü ve rakamlar role göre değişir.
- **Açık / koyu mod**; tercih tarayıcıda hatırlanır.
- **Giriş ekranı**: "Çıkış Yap" ile açılır, "Giriş Yap" panele döndürür.
- Bağlantıyla durum zorlama: `?theme=dark`, `?view=giris`, `?menu=closed`, `?role=ana|bayi|altbayi`.

## Yapı

```
components/   DesignIcons.js (ikon seti), CompanyLogo.js (firma logoları), RoleContext.js (seçili rol)
lib/          roles.js (3 rol), nav.js (role göre menü), mockData.js (örnek veri)
pages/        index.js (→ Bento), designs/bento.js (panel)
styles/       globals.css (Tailwind + yazı tipi)
arsiv/        Seçilmeyen tasarımlar (01 Atlas, 02 Horizon, 04 Nova, 05 Klasik), tasarım galerisi
              ve yalnızca onların kullandığı Icons.js — yorum satırında, derlemeye dahil değil.
```

## Notlar

- Bu bir mockup'tır; düğmeler ve menü öğeleri servis çağrısı yapmaz, sayfa değiştirmez.
- Arşivdeki bir tasarımı geri almak için satır başlarındaki `// ` (boş satırlarda `//`) kaldırılıp
  dosya eski yerine (dosyanın ilk satırlarında yazar) taşınmalı.
- Next.js sürümü 14.2.35. `npm audit`, self-hosted üretim sunucularını ilgilendiren ve bu
  mockup'ta kullanılmayan özelliklere dair uyarılar gösterebilir.
