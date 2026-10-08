// Sahte backend'in veritabanı: bellek içi tablolar. Tarayıcı oturumu boyunca sessionStorage'da kalıcıdır
// (sekme kapanınca tohuma döner); "Demo verisini sıfırla" da tohuma döndürür.
import * as tohum from "./tohum";

const ANAHTAR = "nkb-demo-db-v2"; // tohum biçimi değişince sürüm artar; eski kayıt yok sayılır
const TOHUM = Object.fromEntries(Object.entries(tohum));

const kopya = (v) => JSON.parse(JSON.stringify(v));

function yukle() {
  try {
    const kayit = typeof sessionStorage !== "undefined" && sessionStorage.getItem(ANAHTAR);
    if (kayit) {
      const db = JSON.parse(kayit);
      // tohuma sonradan eklenen tablolar eksikse tamamla
      for (const k of Object.keys(TOHUM)) if (!(k in db)) db[k] = kopya(TOHUM[k]);
      return db;
    }
  } catch (e) {
    /* bozuk kayıt → tohum */
  }
  return kopya(TOHUM);
}

let db = yukle();

function kaydet() {
  try {
    sessionStorage.setItem(ANAHTAR, JSON.stringify(db));
  } catch (e) {
    /* depolama kapalıysa yalnızca bellekte kalır */
  }
}

export const depo = {
  /** @returns {any[]|object} tablonun kendisi (okuma için) */
  tablo: (ad) => db[ad],

  /** Tabloyu fn(eski) → yeni ile değiştirir ve kalıcılaştırır */
  guncelle(ad, fn) {
    db[ad] = fn(db[ad]);
    kaydet();
    return db[ad];
  },

  /** Listeye kayıt ekler (en başa: listeler en yeniden eskiye sıralı) */
  ekle(ad, kayit) {
    return this.guncelle(ad, (l) => [kayit, ...l]);
  },

  /** anahtar alanı eşleşen kaydı fn ile değiştirir */
  degistir(ad, anahtarAlani, deger, fn) {
    let sonuc = null;
    this.guncelle(ad, (l) => l.map((k) => (k[anahtarAlani] === deger ? (sonuc = fn(k)) : k)));
    return sonuc;
  },

  sifirla() {
    db = kopya(TOHUM);
    kaydet();
  },
};
