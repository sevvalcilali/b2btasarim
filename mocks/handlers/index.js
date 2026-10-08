// Tüm uç noktalar. Her dosya lib/api altındaki karşılığıyla aynı adı taşır.
import { oturumHandlers } from "./oturum";
import { panelHandlers } from "./panel";
import { islemlerHandlers } from "./islemler";
import { bayilerHandlers } from "./bayiler";
import { firmaHandlers } from "./firma";
import { tanimlarHandlers } from "./tanimlar";
import { musterilerHandlers } from "./musteriler";

export const handlers = [...oturumHandlers, ...panelHandlers, ...islemlerHandlers, ...bayilerHandlers, ...firmaHandlers, ...tanimlarHandlers, ...musterilerHandlers];
