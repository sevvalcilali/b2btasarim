// Tüm uç noktalar. Her dosya lib/api altındaki karşılığıyla aynı adı taşır.
import { oturumHandlers } from "./oturum";
import { panelHandlers } from "./panel";
import { islemlerHandlers } from "./islemler";

export const handlers = [...oturumHandlers, ...panelHandlers, ...islemlerHandlers];
