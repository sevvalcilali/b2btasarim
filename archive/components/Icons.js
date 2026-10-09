// ARŞİV — Bento (Tasarım 03) seçildiği için yorum satırına alındı; derlemeye ve sayfalara dahil değildir.
// Eski konumu: components/Icons.js. Geri almak için satır başlarındaki "// " (boş satırlarda "//") kaldırılıp dosya eski yerine taşınmalı.
//
// // Minimal inline SVG icon set (stroke-based, 1.6 width) used across the panel.
// const base = {
//   width: 20,
//   height: 20,
//   viewBox: "0 0 24 24",
//   fill: "none",
//   stroke: "currentColor",
//   strokeWidth: 1.7,
//   strokeLinecap: "round",
//   strokeLinejoin: "round",
// };
//
// const paths = {
//   home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
//   wallet: (
//     <>
//       <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v0" />
//       <path d="M3 7.5V17a3 3 0 0 0 3 3h13a1 1 0 0 0 1-1v-3" />
//       <path d="M21 11h-4a2 2 0 0 0 0 4h4v-4Z" />
//     </>
//   ),
//   refund: (
//     <>
//       <path d="M3 12a9 9 0 1 0 3-6.7" />
//       <path d="M3 4v4h4" />
//     </>
//   ),
//   report: (
//     <>
//       <path d="M6 3h9l5 5v13H6z" />
//       <path d="M14 3v6h6" />
//       <path d="M9 13h6M9 17h6" />
//     </>
//   ),
//   dealer: (
//     <>
//       <path d="M3 9 4.5 4h15L21 9" />
//       <path d="M4 9v11h16V9" />
//       <path d="M9 20v-6h6v6" />
//     </>
//   ),
//   settings: (
//     <>
//       <circle cx="12" cy="12" r="3" />
//       <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
//     </>
//   ),
//   megaphone: (
//     <>
//       <path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1Z" />
//       <path d="M18 8a4 4 0 0 1 0 8" />
//     </>
//   ),
//   link: <path d="M9 15l6-6M10.5 6.5 12 5a4 4 0 0 1 6 6l-1.5 1.5M13.5 17.5 12 19a4 4 0 0 1-6-6l1.5-1.5" />,
//   user: (
//     <>
//       <circle cx="12" cy="8" r="4" />
//       <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
//     </>
//   ),
//   bell: (
//     <>
//       <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
//       <path d="M10 19a2 2 0 0 0 4 0" />
//     </>
//   ),
//   search: (
//     <>
//       <circle cx="11" cy="11" r="7" />
//       <path d="m20 20-3.5-3.5" />
//     </>
//   ),
//   chevron: <path d="m9 6 6 6-6 6" />,
//   logout: <path d="M15 12H3m0 0 4-4m-4 4 4 4M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />,
//   plus: <path d="M12 5v14M5 12h14" />,
//   download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />,
//   upload: <path d="M12 21V9m0 0 4 4m-4-4-4 4M4 3h16" />,
//   check: <path d="m5 12 5 5L20 6" />,
//   x: <path d="M6 6l12 12M18 6 6 18" />,
//   excel: (
//     <>
//       <path d="M6 3h9l5 5v13H6z" />
//       <path d="M14 3v6h6" />
//       <path d="m9 13 4 5M13 13l-4 5" />
//     </>
//   ),
//   filter: <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" />,
//   building: (
//     <>
//       <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
//       <path d="M14 9h4a2 2 0 0 1 2 2v10M4 21h16" />
//       <path d="M8 7h2M8 11h2M8 15h2" />
//     </>
//   ),
//   exchange: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
// };
//
// export default function Icon({ name, className = "", size }) {
//   const dims = size ? { width: size, height: size } : {};
//   return (
//     <svg {...base} {...dims} className={className} aria-hidden="true">
//       {paths[name] || paths.home}
//     </svg>
//   );
// }
