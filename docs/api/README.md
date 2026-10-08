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
| | `GET /panel/bekleyenler` | ⏳ adım 2 |
| Ana Sayfa | `GET /panel/ozet` · `GET /panel/haftalik-hacim` · `GET /islemler?boyut=6` | ⏳ adım 2 |
| İşlem Detayları | `GET /islemler` | ⏳ adım 1 |
| Manuel Ödeme | `GET /musteriler` · `GET /tahsilat-carileri` · `GET /firma/ortaklar` · `GET /odeme/taksit-secenekleri` · `POST /odemeler` | ⏳ adım 4 |
| Link ile Ödeme | + `GET /odeme-linkleri` · `POST /odeme-linkleri` | ⏳ adım 4 |
| İptal / İade | `GET /iptal-iade-talepleri` · `GET …/uygun-islemler` · `POST …` · `POST …/{id}/onay` · `POST …/{id}/red` | ⏳ adım 5 |
| Bayi Tanım | `GET/POST /bayiler` · `GET/PUT /bayiler/{cariNo}` · `GET /alt-bayiler` · `GET /vade-farki-profilleri` · `GET /uye-isyerleri` | ⏳ adım 3 |
| Fatura Yükleme | `GET/POST /faturalar` · `POST /faturalar/{islemNo}/hatirlatma` · `POST /faturalar/{islemNo}/yukleme-linki` | ⏳ adım 6 |
| Yalnız demo | `POST /demo/sifirla` | ✅ (gerçek backend'de yok) |

## Demo kimlikleri

Üst bardaki rol değiştirici isteklere `Authorization: Bearer demo-<ROL>` yazar:

| Token | Kullanıcı | Firma |
| --- | --- | --- |
| `demo-ANA_FIRMA` | Mehmet Yılmaz (Yönetici) | Brisa A.Ş. `100.00.001` |
| `demo-BAYI` | Murat Aydın (Yönetici) | Ankara Lastik Bayi Ltd. `320.01.001` |
| `demo-ALT_BAYI` | Kemal Er (Yönetici) | Çankaya Oto Servis `540.02.011` |

## Backend ekibinin netleştireceği noktalar

1. Kimlik doğrulama ve klasik panelle ortak oturum (şartname s.10).
2. Ödemede kart tokenı: kart numarası backend'e açık gitmez; tokenı hangi sağlayıcı / 3D Secure akışı üretir?
3. Vade farkı formülü: sunucu `GET /odeme/taksit-secenekleri` ile hesaplar; mockup varsayımı tutar × oran × (taksit − 1).
