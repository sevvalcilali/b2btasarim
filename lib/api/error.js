// API hatası. Sunucu cevabı { hata: { kod, mesaj, alanlar? } } biçimindedir (docs/api/openapi.yaml → Hata).
// alanlar: { alanAdi: "mesaj" } — formlar sunucu hatasını ilgili alanın altında gösterir.
export class ApiError extends Error {
  constructor(status, body, message) {
    super(message || body?.mesaj || defaultMessage(status));
    this.name = "ApiHatasi";
    this.durum = status; // HTTP durum kodu; ağ hatasında 0
    this.kod = body?.kod || (status === 0 ? "AG_HATASI" : `HTTP_${status}`);
    this.alanlar = body?.alanlar || {};
  }

  get yetkiYok() {
    return this.durum === 401 || this.durum === 403;
  }

  get isKurali() {
    return this.durum === 409 || this.durum === 422;
  }
}

function defaultMessage(status) {
  if (status === 0) return "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip yeniden deneyin.";
  if (status === 401) return "Oturumunuz sona erdi. Yeniden giriş yapın.";
  if (status === 403) return "Bu işlem için yetkiniz yok.";
  if (status === 404) return "Kayıt bulunamadı.";
  if (status >= 500) return "Sunucuda bir sorun oluştu. Lütfen yeniden deneyin.";
  return "İstek tamamlanamadı.";
}
