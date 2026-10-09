// Sahte backend'in veritabanı: bellek içi tablolar. Tarayıcı oturumu boyunca sessionStorage'da kalıcıdır
// (sekme kapanınca tohuma döner); "Demo verisini sıfırla" da tohuma döndürür.
import * as seed from "./seed";

const KEY = "nkb-demo-db-v3"; // tohum biçimi değişince sürüm artar; eski kayıt yok sayılır
const SEED = Object.fromEntries(Object.entries(seed));

const clone = (v) => JSON.parse(JSON.stringify(v));

function upload() {
  try {
    const record = typeof sessionStorage !== "undefined" && sessionStorage.getItem(KEY);
    if (record) {
      const db = JSON.parse(record);
      // tohuma sonradan eklenen tablolar eksikse tamamla
      for (const k of Object.keys(SEED)) if (!(k in db)) db[k] = clone(SEED[k]);
      return db;
    }
  } catch (e) {
    /* bozuk kayıt → tohum */
  }
  return clone(SEED);
}

let db = upload();

function save() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    /* depolama kapalıysa yalnızca bellekte kalır */
  }
}

export const store = {
  /** @returns {any[]|object} tablonun kendisi (okuma için) */
  table: (name) => db[name],

  /** Tabloyu fn(eski) → yeni ile değiştirir ve kalıcılaştırır */
  update(name, fn) {
    db[name] = fn(db[name]);
    save();
    return db[name];
  },

  /** Listeye kayıt ekler (en başa: listeler en yeniden eskiye sıralı) */
  insert(name, record) {
    return this.update(name, (l) => [record, ...l]);
  },

  /** anahtar alanı eşleşen kaydı fn ile değiştirir */
  replace(name, keyField, value, fn) {
    let result = null;
    this.update(name, (l) => l.map((k) => (k[keyField] === value ? (result = fn(k)) : k)));
    return result;
  },

  reset() {
    db = clone(SEED);
    save();
  },
};
