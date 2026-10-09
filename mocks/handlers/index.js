// Tüm uç noktalar. Her dosya lib/api altındaki karşılığıyla aynı adı taşır.
import { sessionHandlers } from "./session";
import { panelHandlers } from "./panel";
import { transactionsHandlers } from "./transactions";
import { dealersHandlers } from "./dealers";
import { companyHandlers } from "./company";
import { definitionsHandlers } from "./definitions";
import { customersHandlers } from "./customers";
import { paymentsHandlers } from "./payments";
import { linksHandlers } from "./links";
import { requestsHandlers } from "./requests";
import { invoicesHandlers } from "./invoices";
import { reportsHandlers } from "./reports";
import { usersHandlers } from "./users";
import { ratesHandlers } from "./rates";
import { balanceHandlers } from "./balance";
import { announcementsHandlers } from "./announcements";

export const handlers = [
  ...sessionHandlers,
  ...panelHandlers,
  ...transactionsHandlers,
  ...dealersHandlers,
  ...companyHandlers,
  ...definitionsHandlers,
  ...customersHandlers,
  ...paymentsHandlers,
  ...linksHandlers,
  ...requestsHandlers,
  ...invoicesHandlers,
  ...reportsHandlers,
  ...usersHandlers,
  ...ratesHandlers,
  ...balanceHandlers,
  ...announcementsHandlers,
];
