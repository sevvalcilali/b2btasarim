// Tüm uç noktalar. Her dosya lib/api altındaki karşılığıyla aynı adı taşır.
import { oturumHandlers } from "./session";
import { panelHandlers } from "./panel";
import { islemlerHandlers } from "./transactions";
import { bayilerHandlers } from "./dealers";
import { firmaHandlers } from "./company";
import { tanimlarHandlers } from "./definitions";
import { musterilerHandlers } from "./customers";
import { odemelerHandlers } from "./payments";
import { linklerHandlers } from "./links";
import { taleplerHandlers } from "./requests";
import { faturalarHandlers } from "./invoices";
import { raporlarHandlers } from "./reports";
import { kullanicilarHandlers } from "./users";
import { kurlarHandlers } from "./rates";
import { bakiyeHandlers } from "./balance";
import { duyurularHandlers } from "./announcements";

export const handlers = [
  ...oturumHandlers,
  ...panelHandlers,
  ...islemlerHandlers,
  ...bayilerHandlers,
  ...firmaHandlers,
  ...tanimlarHandlers,
  ...musterilerHandlers,
  ...odemelerHandlers,
  ...linklerHandlers,
  ...taleplerHandlers,
  ...faturalarHandlers,
  ...raporlarHandlers,
  ...kullanicilarHandlers,
  ...kurlarHandlers,
  ...bakiyeHandlers,
  ...duyurularHandlers,
];
