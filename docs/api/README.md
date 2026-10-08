# N Kolay Bayim — API Sözleşmesi

Ekranlar veriyi `/api/v1` altındaki uç noktalardan HTTP ile alır. Sözleşmenin kendisi [`openapi.yaml`](./openapi.yaml)
dosyasıdır (OpenAPI 3.1; [Swagger Editor](https://editor.swagger.io) ile açılır). Bu sayfa özet ve yol haritasıdır.

## Katmanlar

```
Ekran (components/bento/ekranlar)  →  lib/sorgular (React Query kancaları)  →  lib/api (uç fonksiyonları, fetch)
                                                                                      ↓
                                                        ŞİMDİ: mocks/ (MSW, tarayıcıda, örnek veri)
                                                        SONRA: gerçek backend — NEXT_PUBLIC_API_URL
```

- `lib/api/istemci.js` tek fetch noktasıdır: adres, kimlik başlığı, zaman aşımı, hata dönüştürme.
- `mocks/kurallar.js` sunucu tarafı iş kurallarını (rol kapsamı, limitler, onay zinciri) çalışan kod olarak taşır;
  backend aynı kuralları uygulamalıdır.
- Örnek veri yalnızca `mocks/db/tohum.js` içindedir; ekranlar ona hiç erişmez.

## Genel kurallar

| Konu | Kural |
| --- | --- |
| Adres | `/api/v1/…`, kebab-case |
| Alan adları | camelCase |
| Durum / tür | Kod: `BASARILI`, `ALT_BAYI`, `ANA_FIRMA_ONAYINDA` — etiketler `lib/etiketler.js` |
| Para | Kuruş, tam sayı: `tutarKurus: 1240000` |
| Tarih | ISO 8601 saat dilimli; yalnız gün `YYYY-AA-GG` |
| Liste | `{ kayitlar, toplam, sayfa, boyut, sayaclar? }` — filtre ve arama sorgu parametresi, sunucuda |
| Hata | `{ hata: { kod, mesaj, alanlar? } }` + HTTP 400 / 401 / 403 / 404 / 409 / 422 / 500 |
| Kimlik | `Authorization: Bearer <token>`; rol ve firma tokendan |
| Ödeme | `Idempotency-Key` başlığı |
| Dosya | `multipart/form-data` |

## Uç noktalar ve durumu

| Ekran | Uç noktalar | Durum |
| --- | --- | --- |
| Oturum / kabuk | `GET /oturum` | ✅ sözleşme + sahte backend |
| | `GET /panel/bekleyenler` (menü rozetleri, okunmamış duyuru) | ✅ |
| Ana Sayfa | `GET /panel/ozet` · `GET /panel/haftalik-hacim` · `GET /panel/bakiye` · `GET /islemler?boyut=6` | ✅ |
| İşlem Detayları | `GET /islemler` | ✅ sözleşme + sahte backend + ekran |
| Bayi Özet / Alt Bayi Özet | `GET /raporlar/bayi-ozet` | ✅ |
| Bayi Fatura Özet / Alt Bayi Fatura Özet | `GET /raporlar/bayi-fatura-ozet` | ✅ |
| Manuel Ödeme | `GET /bayiler` · `GET /musteriler` · `GET /tahsilat-carileri` · `GET /firma` (ortaklar) · `GET /odeme/taksit-secenekleri` · `POST /odemeler` | ✅ |
| Link ile Ödeme | + `GET /odeme-linkleri` · `POST /odeme-linkleri` | ✅ |
| İptal / İade | `GET /iptal-iade-talepleri` · `GET …/uygun-islemler` · `POST …` · `POST …/{talepNo}/onay` · `POST …/{talepNo}/red` | ✅ |
| Bayi Tanım | `GET/POST /bayiler` · `GET/PUT /bayiler/{cariNo}` · `GET /firma` · `GET /vade-farki-profilleri` · `GET /uye-isyerleri` · `POST /musteriler` | ✅ |
| Cari Seçimi (bayi ana sayfa, alt bayi menü) | `PUT /oturum/aktif-uye-isyeri` · `GET /uye-isyerleri` | ✅ |
| Duyuru (ana firma yönetir, bayi ekranlarında pop-up) | `GET/POST /duyurular` · `PUT /duyurular/{id}` · `POST /duyurular/{id}/okundu` | ✅ |
| USD / Euro Kur Bilgisi | `GET /kurlar` | ✅ |
| Ana Firma / Bayi Bakiye ve Borç | `GET /bakiye/ekstre` | ✅ |
| Firma Bilgileri | `GET /firma` · `PUT /firma/iletisim` | ✅ |
| Kullanıcı Tanım | `GET/POST /kullanicilar` · `PUT /kullanicilar/{kullaniciId}` | ✅ |
| Vade Farkı Profil Tanım | `GET/POST /vade-farki-profilleri` · `PUT /vade-farki-profilleri/{id}` | ✅ |
| Excel ile Toplu Bayi / Alt Bayi Ekleme | `POST /bayiler/toplu/onizleme` · `POST /bayiler/toplu` (multipart) | ✅ |
| Toplu Bakiye ve Borç Yükleme | `POST /bakiye/toplu/onizleme` · `POST /bakiye/toplu` (multipart) | ✅ |
| Fatura Yükleme | `GET/POST /faturalar` · `POST /faturalar/{islemNo}/hatirlatma` · `POST /faturalar/{islemNo}/yukleme-linki` | ✅ |
| Yalnız demo | `POST /demo/sifirla` | ✅ (gerçek backend'de yok) |

## Demo kimlikleri

Üst bardaki rol değiştirici isteklere `Authorization: Bearer demo-<ROL>` yazar:

| Token | Kullanıcı | Firma |
| --- | --- | --- |
| `demo-ANA_FIRMA` | Mehmet Yılmaz (Yönetici) | Brisa A.Ş. `100.00.001` |
| `demo-BAYI` | Murat Aydın (Yönetici) | Ankara Lastik Bayi Ltd. `320.01.001` |
| `demo-ALT_BAYI` | Kemal Er (Yönetici) | Çankaya Oto Servis `540.02.011` |

Tüm hazır ekranlar bu uç noktalarla çalışır; ekran kodu örnek veriye erişmez. Yeni ekranlar aynı sırayla eklenir:
sözleşmeye uç nokta → `lib/api` fonksiyonu → `lib/sorgular` kancası → `mocks/handlers` cevabı → ekran.

## Backend ekibine teslim

- **Sözleşme:** `docs/api/openapi.yaml` — Swagger Editor'da açılır; her uç noktanın istek / cevap örneği var.
- **İş kuralları:** `mocks/kurallar.js` (rol kapsamı, bayi tanım sınırları, ödeme koşulları, onay zinciri, fatura kontrolü)
  ve `mocks/handlers/*.js` — backend'in uygulaması gereken kurallar, çalışan kod olarak.
- **Canlı örnek:** uygulamayı açıp Network sekmesinde her ekranın hangi isteği attığı ve ne beklediği görülür.
- **Geçiş:** `NEXT_PUBLIC_API_MOCK=false` ve `NEXT_PUBLIC_API_URL=<backend>/api/v1`; servisler tek tek de bağlanabilir
  (MSW eşleşmeyen isteği geçirir).

## Gerçek backend'e geçmeden önce (ön yüzde yapılacaklar)

Sahte backend'de etkisi olmayan, gerçek serviste önem kazanan noktalar (code review, 8 Ekim 2026):

1. **Idempotency-Key** ödeme denemesi başlarken üretilip kesin cevap gelene kadar aynı kalmalı (`lib/api/odemeler.js`);
   bugün her çağrıda yeni anahtar üretiliyor, zaman aşımı sonrası "Yeniden Dene" ikinci çekim yaratabilir.
2. **Açılışta rol:** kayıtlı rol mount sonrası uygulanıyor; ilk istekler varsayılan kimlikle gidip sonra tekrarlanıyor
   (`components/RoleContext.js`). Gerçek kimlik akışı gelince rol / token senkron okunmalı.
3. **Zaman aşımı uyumluluğu:** `AbortSignal.any` / `AbortSignal.timeout` olmayan tarayıcılar için manuel
   `AbortController` yedeği (`lib/api/istemci.js`).
4. **Safari pano:** fatura yükleme linki kopyalama, sunucu cevabı beklendiği için Safari'de reddedilebilir
   (`FaturaYukleme.js` → `LinkKopyala`); linki önce gösterip `KopyalaDugmesi` ile kopyalatmak yeterli.
5. **Tekrar:** `BayiTanim`, `IptalIade` ve `FaturaYukleme` kendi hata bağlayıcısını yazıyor; `odeme.js`'teki
   `hataBaglayici` ortak kullanılmalı.

## Backend ekibinin netleştireceği noktalar

1. Kimlik doğrulama ve klasik panelle ortak oturum (şartname s.10).
2. Ödemede kart tokenı: kart numarası backend'e açık gitmez; tokenı hangi sağlayıcı / 3D Secure akışı üretir?
3. Yeni kullanıcının şifresi: `POST /kullanicilar` kullanıcıyı açar; şifre belirleme / davet e-postasını backend gönderir (ekranda yalnız not var).
4. Bakiye / borç ve ekstre hareketlerinin kaynağı (ERP / cari hesap entegrasyonu?) — demo, borç yüklemelerini ve ödemeleri işlem tablosundan türetir; kur bilgisi kaynağı (TCMB?).
5. Cari seçimi: "Ana Firma Cari Seçimi" / "Bayi Carisi Seçimi" ana firmanın üye işyerlerinden (s.1) birini seçmek olarak yorumlandı; seçim oturumda tutulur (`aktifUyeIsyeri`), ödeme formundaki tahsilat carisinin varsayılanı olur ve işleme `uyeIsyeriCariNo` olarak da yazılır. Ödemenin işlendiği cari formdaki `tahsilatCariNo`dur.
6. Firma Bilgileri: bayi / alt bayinin iletişim bilgisini kendisinin güncelleyebildiği varsayıldı (`PUT /firma/iletisim`); tanım alanları üst firmada kalır.
7. Toplu yükleme dosyaları: örnek sunucu yalnız CSV okur (`mocks/csv.js`); gerçek backend .xlsx da kabul etmeli. Sütun adları şablonda; satır doğrulama kuralları bayi tanımıyla aynı (`kimlikHatalari`, `kosulHatalari`).
8. Vade farkı formülü: sunucu `GET /odeme/taksit-secenekleri` ile hesaplar; mockup varsayımı tutar × oran × (taksit − 1).
