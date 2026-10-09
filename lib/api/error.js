// API hatası. Sunucu cevabı { hata: { kod, mesaj, alanlar? } } biçimindedir (docs/api/openapi.yaml → Hata).
// alanlar: { alanAdi: "mesaj" } — formlar sunucu hatasını ilgili alanın altında gösterir.
export class ApiHatasi extends Error {
  constructor(durum, govde, mesaj) {
    super(mesaj || govde?.mesaj || varsayilanMesaj(durum));
    this.name = "ApiHatasi";
    this.durum = durum; // HTTP durum kodu; ağ hatasında 0
    this.kod = govde?.kod || (durum === 0 ? "AG_HATASI" : `HTTP_${durum}`);
    this.alanlar = govde?.alanlar || {};
  }

  get yetkiYok() {
    return this.durum === 401 || this.durum === 403;
  }

  get isKurali() {
    return this.durum === 409 || this.durum === 422;
  }
}

function varsayilanMesaj(durum) {
  if (durum === 0) return "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip yeniden deneyin.";
  if (durum === 401) return "Oturumunuz sona erdi. Yeniden giriş yapın.";
  if (durum === 403) return "Bu işlem için yetkiniz yok.";
  if (durum === 404) return "Kayıt bulunamadı.";
  if (durum >= 500) return "Sunucuda bir sorun oluştu. Lütfen yeniden deneyin.";
  return "İstek tamamlanamadı.";
}
