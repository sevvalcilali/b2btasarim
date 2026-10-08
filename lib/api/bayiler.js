// Bayi / alt bayi uçları. Sözleşme: docs/api/openapi.yaml → /bayiler
import { istek } from "./istemci";

/**
 * @param {object} [filtre]
 * @param {"BAYI"|"ALT_BAYI"} [filtre.tur]  ana firma: bayileri ya da ağdaki tüm alt bayileri; bayi: yalnız kendi alt bayileri
 * @param {"AKTIF"|"PASIF"} [filtre.durum]
 * @param {string} [filtre.q]               unvan, cari no, vergi no
 */
export const bayileriGetir = (filtre, sinyal) => istek("/bayiler", { sorgu: filtre, sinyal });

export const bayiGetir = (cariNo, sinyal) => istek(`/bayiler/${encodeURIComponent(cariNo)}`, { sinyal });

/** @param {object} govde  BayiGirdisi (tur, unvan, cariNo, vergiNo, telefon, email, adres, vadeProfilId, taksitler, islemLimitiKurus, altBayiYetkisi?, uyeIsyerleri, durum) */
export const bayiOlustur = (govde) => istek("/bayiler", { yontem: "POST", govde });

/** Excel / CSV ile toplu ekleme (şartname s.2, s.10): önizleme hiçbir kaydı yazmaz; kaydet geçerli satırları ekler */
function topluForm(dosya) {
  const fd = new FormData();
  fd.append("dosya", dosya);
  return fd;
}
export const bayiTopluOnizle = (dosya) => istek("/bayiler/toplu/onizleme", { yontem: "POST", govde: topluForm(dosya) });
export const bayiTopluEkle = (dosya) => istek("/bayiler/toplu", { yontem: "POST", govde: topluForm(dosya) });

export const bayiGuncelle = (cariNo, govde) => istek(`/bayiler/${encodeURIComponent(cariNo)}`, { yontem: "PUT", govde });
