/* eslint-disable @typescript-eslint/no-var-requires */
const withTM = require('next-transpile-modules')([
  '@project-serum/anchor',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-material-ui',
  '@solana/wallet-adapter-react',
  '@solana/wallet-adapter-react-ui',
  '@solana/wallet-adapter-bitpie',
  '@solana/wallet-adapter-blocto',
  '@solana/wallet-adapter-wallets',
]);

/** @type {import('next').NextConfig} */
module.exports = withTM({
  //reactStrictMode: true,
  //webpack5: true,
  webpack: (config, options) => {
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config;
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
});
