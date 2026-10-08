// Tüm uç noktalar. Her dosya lib/api altındaki karşılığıyla aynı adı taşır.
import { oturumHandlers } from "./oturum";
import { panelHandlers } from "./panel";
import { islemlerHandlers } from "./islemler";
import { bayilerHandlers } from "./bayiler";
import { firmaHandlers } from "./firma";
import { tanimlarHandlers } from "./tanimlar";
import { musterilerHandlers } from "./musteriler";
import { odemelerHandlers } from "./odemeler";
import { linklerHandlers } from "./linkler";
import { taleplerHandlers } from "./talepler";
import { faturalarHandlers } from "./faturalar";
import { raporlarHandlers } from "./raporlar";

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
];
