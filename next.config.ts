/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Desabilitar o Turbopack para compatibilidade com a configuração webpack
    turbo: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Apenas no cliente, substitua os módulos Node.js por vazios
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        worker_threads: false,
        path: false,
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        buffer: require.resolve("buffer/"),
        events: require.resolve("events/"),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
