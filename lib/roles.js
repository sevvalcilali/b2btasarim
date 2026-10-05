// Three panel roles defined in the N Kolay Bayim spec.
export const ROLES = {
  ANA_FIRMA: "ANA_FIRMA",
  BAYI: "BAYI",
  ALT_BAYI: "ALT_BAYI",
};

export const ROLE_META = {
  [ROLES.ANA_FIRMA]: {
    key: ROLES.ANA_FIRMA,
    label: "Ana Firma",
    short: "AF",
    company: "Brisa A.Ş.",
    logoColor: "#4F9B7C",
    parent: null,
    user: "Yönetici — Ana Firma",
    description: "Bayi ve alt bayilerin tümünü yöneten ana firma paneli",
  },
  [ROLES.BAYI]: {
    key: ROLES.BAYI,
    label: "Bayi",
    short: "BY",
    company: "Ankara Lastik Bayi Ltd.",
    logoColor: "#C2630F",
    parent: "Brisa A.Ş.",
    parentNote: "Brisa ağında bayi",
    user: "Yönetici — Bayi",
    description: "Alt bayilerini yöneten bayi paneli",
  },
  [ROLES.ALT_BAYI]: {
    key: ROLES.ALT_BAYI,
    label: "Alt Bayi",
    short: "AB",
    company: "Çankaya Oto Servis",
    logoColor: "#6B2E8F",
    parent: "Ankara Lastik Bayi Ltd.",
    parentNote: "Ankara Lastik Bayi'ye bağlı",
    user: "Yönetici — Alt Bayi",
    description: "Kendi işlemlerini yöneten alt bayi paneli",
  },
};

export const ROLE_ORDER = [ROLES.ANA_FIRMA, ROLES.BAYI, ROLES.ALT_BAYI];
