/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Sahte backend (msw/browser) yalnızca tarayıcıda vardır; sunucu paketinde boş modül sayılır.
  webpack: (config, { isServer }) => {
    if (isServer) config.resolve.alias["msw/browser"] = false;
    return config;
  },
  // Arşivlenen galeri ve tasarım adresleri (eski / paylaşılmış linkler) seçilen tasarıma, Bento'ya açılır.
  async redirects() {
    return [
      { source: "/designs", destination: "/", permanent: false },
      { source: "/designs/:slug(atlas|horizon|nova|klasik|kagit)", destination: "/", permanent: false },
    ];
  },
};

module.exports = nextConfig;
