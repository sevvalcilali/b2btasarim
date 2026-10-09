// GET/POST /duyurular · PUT /duyurular/{id} · POST /duyurular/{id}/okundu — şartname s.2: ana firma duyuru girer,
// bayi / alt bayi ekranlarına pop-up düşer; "Okudum" kullanıcı bazında tutulur.
import { http, HttpResponse } from "msw";
import { store } from "../db/store";
import { audit, now } from "../rules";
import { latency, error, ruleError, uc, authorized } from "./helpers";

const TARGETS = ["BAYI", "ALT_BAYI"];
const read = (announcementId, userId) => store.table("announcementReads").some((o) => o.duyuruId === announcementId && o.kullaniciId === userId);
const roleAnnouncements = (caller) => store.table("announcements").filter((d) => d.durum === "YAYINDA" && d.hedef.includes(caller.rol));

/** Rozet: oturumdaki kullanıcının okumadığı yayındaki duyurular (ana firma hedef değildir) */
export const unreadAnnouncements = (caller) => (caller.rol === "ANA_FIRMA" ? [] : roleAnnouncements(caller).filter((d) => !read(d.duyuruId, caller.kullaniciId)));

function readState(d) {
  const companyKinds = new Set(d.hedef);
  const targetCompanies = new Set(store.table("companies").filter((f) => companyKinds.has(f.tur) && f.durum === "AKTIF").map((f) => f.firmaId));
  const targetCount = store.table("users").filter((k) => targetCompanies.has(k.firmaId) && k.durum === "AKTIF").length;
  return { hedefAdet: targetCount, okuyanAdet: store.table("announcementReads").filter((o) => o.duyuruId === d.duyuruId).length };
}

const admin = (caller) => caller.rol === "ANA_FIRMA" && caller.yetki === "YONETICI";

function announcementErrors(g) {
  const h = {};
  if (!g.baslik) h.baslik = "Başlık girin.";
  if (!g.icerik) h.icerik = "Duyuru metnini girin.";
  if (!g.hedef.length) h.hedef = "En az bir hedef seçin.";
  else if (g.hedef.some((r) => !TARGETS.includes(r))) h.hedef = "Hedef BAYI ya da ALT_BAYI olmalı.";
  if (!["YAYINDA", "ARSIV"].includes(g.durum)) h.durum = "Durum YAYINDA ya da ARSIV olmalı.";
  return h;
}

const clear = (g) => ({ baslik: String(g.baslik ?? "").trim(), icerik: String(g.icerik ?? "").trim(), hedef: Array.isArray(g.hedef) ? [...new Set(g.hedef)] : [], durum: g.durum });

async function readBody(request, caller) {
  if (!admin(caller)) return { cevap: error(403, "YETKI_YOK", "Duyuruyu yalnız ana firma Yöneticisi girer.") };
  const body = await request.json().catch(() => null);
  if (!body) return { cevap: error(400, "GECERSIZ_GOVDE", "İstek gövdesi okunamadı.") };
  const g = clear(body);
  const fields = announcementErrors(g);
  return Object.keys(fields).length ? { cevap: ruleError("DOGRULAMA", "Bazı alanlar hatalı.", fields) } : { g };
}

export const announcementsHandlers = [
  http.get(uc("/duyurular"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const records =
      caller.rol === "ANA_FIRMA"
        ? store.table("announcements").map((d) => ({ ...d, okunma: readState(d) }))
        : roleAnnouncements(caller).map((d) => ({ ...d, okundu: read(d.duyuruId, caller.kullaniciId) }));
    return HttpResponse.json({ kayitlar: [...records].sort((a, b) => b.tarih.localeCompare(a.tarih)), duzenlenebilir: admin(caller) });
  }),

  http.post(uc("/duyurular"), async ({ request }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    const { g, cevap: errorResponse } = await readBody(request, caller);
    if (errorResponse) return errorResponse;
    const order = Math.max(0, ...store.table("announcements").map((d) => Number(d.duyuruId.slice(2)))) + 1;
    const draft = { duyuruId: `D-${String(order).padStart(3, "0")}`, ...g, tarih: now().slice(0, 10), olusturma: audit(caller), sonDegisiklik: audit(caller) };
    store.insert("announcements", draft);
    return HttpResponse.json({ ...draft, okunma: readState(draft) }, { status: 201 });
  }),

  http.put(uc("/duyurular/:duyuruId"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    if (!store.table("announcements").some((d) => d.duyuruId === params.duyuruId)) return error(404, "DUYURU_YOK", "Duyuru bulunamadı.");
    const { g, cevap: errorResponse } = await readBody(request, caller);
    if (errorResponse) return errorResponse;
    const current = store.replace("announcements", "duyuruId", params.duyuruId, (d) => ({ ...d, ...g, sonDegisiklik: audit(caller) }));
    return HttpResponse.json({ ...current, okunma: readState(current) });
  }),

  http.post(uc("/duyurular/:duyuruId/okundu"), async ({ request, params }) => {
    await latency();
    const { kim: caller, cevap: response } = authorized(request);
    if (response) return response;
    if (!roleAnnouncements(caller).some((d) => d.duyuruId === params.duyuruId)) return error(404, "DUYURU_YOK", "Duyuru bulunamadı ya da size hedeflenmemiş.");
    if (!read(params.duyuruId, caller.kullaniciId)) store.insert("announcementReads", { duyuruId: params.duyuruId, kullaniciId: caller.kullaniciId });
    return new HttpResponse(null, { status: 204 });
  }),
];
