/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optional fully-static output. Every route in this app is prerendered and all
  // state lives in the browser, so the app can also be published as plain files
  // on any static host:
  //
  //   STATIC_EXPORT=1 npm run build     → writes ./out
  //
  // The default build (used by netlify.toml) keeps the standard Next.js output
  // so future server features keep working without changing the config.
  ...(process.env.STATIC_EXPORT === "1"
    ? { output: "export", images: { unoptimized: true }, trailingSlash: true }
    : {}),
};

export default nextConfig;
