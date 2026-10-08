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
pages/
  index.js              → Bento paneli
  designs/bento.js      panel kabuğu: rol, tema, giriş, ekranlar arası geçiş (?sayfa=)
components/
  DesignIcons.js        ikon seti
  CompanyLogo.js        firma logoları
  RoleContext.js        seçili rol
  bento/
    tema.js             renk değişkenleri (açık / koyu), animasyonlar, ortak sınıflar
    sayfalar.js         hazır ekranların adresleri (?sayfa=<anahtar> ↔ menü href)
    yardimci.js         tutar / tarih biçimleri, sayaç, eğri, durum renkleri
    ag.js               paylaşılan bayi / alt bayi / müşteri deposu, rol bazlı görünürlük
    ortak.js            Konum, Pencere, Bildirim, form alanları, müşteri seçici, kopyala
    odeme.js            manuel ve link ile ödemenin ortak müşteri bölümü, ödeme koşulları
    Kabuk.js            logo, sol menü, kullanıcı menüsü
    Giris.js            giriş ekranı
    ekranlar/           AnaSayfa, IslemDetaylari, ManuelOdeme, LinkOdeme,
                        IptalIade, BayiTanim, FaturaYukleme
lib/
  roles.js              3 rol
  nav.js                role göre menü (şartname s.2)
  mockData.js           örnek veri
styles/globals.css      Tailwind + yazı tipi
arsiv/                  seçilmeyen tasarımlar ve galeri — yorum satırında, derlemeye dahil değil
```

Yeni bir ekran eklemek için: `components/bento/ekranlar/` altına ekranı yazın, `sayfalar.js`'teki
`SAYFALAR` tablosuna adresini ekleyin ve `pages/designs/bento.js`'te ilgili koşulda çizdirin.
Menüdeki öğe kendiliğinden tıklanabilir olur.

## Notlar

- Bu bir mockup'tır; servis çağrısı yoktur. Hazır olmayan menü öğeleri henüz bir ekrana gitmez.
- Ekran içerikleri ve kuralları N Kolay Bayim şartnamesine (10 sayfalık PDF) göredir.
- Arşivdeki bir tasarımı geri almak için satır başlarındaki `// ` (boş satırlarda `//`) kaldırılıp
  dosya eski yerine (dosyanın ilk satırlarında yazar) taşınmalı.
- Next.js sürümü 14.2.35. `npm audit`, self-hosted üretim sunucularını ilgilendiren ve bu
  mockup'ta kullanılmayan özelliklere dair uyarılar gösterebilir.
